import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallingService } from './calling.service';
import { CallingController } from './calling.controller';
import { AuthClientModule } from '../../shared/auth-client/auth-client.module';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatRoom } from '../entities/chat-room.entity';
import { ChatNotificationService } from '../../common/services/notification.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([ChatMessage, ChatRoom]),
    AuthClientModule,
  ],
  controllers: [CallingController],
  providers: [
    CallingService,
    ChatNotificationService,
  ],
  exports: [CallingService],
})
export class CallingModule {} 