import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CancelSessionDto {
  @ApiProperty({
    description: 'Reason for cancelling the session',
    example: 'Client requested rescheduling due to emergency',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
} 