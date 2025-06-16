import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class TherapistVerifyDto {
  @ApiProperty({ description: 'Whether to verify the therapist or not' })
  @IsBoolean()
  isVerified: boolean;

  @ApiPropertyOptional({ description: 'Notes from the verification process' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Verification decision reason' })
  @IsOptional()
  @IsString()
  reason?: string;
} 