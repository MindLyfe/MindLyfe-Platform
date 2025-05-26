import { IsEmail, IsString, IsOptional, IsPhoneNumber, IsDate, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({ example: 'male', required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsString()
  @IsOptional()
  profilePictureUrl?: string;

  @ApiProperty({ example: 'I am a software developer...', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ 
    example: { theme: 'dark', notifications: { email: true, sms: false } }, 
    required: false 
  })
  @IsObject()
  @IsOptional()
  preferences?: object;

  @ApiProperty({ 
    example: { 
      street: '123 Main St', 
      city: 'San Francisco', 
      state: 'CA', 
      zip: '94105', 
      country: 'USA' 
    }, 
    required: false 
  })
  @IsObject()
  @IsOptional()
  address?: object;

  @ApiProperty({ example: 'America/Los_Angeles', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ example: 'en-US', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  // Therapist-specific fields (when role is 'therapist')
  @ApiProperty({ example: 'Cognitive Behavioral Therapy', required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({ example: 'Licensed Clinical Psychologist #12345', required: false })
  @IsString()
  @IsOptional()
  licensure?: string;

  @ApiProperty({ 
    example: { 
      experience: '10+ years',
      approach: 'Client-centered',
      sessionFormat: ['individual', 'group'],
      rates: { 'individual': 150, 'group': 75 }
    }, 
    required: false 
  })
  @IsObject()
  @IsOptional()
  professionalDetails?: object;

  @ApiProperty({ 
    example: { 
      degrees: [
        { degree: 'Ph.D. in Clinical Psychology', institution: 'Stanford University', year: 2012 },
        { degree: 'B.A. in Psychology', institution: 'UC Berkeley', year: 2008 }
      ]
    }, 
    required: false 
  })
  @IsObject()
  @IsOptional()
  education?: object;

  @ApiProperty({ 
    example: { 
      certificates: [
        { name: 'EMDR Certified Therapist', issuer: 'EMDR International Association', year: 2015 },
        { name: 'Certified Trauma Professional', issuer: 'IATP', year: 2014 }
      ]
    }, 
    required: false 
  })
  @IsObject()
  @IsOptional()
  certifications?: object;
} 