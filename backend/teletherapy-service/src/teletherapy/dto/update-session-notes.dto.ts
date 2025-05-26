import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateSessionNotesDto {
  @ApiProperty({
    description: 'Notes from the therapist (only visible to therapist and admin)',
    example: 'Client showed improvement in managing anxiety symptoms',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  therapistNotes?: string;

  @ApiProperty({
    description: 'Notes from the client (only visible to client and admin)',
    example: 'Found the breathing exercises helpful',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  clientNotes?: string;

  @ApiProperty({
    description: 'Notes shared between therapist and client',
    example: 'Agreed to practice mindfulness exercises daily',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  sharedNotes?: string;
} 