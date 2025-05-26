import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsUUID, MaxLength, MinLength } from 'class-validator';
import { PostVisibility, PostStatus } from '../entities/post.entity';

export class CreatePostDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEnum(PostVisibility)
  @IsOptional()
  visibility?: PostVisibility;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(PostVisibility)
  @IsOptional()
  visibility?: PostVisibility;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class ReportPostDto {
  @IsString()
  reason: string;
}

export class ModeratePostDto {
  @IsEnum(PostStatus)
  status: PostStatus;
  @IsString()
  @IsOptional()
  notes?: string;
} 