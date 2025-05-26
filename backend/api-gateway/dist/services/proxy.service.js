"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let ProxyService = ProxyService_1 = class ProxyService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ProxyService_1.name);
        this.httpClients = new Map();
        this.initializeHttpClients();
    }
    initializeHttpClients() {
        const services = this.configService.get('services');
        Object.keys(services).forEach(serviceName => {
            const serviceConfig = services[serviceName];
            const client = axios_1.default.create({
                baseURL: serviceConfig.url,
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            client.interceptors.request.use((config) => {
                var _a;
                this.logger.debug(`Proxying request to ${serviceName}: ${(_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()} ${config.url}`);
                return config;
            }, (error) => {
                this.logger.error(`Request error for ${serviceName}:`, error.message);
                return Promise.reject(error);
            });
            client.interceptors.response.use((response) => {
                this.logger.debug(`Response from ${serviceName}: ${response.status}`);
                return response;
            }, (error) => {
                this.logger.error(`Response error from ${serviceName}:`, error.message);
                return Promise.reject(error);
            });
            this.httpClients.set(serviceName, client);
        });
    }
    async forwardRequest(serviceName, path, method, data, headers, params) {
        const client = this.httpClients.get(serviceName);
        if (!client) {
            throw new Error(`Service ${serviceName} not found`);
        }
        const config = {
            method: method.toLowerCase(),
            url: path,
            data,
            headers: Object.assign(Object.assign({}, headers), { host: undefined }),
            params,
            maxRedirects: 0,
            withCredentials: true,
        };
        try {
            const response = await client.request(config);
            return {
                data: response.data,
                status: response.status,
                headers: response.headers,
            };
        }
        catch (error) {
            if (error.response) {
                return {
                    data: error.response.data,
                    status: error.response.status,
                    headers: error.response.headers,
                };
            }
            throw error;
        }
    }
    getServiceUrl(serviceName) {
        var _a;
        const services = this.configService.get('services');
        return ((_a = services[serviceName]) === null || _a === void 0 ? void 0 : _a.url) || '';
    }
};
ProxyService = ProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProxyService);
exports.ProxyService = ProxyService;
//# sourceMappingURL=proxy.service.js.map