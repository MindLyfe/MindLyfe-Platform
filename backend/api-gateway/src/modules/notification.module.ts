import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from '../controllers/notifications.controller';
import { NotificationsService } from '../services/notifications.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [
    NotificationsController,
  ],
  providers: [
    NotificationsService,
  ],
  exports: [
    NotificationsService,
  ],
})
export class NotificationModule {}