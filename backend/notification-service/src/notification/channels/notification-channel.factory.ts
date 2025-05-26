import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { ChannelType } from '../entities/notification-channel.entity';
import { NotificationChannel } from './notification-channel.interface';
import { EmailAdapter } from './email.adapter';
import { SmsAdapter } from './sms.adapter';
import { PushAdapter } from './push.adapter';
import { InAppAdapter } from './in-app.adapter';

@Injectable()
export class NotificationChannelFactory {
  private readonly logger = new Logger(NotificationChannelFactory.name);

  constructor(private moduleRef: ModuleRef) {}

  /**
   * Get the appropriate channel adapter based on the channel type
   */
  getChannel(channelType: ChannelType): NotificationChannel {
    try {
      switch (channelType) {
        case ChannelType.EMAIL:
          return this.moduleRef.get(EmailAdapter, { strict: false });
          
        case ChannelType.SMS:
          return this.moduleRef.get(SmsAdapter, { strict: false });
          
        case ChannelType.PUSH:
          return this.moduleRef.get(PushAdapter, { strict: false });
          
        case ChannelType.IN_APP:
          return this.moduleRef.get(InAppAdapter, { strict: false });
          
        case ChannelType.WEBHOOK:
          // Webhook adapter not implemented yet
          throw new Error('Webhook adapter not implemented');
          
        default:
          throw new Error(`Unsupported channel type: ${channelType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to get channel adapter for ${channelType}: ${error.message}`);
      throw error;
    }
  }
} 