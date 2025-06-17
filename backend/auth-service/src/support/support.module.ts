import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { User } from '../entities/user.entity';
import { SupportShift } from '../entities/support-shift.entity';
import { SupportRouting } from '../entities/support-routing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      SupportShift,
      SupportRouting,
    ]),
    ScheduleModule.forRoot(), // Enable cron jobs for notifications
    HttpModule,
    ConfigModule,
  ],
  controllers: [SupportController],
  providers: [
    SupportService,
  ],
  exports: [
    SupportService,
  ],
})
export class SupportModule {}