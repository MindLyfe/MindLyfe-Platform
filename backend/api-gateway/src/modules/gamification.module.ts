import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GamificationController } from '../controllers/gamification.controller';
import { GamificationService } from '../services/gamification.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [
    GamificationController,
  ],
  providers: [
    GamificationService,
  ],
  exports: [
    GamificationService,
  ],
})
export class GamificationModule {} 