import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ReportingController } from '../controllers/reporting.controller';
import { ReportingService } from '../services/reporting.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {} 