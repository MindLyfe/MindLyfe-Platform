import { IsNotEmpty, IsDateString, IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookSessionDto {
  @ApiProperty({ description: 'Therapist ID' })
  @IsNotEmpty()
  @IsString()
  therapistId: string;

  @ApiProperty({ description: 'Session date and time' })
  @IsDateString()
  sessionDate: Date;

  @ApiProperty({ 
    description: 'Type of therapy session',
    enum: ['individual', 'group', 'couples', 'family', 'emergency'],
    default: 'individual'
  })
  @IsOptional()
  @IsString()
  sessionType?: string;

  @ApiProperty({ description: 'Duration in minutes', default: 60, required: false })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(120)
  duration?: number;

  @ApiProperty({ description: 'Session notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Is this an emergency session', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;
}