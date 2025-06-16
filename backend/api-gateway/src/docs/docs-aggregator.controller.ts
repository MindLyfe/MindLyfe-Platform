import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Response } from 'express';
import { DocsAggregatorService } from './docs-aggregator.service';

@ApiTags('Documentation')
@Controller('docs')
export class DocsAggregatorController {
  constructor(private readonly docsAggregatorService: DocsAggregatorService) {}

  @Public()
  @Get('aggregated')
  @ApiOperation({ 
    summary: 'Get aggregated API documentation',
    description: 'Returns combined Swagger documentation from all MindLyf microservices'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Aggregated OpenAPI 3.0 specification from all services'
  })
  async getAggregatedDocs(@Res() res: Response) {
    const aggregatedDocs = await this.docsAggregatorService.getAggregatedDocs();
    res.setHeader('Content-Type', 'application/json');
    res.send(aggregatedDocs);
  }

  @Public()
  @Get('services/status')
  @ApiOperation({ 
    summary: 'Get service documentation status',
    description: 'Returns the availability status of documentation for each microservice'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service documentation status overview',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          serviceName: { type: 'string', example: 'chat' },
          url: { type: 'string', example: 'http://localhost:3003/api-docs-json' },
          status: { type: 'string', enum: ['available', 'unavailable', 'error'], example: 'available' },
          lastUpdated: { type: 'string', format: 'date-time' },
          error: { type: 'string', nullable: true }
        }
      }
    }
  })
  async getServiceStatus() {
    return this.docsAggregatorService.getServiceStatus();
  }

  @Public()
  @Get('refresh')
  @ApiOperation({ 
    summary: 'Refresh documentation cache',
    description: 'Forces a refresh of the cached documentation from all services'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Documentation cache refreshed successfully'
  })
  async refreshCache() {
    await this.docsAggregatorService.refreshCache();
    return { 
      message: 'Documentation cache refreshed successfully',
      timestamp: new Date().toISOString()
    };
  }
} 