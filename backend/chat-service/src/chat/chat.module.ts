import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { AuthClientModule } from '@mindlyf/shared/auth-client';
import { HttpModule } from '@nestjs/axios';
import { CommunityClientService } from '../community/community-client.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, ChatRoom]),
    AuthClientModule,
    HttpModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    CommunityClientService
  ],
  exports: [ChatService],
})
export class ChatModule {}