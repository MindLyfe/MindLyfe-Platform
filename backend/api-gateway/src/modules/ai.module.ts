import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from '../controllers/ai.controller';
import { AiService } from '../services/ai.service';

@Module({
  imports: [HttpModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {} 