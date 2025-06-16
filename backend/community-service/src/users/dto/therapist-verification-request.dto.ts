import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';

export class TherapistVerificationRequestDto {
  @ApiProperty({ description: 'License number for verification' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ description: 'State where license was issued' })
  @IsString()
  @IsNotEmpty()
  licenseState: string;

  @ApiProperty({ description: 'License expiry date' })
  @IsDateString()
  licenseExpiry: string;

  @ApiProperty({ description: 'Years of professional experience' })
  @IsNumber()
  yearsOfExperience: number;

  @ApiProperty({ description: 'Educational background', type: [String] })
  @IsArray()
  @IsString({ each: true })
  education: string[];

  @ApiPropertyOptional({ description: 'Languages spoken', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ description: 'Insurance providers accepted', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptedInsurance?: string[];

  @ApiPropertyOptional({ description: 'Types of therapy sessions offered', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sessionTypes?: string[];

  @ApiPropertyOptional({ description: 'Hourly rate for sessions' })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Availability schedule' })
  @IsOptional()
  availability?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional documentation or notes' })
  @IsOptional()
  @IsString()
  additionalNotes?: string;
} 