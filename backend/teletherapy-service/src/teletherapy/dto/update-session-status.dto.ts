import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SessionStatus } from '../entities/therapy-session.entity';

export class UpdateSessionStatusDto {
  @ApiProperty({
    description: 'New status for the therapy session',
    enum: SessionStatus,
    example: SessionStatus.IN_PROGRESS,
  })
  @IsEnum(SessionStatus)
  status: SessionStatus;
} 