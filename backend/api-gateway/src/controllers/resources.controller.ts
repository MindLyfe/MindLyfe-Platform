import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  Res, 
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery,
  ApiBody,
  ApiConsumes
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ProxyService } from '../services/proxy.service';

// Define Multer file type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@ApiTags('Resources')
@ApiBearerAuth()
@Controller('resources')
export class ResourcesController {
  private readonly logger = new Logger(ResourcesController.name);

  constructor(private readonly proxyService: ProxyService) {}

  // ==================== RESOURCE MANAGEMENT ENDPOINTS ====================

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get resources',
    description: 'Get paginated list of resources with filtering options'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (anxiety, depression, mindfulness, etc.)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type (article, video, audio, document, etc.)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (public, private)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title and description' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order (latest, popular, title, category)' })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getResources(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources', req, res);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Create new resource',
    description: 'Create a new resource with optional file upload (admin/support only)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid resource data' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin/support only' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createResource(@UploadedFile() file: MulterFile, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources', req, res);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get resource details',
    description: 'Get detailed information about a specific resource'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getResource(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/${id}`, req, res);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update resource',
    description: 'Update resource information (admin/support only)'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid resource data' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin/support only' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateResource(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/${id}`, req, res);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Delete resource',
    description: 'Delete a resource and its associated file (admin/support only)'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin/support only' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteResource(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/${id}`, req, res);
  }

  // ==================== FILE MANAGEMENT ENDPOINTS ====================

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Download resource file',
    description: 'Download the file associated with a resource'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Resource or file not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async downloadResource(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/${id}/download`, req, res);
  }

  @Post(':id/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Upload new file for resource',
    description: 'Replace or add file to an existing resource (admin/support only)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or resource data' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin/support only' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadResourceFile(@Param('id') id: string, @UploadedFile() file: MulterFile, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/${id}/upload`, req, res);
  }

  @Delete(':id/file')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Delete resource file',
    description: 'Delete the file associated with a resource (admin/support only)'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin/support only' })
  @ApiResponse({ status: 404, description: 'Resource or file not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteResourceFile(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/${id}/file`, req, res);
  }

  // ==================== CATEGORY MANAGEMENT ENDPOINTS ====================

  @Get('categories/list')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get resource categories',
    description: 'Get list of available resource categories'
  })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCategories(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/categories/list', req, res);
  }

  @Get('categories/:category')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get resources by category',
    description: 'Get all resources in a specific category'
  })
  @ApiParam({ name: 'category', description: 'Category name' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by resource type' })
  @ApiResponse({ status: 200, description: 'Category resources retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getResourcesByCategory(@Param('category') category: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/categories/${category}`, req, res);
  }

  // ==================== SEARCH & DISCOVERY ENDPOINTS ====================

  @Post('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Advanced search',
    description: 'Perform advanced search with multiple filters and criteria'
  })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid search criteria' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchResources(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/search', req, res);
  }

  @Get('featured/list')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get featured resources',
    description: 'Get list of featured/recommended resources'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of featured resources' })
  @ApiResponse({ status: 200, description: 'Featured resources retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFeaturedResources(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/featured/list', req, res);
  }

  @Get('popular/list')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get popular resources',
    description: 'Get list of most popular/downloaded resources'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of popular resources' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (week, month, year, all)' })
  @ApiResponse({ status: 200, description: 'Popular resources retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPopularResources(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/popular/list', req, res);
  }

  @Get('recent/list')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get recent resources',
    description: 'Get list of recently added resources'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of recent resources' })
  @ApiResponse({ status: 200, description: 'Recent resources retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecentResources(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/recent/list', req, res);
  }

  // ==================== USER INTERACTION ENDPOINTS ====================

  @Post(':id/view')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Record resource view',
    description: 'Record that a user has viewed a resource'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'View recorded successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async recordResourceView(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/${id}/view`, req, res);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Add to favorites',
    description: 'Add a resource to user favorites'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource added to favorites' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addToFavorites(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/${id}/favorite`, req, res);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Remove from favorites',
    description: 'Remove a resource from user favorites'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource removed from favorites' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeFromFavorites(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/resources/${id}/favorite`, req, res);
  }

  @Get('favorites/list')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get user favorites',
    description: 'Get list of user favorite resources'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Favorite resources retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserFavorites(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/favorites/list', req, res);
  }

  // ==================== ADMIN MANAGEMENT ENDPOINTS ====================

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get resource statistics',
    description: 'Get comprehensive resource statistics (admin only)'
  })
  @ApiResponse({ status: 200, description: 'Resource statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin only' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getResourceStats(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/admin/stats', req, res);
  }

  @Post('admin/bulk-upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Bulk upload resources',
    description: 'Upload multiple resources from a CSV/Excel file (admin only)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Bulk upload completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or data' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin only' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkUploadResources(@UploadedFile() file: MulterFile, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/admin/bulk-upload', req, res);
  }

  @Post('admin/bulk-update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Bulk update resources',
    description: 'Update multiple resources at once (admin only)'
  })
  @ApiResponse({ status: 200, description: 'Bulk update completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin only' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkUpdateResources(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/admin/bulk-update', req, res);
  }

  @Delete('admin/bulk-delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Bulk delete resources',
    description: 'Delete multiple resources at once (admin only)'
  })
  @ApiResponse({ status: 200, description: 'Bulk delete completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid delete data' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin only' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkDeleteResources(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/admin/bulk-delete', req, res);
  }

  // ==================== HEALTH & MONITORING ENDPOINTS ====================

  @Get('health')
  @Public()
  @ApiOperation({ 
    summary: 'Service health check',
    description: 'Check if the resources service is healthy'
  })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async getHealth(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/health', req, res);
  }

  @Get('health/storage')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Storage health check',
    description: 'Check storage system health and capacity (admin only)'
  })
  @ApiResponse({ status: 200, description: 'Storage health retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized - admin only' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStorageHealth(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/resources/health/storage', req, res);
  }

  // ==================== PRIVATE HELPER METHOD ====================

  private async proxyToService(path: string, req: Request, res: Response) {
    try {
      const method = req.method;
      const body = req.body;
      const headers = { ...req.headers };
      const params = req.query;

      // Remove gateway-specific headers
      delete headers.host;
      delete headers.connection;
      delete headers['content-length'];

      this.logger.log(`Proxying ${method} ${path} to resources service`);

      const response = await this.proxyService.forwardRequest(
        'resources',
        path,
        method,
        body,
        headers as Record<string, string>,
        params as Record<string, any>
      );

      // Set response headers
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'transfer-encoding' && 
            key.toLowerCase() !== 'connection' &&
            key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, response.headers[key]);
        }
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error('Error proxying to resources service:', error.message);
      throw new HttpException(
        {
          error: 'Service Unavailable',
          message: 'Resources service temporarily unavailable',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
} 