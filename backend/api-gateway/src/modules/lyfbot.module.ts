import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LyfbotController } from '../controllers/lyfbot.controller';
import { LyfbotService } from '../services/lyfbot.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [LyfbotController],
  providers: [LyfbotService],
  exports: [LyfbotService],
})
export class LyfbotModule {}