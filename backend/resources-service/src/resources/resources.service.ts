import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import { Resource, ResourceStatus, ResourceType, ResourceCategory } from '../entities/resource.entity';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { ResourceNotificationService } from '../common/services/notification.service';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly notificationService: ResourceNotificationService,
  ) {}

  async createResource(userId: string, createResourceDto: CreateResourceDto, file?: Express.Multer.File): Promise<Resource> {
    try {
      // Verify user has admin/support role
      const user = await this.getUserFromAuthService(userId);
      if (!this.isAdminOrSupport(user)) {
        throw new ForbiddenException('Only admin and support users can create resources');
      }

      const resource = this.resourceRepository.create({
        ...createResourceDto,
        createdBy: userId,
        status: ResourceStatus.DRAFT,
      });

      // Handle file upload if provided
      if (file) {
        resource.fileName = file.filename;
        resource.filePath = file.path;
        resource.fileSize = file.size;
        resource.mimeType = file.mimetype;
        resource.downloadUrl = `/api/resources/${resource.id}/download`;
      }

      const savedResource = await this.resourceRepository.save(resource);

      // Send notification
      await this.notificationService.notifyResourceCreated(
        userId,
        savedResource.id,
        savedResource.title,
        savedResource.type,
        savedResource.category,
        ['admin-user-id'] // In real implementation, get admin IDs from a service
      );

      return savedResource;
    } catch (error) {
      this.logger.error(`Failed to create resource: ${error.message}`);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to create resource');
    }
  }

  async updateResource(id: string, userId: string, updateResourceDto: UpdateResourceDto, file?: Express.Multer.File): Promise<Resource> {
    const resource = await this.getResourceById(id);

    // Verify user has admin/support role
    const user = await this.getUserFromAuthService(userId);
    if (!this.isAdminOrSupport(user)) {
      throw new ForbiddenException('Only admin and support users can update resources');
    }

    try {
      // Handle file upload if provided
      if (file) {
        // Delete old file if exists
        if (resource.filePath && fs.existsSync(resource.filePath)) {
          fs.unlinkSync(resource.filePath);
        }

        resource.fileName = file.filename;
        resource.filePath = file.path;
        resource.fileSize = file.size;
        resource.mimeType = file.mimetype;
        resource.downloadUrl = `/api/resources/${resource.id}/download`;
      }

      // Update resource fields
      Object.assign(resource, updateResourceDto);
      resource.updatedBy = userId;

      // Set published date if status is being changed to published
      if (updateResourceDto.status === ResourceStatus.PUBLISHED && resource.status !== ResourceStatus.PUBLISHED) {
        resource.publishedAt = new Date();
      }

      const updatedResource = await this.resourceRepository.save(resource);

      // Send notification
      const changes = Object.keys(updateResourceDto);
      await this.notificationService.notifyResourceUpdated(
        userId,
        updatedResource.id,
        updatedResource.title,
        changes,
        [] // In real implementation, get subscriber IDs
      );

      return updatedResource;
    } catch (error) {
      this.logger.error(`Failed to update resource: ${error.message}`);
      throw new BadRequestException('Failed to update resource');
    }
  }

  async getResources(
    page: number = 1,
    limit: number = 10,
    type?: ResourceType,
    category?: ResourceCategory,
    status?: ResourceStatus,
    search?: string,
    tags?: string[],
    isPublic?: boolean,
  ): Promise<{ resources: Resource[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.resourceRepository.createQueryBuilder('resource');

    // Apply filters
    if (type) {
      queryBuilder.andWhere('resource.type = :type', { type });
    }

    if (category) {
      queryBuilder.andWhere('resource.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('resource.status = :status', { status });
    } else {
      // Default to published resources for public access
      queryBuilder.andWhere('resource.status = :status', { status: ResourceStatus.PUBLISHED });
    }

    if (isPublic !== undefined) {
      queryBuilder.andWhere('resource.isPublic = :isPublic', { isPublic });
    }

    if (search) {
      queryBuilder.andWhere(
        '(resource.title ILIKE :search OR resource.description ILIKE :search OR resource.content ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('resource.tags && :tags', { tags });
    }

    // Order by featured first, then by creation date
    queryBuilder.orderBy('resource.isFeatured', 'DESC');
    queryBuilder.addOrderBy('resource.createdAt', 'DESC');

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [resources, total] = await queryBuilder.getManyAndCount();

    return {
      resources,
      total,
      page,
      limit,
    };
  }

  async getResourceById(id: string): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async getResourceByIdForUser(id: string, userId?: string): Promise<Resource> {
    const resource = await this.getResourceById(id);

    // Check if resource is public or user has access
    if (!resource.isPublic && resource.status !== ResourceStatus.PUBLISHED) {
      if (!userId) {
        throw new ForbiddenException('Resource not accessible');
      }

      const user = await this.getUserFromAuthService(userId);
      if (!this.isAdminOrSupport(user)) {
        throw new ForbiddenException('Resource not accessible');
      }
    }

    // Increment view count
    resource.viewCount += 1;
    await this.resourceRepository.save(resource);

    return resource;
  }

  async deleteResource(id: string, userId: string): Promise<void> {
    const resource = await this.getResourceById(id);

    // Verify user has admin/support role
    const user = await this.getUserFromAuthService(userId);
    if (!this.isAdminOrSupport(user)) {
      throw new ForbiddenException('Only admin and support users can delete resources');
    }

    try {
      // Delete associated file if exists
      if (resource.filePath && fs.existsSync(resource.filePath)) {
        fs.unlinkSync(resource.filePath);
      }

      // Delete thumbnail if exists
      if (resource.thumbnailPath && fs.existsSync(resource.thumbnailPath)) {
        fs.unlinkSync(resource.thumbnailPath);
      }

      await this.resourceRepository.remove(resource);

      // Send notification
      await this.notificationService.notifyResourceDeleted(
        userId,
        resource.id,
        resource.title,
      );
    } catch (error) {
      this.logger.error(`Failed to delete resource: ${error.message}`);
      throw new BadRequestException('Failed to delete resource');
    }
  }

  async downloadResource(id: string, userId?: string): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const resource = await this.getResourceByIdForUser(id, userId);

    if (!resource.filePath || !fs.existsSync(resource.filePath)) {
      throw new NotFoundException('File not found');
    }

    // Increment download count
    resource.downloadCount += 1;
    await this.resourceRepository.save(resource);

    // Send notification about download
    await this.notificationService.notifyResourceDownloaded(
      userId || 'anonymous',
      resource.creatorId,
      resource.id,
      resource.title,
      resource.downloadCount
    );

    return {
      filePath: resource.filePath,
      fileName: resource.fileName || 'download',
      mimeType: resource.mimeType || 'application/octet-stream',
    };
  }

  async getFeaturedResources(limit: number = 5): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: {
        isFeatured: true,
        status: ResourceStatus.PUBLISHED,
        isPublic: true,
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getResourcesByCategory(category: ResourceCategory, limit: number = 10): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: {
        category,
        status: ResourceStatus.PUBLISHED,
        isPublic: true,
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getResourcesByType(type: ResourceType, limit: number = 10): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: {
        type,
        status: ResourceStatus.PUBLISHED,
        isPublic: true,
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async searchResources(query: string, limit: number = 10): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: [
        { title: Like(`%${query}%`), status: ResourceStatus.PUBLISHED, isPublic: true },
        { description: Like(`%${query}%`), status: ResourceStatus.PUBLISHED, isPublic: true },
        { content: Like(`%${query}%`), status: ResourceStatus.PUBLISHED, isPublic: true },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getResourceStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const total = await this.resourceRepository.count();
    const published = await this.resourceRepository.count({ where: { status: ResourceStatus.PUBLISHED } });
    const draft = await this.resourceRepository.count({ where: { status: ResourceStatus.DRAFT } });

    // Get counts by type
    const typeStats = await this.resourceRepository
      .createQueryBuilder('resource')
      .select('resource.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('resource.type')
      .getRawMany();

    const byType = typeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {});

    // Get counts by category
    const categoryStats = await this.resourceRepository
      .createQueryBuilder('resource')
      .select('resource.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('resource.category')
      .getRawMany();

    const byCategory = categoryStats.reduce((acc, stat) => {
      acc[stat.category] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      published,
      draft,
      byType,
      byCategory,
    };
  }

  private async getUserFromAuthService(userId: string): Promise<any> {
    try {
      const serviceToken = this.configService.get<string>('services.auth.serviceToken');
      const authServiceUrl = this.configService.get<string>('services.auth.url');

      const response = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/auth/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${serviceToken}`,
            'X-Service-Name': 'resources-service',
          },
        })
      );

      return response.data.user;
    } catch (error) {
      this.logger.error(`Failed to get user from auth service: ${error.message}`);
      throw new BadRequestException('Failed to get user information');
    }
  }

  private isAdminOrSupport(user: any): boolean {
    const allowedRoles = ['admin', 'support'];
    return user.role && allowedRoles.includes(user.role.toLowerCase());
  }
} 