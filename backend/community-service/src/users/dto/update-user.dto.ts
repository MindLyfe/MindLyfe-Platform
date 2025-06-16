import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Display name for the user' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Pseudonym for anonymous posting' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pseudonym?: string;

  @ApiPropertyOptional({ description: 'User bio/description' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Array of specialties for therapists', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: 'Array of certifications for therapists', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ 
    description: 'Privacy settings for the user',
    type: 'object',
    properties: {
      isAnonymousByDefault: { type: 'boolean' },
      showActivityStatus: { type: 'boolean' },
      showPostHistory: { type: 'boolean' },
      showCommentHistory: { type: 'boolean' },
      showReactionHistory: { type: 'boolean' },
      allowDirectMessages: { type: 'boolean' },
      allowMentions: { type: 'boolean' },
      allowTags: { type: 'boolean' },
      notifyOnMention: { type: 'boolean' },
      notifyOnReply: { type: 'boolean' },
      notifyOnReaction: { type: 'boolean' },
      notifyOnReport: { type: 'boolean' }
    }
  })
  @IsOptional()
  privacySettings?: {
    isAnonymousByDefault?: boolean;
    showActivityStatus?: boolean;
    showPostHistory?: boolean;
    showCommentHistory?: boolean;
    showReactionHistory?: boolean;
    allowDirectMessages?: boolean;
    allowMentions?: boolean;
    allowTags?: boolean;
    notifyOnMention?: boolean;
    notifyOnReply?: boolean;
    notifyOnReaction?: boolean;
    notifyOnReport?: boolean;
  };

  @ApiPropertyOptional({ 
    description: 'Therapist profile information for verified therapists',
    type: 'object' 
  })
  @IsOptional()
  therapistProfile?: {
    licenseNumber?: string;
    licenseState?: string;
    licenseExpiry?: Date;
    yearsOfExperience?: number;
    education?: string[];
    languages?: string[];
    acceptedInsurance?: string[];
    sessionTypes?: string[];
    hourlyRate?: number;
    availability?: Record<string, any>;
  };
} 