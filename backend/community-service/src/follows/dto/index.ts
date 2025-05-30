import { IsUUID, IsOptional, IsString, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { FollowStatus } from '../entities/follow.entity';

export class CreateFollowDto {
  @IsUUID()
  followingId: string; // User to follow (using their anonymous ID from community)

  @IsString()
  @IsOptional()
  followSource?: string; // How they found each other ('post', 'comment', 'search', etc.)

  @IsUUID()
  @IsOptional()
  sourceContentId?: string; // ID of the content that led to follow

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mutualInterests?: string[]; // Common interests/tags
}

export class UpdateFollowDto {
  @IsEnum(FollowStatus)
  @IsOptional()
  status?: FollowStatus;

  @IsBoolean()
  @IsOptional()
  allowChatInvitation?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyOnFollow?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyOnMutualFollow?: boolean;

  @IsBoolean()
  @IsOptional()
  allowRealNameInChat?: boolean;
}

export class FollowListQueryDto {
  @IsEnum(['followers', 'following', 'mutual'])
  @IsOptional()
  type?: 'followers' | 'following' | 'mutual';

  @IsEnum(FollowStatus)
  @IsOptional()
  status?: FollowStatus;

  @IsString()
  @IsOptional()
  search?: string; // Search by pseudonym

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}

export class ChatEligibilityDto {
  @IsUUID()
  userId: string; // Anonymous user ID to check chat eligibility with
} 