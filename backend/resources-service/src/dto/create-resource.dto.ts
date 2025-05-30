import { IsEnum, IsOptional, IsString, IsBoolean, IsArray, IsObject, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceType, ResourceCategory } from '../entities/resource.entity';

export class CreateResourceDto {
  @ApiProperty({
    description: 'Resource title',
    example: 'Mindfulness Meditation Guide',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Resource description',
    example: 'A comprehensive guide to mindfulness meditation techniques',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Resource content (for text-based resources)',
    example: 'This guide will teach you...',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Type of resource',
    enum: ResourceType,
    example: ResourceType.GUIDE,
  })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiProperty({
    description: 'Resource category',
    enum: ResourceCategory,
    example: ResourceCategory.MINDFULNESS,
  })
  @IsEnum(ResourceCategory)
  category: ResourceCategory;

  @ApiPropertyOptional({
    description: 'External URL for the resource',
    example: 'https://example.com/resource',
  })
  @IsUrl()
  @IsOptional()
  externalUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether the resource is public',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = true;

  @ApiPropertyOptional({
    description: 'Whether the resource is featured',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  @ApiPropertyOptional({
    description: 'Resource tags',
    example: ['meditation', 'mindfulness', 'stress-relief'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata for the resource',
    example: { duration: '10 minutes', difficulty: 'beginner' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 