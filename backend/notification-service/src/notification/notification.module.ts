import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationChannelEntity } from './entities/notification-channel.entity';
import { NotificationTemplateEntity } from './entities/notification-template.entity';
import { NotificationPreferenceEntity } from './entities/notification-preference.entity';
import { AuthModule } from '../auth/auth.module';
import { EmailAdapter } from './channels/email.adapter';
import { SmsAdapter } from './channels/sms.adapter';
import { PushAdapter } from './channels/push.adapter';
import { InAppAdapter } from './channels/in-app.adapter';
import { NotificationChannelFactory } from './channels/notification-channel.factory';
import { NotificationQueueService } from './queue/notification-queue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationChannelEntity,
      NotificationTemplateEntity,
      NotificationPreferenceEntity,
    ]),
    AuthModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailAdapter,
    SmsAdapter,
    PushAdapter,
    InAppAdapter,
    NotificationChannelFactory,
    NotificationQueueService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {} 