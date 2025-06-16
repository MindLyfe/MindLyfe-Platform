import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ServiceDocumentation {
  serviceName: string;
  url: string;
  docs: any;
  status: 'available' | 'unavailable' | 'error';
  lastUpdated: Date;
  error?: string;
}

@Injectable()
export class DocsAggregatorService {
  private readonly logger = new Logger(DocsAggregatorService.name);
  private cachedDocs: Map<string, ServiceDocumentation> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Get aggregated documentation from all services
   */
  async getAggregatedDocs(): Promise<any> {
    const services = this.getServiceConfigs();
    const serviceDocs = await Promise.allSettled(
      services.map(service => this.fetchServiceDocs(service))
    );

    const aggregatedDocument = {
      openapi: '3.0.0',
      info: {
        title: 'MindLyf Platform - Complete API Documentation',
        description: 'Comprehensive documentation of all MindLyf microservices',
        version: '1.0.0'
      },
      paths: {},
      components: {
        securitySchemes: {
          'JWT-auth': {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {}
      },
      tags: []
    };

    serviceDocs.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.docs) {
        const serviceDoc = result.value;
        const docs = serviceDoc.docs;
        
        if (docs.paths) {
          Object.keys(docs.paths).forEach(path => {
            const cleanPath = path.replace(/^\/api\/v\d+/, '');
            const prefixedPath = `/api/${serviceDoc.serviceName}${cleanPath}`;
            aggregatedDocument.paths[prefixedPath] = docs.paths[path];
          });
        }

        if (docs.components?.schemas) {
          Object.assign(aggregatedDocument.components.schemas, docs.components.schemas);
        }

        if (docs.tags) {
          aggregatedDocument.tags.push(...docs.tags);
        }
      }
    });

    return aggregatedDocument;
  }

  /**
   * Get service status overview
   */
  async getServiceStatus(): Promise<ServiceDocumentation[]> {
    const services = this.getServiceConfigs();
    const results = await Promise.allSettled(
      services.map(service => this.fetchServiceDocs(service))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          serviceName: services[index].name,
          url: services[index].docsUrl,
          docs: null,
          status: 'error',
          lastUpdated: new Date(),
          error: result.reason?.message || 'Unknown error'
        };
      }
    });
  }

  /**
   * Refresh documentation cache for all services
   */
  async refreshCache(): Promise<void> {
    this.logger.log('Refreshing documentation cache for all services');
    this.cachedDocs.clear();
    await this.getAggregatedDocs();
    this.logger.log('Documentation cache refreshed successfully');
  }

  private async fetchServiceDocs(service: { name: string; docsUrl: string }): Promise<ServiceDocumentation> {
    const cacheKey = service.name;
    const cached = this.cachedDocs.get(cacheKey);
    
    // Return cached if still valid
    if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheTimeout) {
      return cached;
    }

    try {
      this.logger.debug(`Fetching docs from ${service.name}: ${service.docsUrl}`);
      
      const response = await firstValueFrom(
        this.httpService.get(service.docsUrl, { timeout: 5000 })
      );

      const serviceDoc: ServiceDocumentation = {
        serviceName: service.name,
        url: service.docsUrl,
        docs: response.data,
        status: 'available',
        lastUpdated: new Date()
      };

      this.cachedDocs.set(cacheKey, serviceDoc);
      this.logger.debug(`Successfully fetched docs from ${service.name}`);
      return serviceDoc;

    } catch (error) {
      this.logger.warn(`Failed to fetch docs from ${service.name}: ${error.message}`);
      
      const serviceDoc: ServiceDocumentation = {
        serviceName: service.name,
        url: service.docsUrl,
        docs: null,
        status: 'unavailable',
        lastUpdated: new Date(),
        error: error.message
      };

      this.cachedDocs.set(cacheKey, serviceDoc);
      return serviceDoc;
    }
  }

  private getServiceConfigs(): Array<{ name: string; docsUrl: string }> {
    return [
      { name: 'chat', docsUrl: 'http://chat-service:3003/api-docs-json' },
      { name: 'auth', docsUrl: 'http://auth-service:3001/api-docs-json' },
      { name: 'teletherapy', docsUrl: 'http://teletherapy-service:3002/api-docs-json' },
      { name: 'community', docsUrl: 'http://community-service:3004/api-docs-json' },
      { name: 'notifications', docsUrl: 'http://notification-service:3005/api-docs-json' }
    ];
  }
} 