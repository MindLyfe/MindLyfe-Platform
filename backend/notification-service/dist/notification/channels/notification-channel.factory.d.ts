import { ModuleRef } from '@nestjs/core';
import { ChannelType } from '../entities/notification-channel.entity';
import { NotificationChannel } from './notification-channel.interface';
export declare class NotificationChannelFactory {
    private moduleRef;
    private readonly logger;
    constructor(moduleRef: ModuleRef);
    getChannel(channelType: ChannelType): NotificationChannel;
}
