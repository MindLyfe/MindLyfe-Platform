import { IsString, IsOptional, IsBoolean, IsUUID, MinLength } from 'class-validator';
import { CommentStatus } from '../entities/comment.entity';

export class CreateCommentDto {
  @IsUUID()
  postId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}

export class ReportCommentDto {
  @IsString()
  reason: string;
}

export class ModerateCommentDto {
  @IsEnum(CommentStatus)
  status: CommentStatus;
  @IsString()
  @IsOptional()
  notes?: string;
} 