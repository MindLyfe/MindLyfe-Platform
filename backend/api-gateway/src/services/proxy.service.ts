import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly httpClients: Map<string, AxiosInstance> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeHttpClients();
  }

  private initializeHttpClients() {
    const services = this.configService.get('services');
    
    Object.keys(services).forEach(serviceName => {
      const serviceConfig = services[serviceName];
      const client = axios.create({
        baseURL: serviceConfig.url,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add request interceptor for logging
      client.interceptors.request.use(
        (config) => {
          this.logger.debug(`Proxying request to ${serviceName}: ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          this.logger.error(`Request error for ${serviceName}:`, error.message);
          return Promise.reject(error);
        }
      );

      // Add response interceptor for logging
      client.interceptors.response.use(
        (response) => {
          this.logger.debug(`Response from ${serviceName}: ${response.status}`);
          return response;
        },
        (error) => {
          this.logger.error(`Response error from ${serviceName}:`, error.message);
          return Promise.reject(error);
        }
      );

      this.httpClients.set(serviceName, client);
    });
  }

  async forwardRequest(
    serviceName: string,
    path: string,
    method: string,
    data?: any,
    headers?: Record<string, string>,
    params?: Record<string, any>
  ) {
    const client = this.httpClients.get(serviceName);
    if (!client) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: path,
      data,
      headers: {
        ...headers,
        // Remove host header to avoid conflicts
        host: undefined,
      },
      params,
      // Don't follow redirects
      maxRedirects: 0,
      // Preserve cookies
      withCredentials: true,
    };

    try {
      const response = await client.request(config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        return {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
        };
      }
      throw error;
    }
  }

  getServiceUrl(serviceName: string): string {
    const services = this.configService.get('services');
    return services[serviceName]?.url || '';
  }
}