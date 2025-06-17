import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../services/chat.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [
    ChatController,
  ],
  providers: [
    ChatService,
  ],
  exports: [
    ChatService,
  ],
})
export class ChatModule {} 