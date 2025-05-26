import { IsUUID, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ReactionType } from '../entities/reaction.entity';

export class AddReactionDto {
  @IsUUID()
  @IsOptional()
  postId?: string;

  @IsUUID()
  @IsOptional()
  commentId?: string;

  @IsEnum(ReactionType)
  type: ReactionType;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}

export class RemoveReactionDto {
  @IsUUID()
  @IsOptional()
  postId?: string;

  @IsUUID()
  @IsOptional()
  commentId?: string;

  @IsEnum(ReactionType)
  type: ReactionType;
} 