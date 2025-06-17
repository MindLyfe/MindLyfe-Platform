import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RecommenderController } from '../controllers/recommender.controller';
import { RecommenderService } from '../services/recommender.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [RecommenderController],
  providers: [RecommenderService],
  exports: [RecommenderService],
})
export class RecommenderModule {}
