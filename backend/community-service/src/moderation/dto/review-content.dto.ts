import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  REMOVE = 'remove',
  WARN = 'warn',
  SUSPEND = 'suspend',
  BAN = 'ban',
  HIDE = 'hide',
  FLAG = 'flag',
}

export class ReviewContentDto {
  @ApiProperty({ 
    description: 'Moderation action to take',
    enum: ModerationAction 
  })
  @IsEnum(ModerationAction)
  action: ModerationAction;

  @ApiPropertyOptional({ description: 'Reason for the moderation action' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Additional notes for the moderation action' })
  @IsOptional()
  @IsString()
  notes?: string;
} 