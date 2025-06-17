import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SupportController } from '../controllers/support.controller';
import { SubscriptionsController } from '../controllers/subscriptions.controller';
import { SupportService } from '../services/support.service';
import { SubscriptionsService } from '../services/subscriptions.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [
    SupportController,
    SubscriptionsController,
  ],
  providers: [
    SupportService,
    SubscriptionsService,
  ],
  exports: [
    SupportService,
    SubscriptionsService,
  ],
})
export class SupportModule {} 