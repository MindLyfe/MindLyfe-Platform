import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsEmail, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

export enum ParticipantRole {
  HOST = 'host',
  CO_HOST = 'co_host',
  PARTICIPANT = 'participant',
  OBSERVER = 'observer'
}

export class AddParticipantsDto {
  @ApiProperty({
    description: 'User IDs to add as participants',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];

  @ApiProperty({
    description: 'Email addresses to invite as participants',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emails?: string[];

  @ApiProperty({
    description: 'Role to assign to the participants',
    enum: ParticipantRole,
    default: ParticipantRole.PARTICIPANT,
  })
  @IsEnum(ParticipantRole)
  role: ParticipantRole;

  @ApiProperty({
    description: 'Custom message to include in the invitation',
    required: false,
  })
  @IsOptional()
  @IsString()
  invitationMessage?: string;

  @ApiProperty({
    description: 'Whether to send email notifications',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  sendNotifications?: boolean;
}

export class RemoveParticipantsDto {
  @ApiProperty({
    description: 'User IDs to remove from the session',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiProperty({
    description: 'Reason for removal',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Whether to send email notifications',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  sendNotifications?: boolean;
}

export class UpdateParticipantRoleDto {
  @ApiProperty({
    description: 'User ID of the participant',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'New role for the participant',
    enum: ParticipantRole,
  })
  @IsEnum(ParticipantRole)
  role: ParticipantRole;
}

export class ManageBreakoutRoomsDto {
  @ApiProperty({
    description: 'Breakout room configuration',
    type: 'object',
    example: {
      rooms: [
        {
          name: 'Group A',
          participants: ['user1', 'user2'],
        },
        {
          name: 'Group B',
          participants: ['user3', 'user4'],
        },
      ],
    },
  })
  @IsArray()
  rooms: {
    name: string;
    participants: string[];
  }[];

  @ApiProperty({
    description: 'Duration of breakout rooms in minutes',
    required: false,
  })
  @IsOptional()
  @IsString()
  duration?: string;
} 