import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { CustomLoggerService } from '../common/services/logger.service';

@Module({
  imports: [HttpModule],
  controllers: [HealthController],
  providers: [CustomLoggerService],
})
export class HealthModule {} 