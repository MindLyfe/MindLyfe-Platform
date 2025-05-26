import { IsNotEmpty, IsString, IsArray, IsOptional, IsObject, MaxLength, ArrayMinSize, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomType, PrivacyLevel } from '../entities/chat-room.entity';

export class CreateRoomDto {
  @ApiProperty({
    description: 'The name of the chat room',
    example: 'Support Chat',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'The description of the chat room',
    example: 'Chat room for customer support',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The list of participant IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  participants: string[];

  @ApiProperty({
    description: 'The type of chat room',
    enum: RoomType,
    example: RoomType.GROUP,
    default: RoomType.DIRECT,
  })
  @IsEnum(RoomType)
  @IsOptional()
  type?: RoomType;

  @ApiProperty({
    description: 'The privacy level of the chat room',
    enum: PrivacyLevel,
    example: PrivacyLevel.PRIVATE,
    default: PrivacyLevel.PRIVATE,
  })
  @IsEnum(PrivacyLevel)
  @IsOptional()
  privacyLevel?: PrivacyLevel;

  @ApiPropertyOptional({
    description: 'Whether the room should use end-to-end encryption',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isEncrypted?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata for the room',
    example: { type: 'support', priority: 'high' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}