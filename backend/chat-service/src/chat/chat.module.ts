import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { 
  ChatController, 
  ChatRoomsController, 
  ChatMessagesController, 
  ChatSocialController, 
  ChatModerationController 
} from './chat.controller';
import { AuthClientModule } from '../shared/auth-client/auth-client.module';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { HttpModule } from '@nestjs/axios';
import { CallingModule } from './calling/calling.module';
import { ChatNotificationService } from '../common/services/notification.service';
import { CommunityClientModule } from '../community/community-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, ChatRoom]),
    AuthClientModule,
    HttpModule,
    CommunityClientModule,
    forwardRef(() => CallingModule),
  ],
  controllers: [
    ChatController, 
    ChatRoomsController, 
    ChatMessagesController, 
    ChatSocialController, 
    ChatModerationController
  ],
  providers: [
    ChatService,
    ChatNotificationService
  ],
  exports: [ChatService, ChatNotificationService],
})
export class ChatModule {}