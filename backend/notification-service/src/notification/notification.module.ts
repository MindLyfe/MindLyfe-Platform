import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SupportNotificationService } from './support-notification.service';
import { SupportNotificationController } from './support-notification.controller';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationChannelEntity } from './entities/notification-channel.entity';
import { NotificationTemplateEntity } from './entities/notification-template.entity';
import { NotificationPreferenceEntity } from './entities/notification-preference.entity';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationChannelFactory } from './channels/notification-channel.factory';
import { EmailAdapter } from './channels/email.adapter';
import { SmsAdapter } from './channels/sms.adapter';
import { PushAdapter } from './channels/push.adapter';
import { InAppAdapter } from './channels/in-app.adapter';
import { NotificationQueueService } from './queue/notification-queue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationChannelEntity,
      NotificationTemplateEntity,
      NotificationPreferenceEntity,
    ]),
    EmailModule,
    AuthModule,
  ],
  controllers: [NotificationController, SupportNotificationController],
  providers: [
    NotificationService,
    SupportNotificationService,
    NotificationChannelFactory,
    EmailAdapter,
    SmsAdapter,
    PushAdapter,
    InAppAdapter,
    NotificationQueueService,
  ],
  exports: [NotificationService, SupportNotificationService, NotificationQueueService],
})
export class NotificationModule {}