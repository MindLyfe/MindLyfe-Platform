import { IsNotEmpty, IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFollowDto {
  @ApiProperty({
    description: 'ID of the user to follow',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  followedId: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the follow relationship',
    example: { source: 'profile', referral: 'recommended' },
    default: {},
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 