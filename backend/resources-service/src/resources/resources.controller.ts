import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ResourcesService } from './resources.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { ResourceType, ResourceCategory, ResourceStatus } from '../entities/resource.entity';

// Multer configuration for file uploads
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags('resources')
@Controller('api/resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new resource (Admin/Support only)' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  async createResource(
    @Request() req: any,
    @Body() createResourceDto: CreateResourceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.resourcesService.createResource(req.user.id, createResourceDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get resources with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: ResourceType, description: 'Filter by resource type' })
  @ApiQuery({ name: 'category', required: false, enum: ResourceCategory, description: 'Filter by category' })
  @ApiQuery({ name: 'status', required: false, enum: ResourceStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'tags', required: false, type: [String], description: 'Filter by tags' })
  async getResources(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: ResourceType,
    @Query('category') category?: ResourceCategory,
    @Query('status') status?: ResourceStatus,
    @Query('search') search?: string,
    @Query('tags') tags?: string[],
  ) {
    return this.resourcesService.getResources(page, limit, type, category, status, search, tags);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured resources' })
  @ApiResponse({ status: 200, description: 'Featured resources retrieved successfully' })
  async getFeaturedResources(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return this.resourcesService.getFeaturedResources(limit);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get resources by category' })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  async getResourcesByCategory(
    @Param('category') category: ResourceCategory,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.resourcesService.getResourcesByCategory(category, limit);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get resources by type' })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  async getResourcesByType(
    @Param('type') type: ResourceType,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.resourcesService.getResourcesByType(type, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search resources' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchResources(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.resourcesService.searchResources(query, limit);
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get resource statistics (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getResourceStats() {
    return this.resourcesService.getResourceStats();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiResponse({ status: 200, description: 'Resource retrieved successfully' })
  async getResource(@Request() req: any, @Param('id') id: string) {
    return this.resourcesService.getResourceByIdForUser(id, req.user?.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download resource file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async downloadResource(
    @Param('id') id: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const { filePath, fileName, mimeType } = await this.resourcesService.downloadResource(id, req.user?.id);
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath, { root: '.' });
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update resource (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully' })
  async updateResource(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.resourcesService.updateResource(id, req.user.id, updateResourceDto, file);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete resource (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  async deleteResource(@Request() req: any, @Param('id') id: string) {
    await this.resourcesService.deleteResource(id, req.user.id);
    return { message: 'Resource deleted successfully' };
  }
} 