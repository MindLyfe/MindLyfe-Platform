import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateResourceDto } from './create-resource.dto';
import { ResourceStatus } from '../entities/resource.entity';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
  @IsEnum(ResourceStatus)
  @IsOptional()
  status?: ResourceStatus;
} 