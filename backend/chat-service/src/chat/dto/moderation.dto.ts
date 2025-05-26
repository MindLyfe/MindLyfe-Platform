import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ModerationAction {
  HIDE = 'hide',
  DELETE = 'delete',
  WARNING = 'warning',
  BLOCK_USER = 'block_user',
}

export class ModerateMessageDto {
  @ApiProperty({
    description: 'The ID of the message to moderate',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({
    description: 'The moderation action to perform',
    enum: ModerationAction,
    example: ModerationAction.HIDE,
  })
  @IsEnum(ModerationAction)
  @IsNotEmpty()
  action: ModerationAction;

  @ApiPropertyOptional({
    description: 'The reason for moderation',
    example: 'Violation of community guidelines',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ReportMessageDto {
  @ApiProperty({
    description: 'The ID of the message to report',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({
    description: 'The reason for reporting',
    example: 'Inappropriate content',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ModerateRoomDto {
  @ApiProperty({
    description: 'The ID of the room to moderate',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'The moderation action to perform',
    enum: ModerationAction,
    example: ModerationAction.HIDE,
  })
  @IsEnum(ModerationAction)
  @IsNotEmpty()
  action: ModerationAction;

  @ApiPropertyOptional({
    description: 'The reason for moderation',
    example: 'Room violates community guidelines',
  })
  @IsString()
  @IsOptional()
  reason?: string;
} 