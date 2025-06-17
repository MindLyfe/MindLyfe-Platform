import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly chatServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.chatServiceUrl = this.configService.get<string>('services.chat.url');
  }

  // Chat Rooms Management
  async createRoom(createRoomDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.chatServiceUrl}/api/chat-rooms`, createRoomDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create room failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create room error: ${error.message}`);
      throw error;
    }
  }

  async getUserRooms(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.chatServiceUrl}/api/chat-rooms?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user rooms failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user rooms error: ${error.message}`);
      throw error;
    }
  }

  async getRoom(roomId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.chatServiceUrl}/api/chat-rooms/${roomId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get room failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get room error: ${error.message}`);
      throw error;
    }
  }

  async updateRoom(roomId: string, updateRoomDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.chatServiceUrl}/api/chat-rooms/${roomId}`, updateRoomDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update room failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update room error: ${error.message}`);
      throw error;
    }
  }

  async deleteRoom(roomId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.chatServiceUrl}/api/chat-rooms/${roomId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete room failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete room error: ${error.message}`);
      throw error;
    }
  }

  // Room Participants Management
  async joinRoom(roomId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.chatServiceUrl}/api/chat-rooms/${roomId}/join`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Join room failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Join room error: ${error.message}`);
      throw error;
    }
  }

  async leaveRoom(roomId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.chatServiceUrl}/api/chat-rooms/${roomId}/leave`, {}, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Leave room failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Leave room error: ${error.message}`);
      throw error;
    }
  }

  async getRoomParticipants(roomId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.chatServiceUrl}/api/chat-rooms/${roomId}/participants`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get room participants failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get room participants error: ${error.message}`);
      throw error;
    }
  }

  // Messages Management
  async sendMessage(roomId: string, messageDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.chatServiceUrl}/api/chat-rooms/${roomId}/messages`, messageDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Send message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      throw error;
    }
  }

  async getRoomMessages(roomId: string, userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.chatServiceUrl}/api/chat-rooms/${roomId}/messages?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get room messages failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get room messages error: ${error.message}`);
      throw error;
    }
  }

  async updateMessage(messageId: string, updateMessageDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.chatServiceUrl}/api/messages/${messageId}`, updateMessageDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update message error: ${error.message}`);
      throw error;
    }
  }

  async deleteMessage(messageId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.chatServiceUrl}/api/messages/${messageId}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete message error: ${error.message}`);
      throw error;
    }
  }

  // Direct Messages
  async sendDirectMessage(directMessageDto: any, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.chatServiceUrl}/api/direct-messages`, directMessageDto, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Send direct message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Send direct message error: ${error.message}`);
      throw error;
    }
  }

  async getDirectMessageConversations(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.chatServiceUrl}/api/direct-messages/conversations?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get direct message conversations failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get direct message conversations error: ${error.message}`);
      throw error;
    }
  }

  async getDirectMessages(conversationId: string, userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.chatServiceUrl}/api/direct-messages/${conversationId}?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get direct messages failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get direct messages error: ${error.message}`);
      throw error;
    }
  }

  // Moderation
  async moderateRoom(roomId: string, moderationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.chatServiceUrl}/api/moderation/rooms/${roomId}`, moderationDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Moderate room failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Moderate room error: ${error.message}`);
      throw error;
    }
  }

  async moderateMessage(messageId: string, moderationDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.chatServiceUrl}/api/moderation/messages/${messageId}`, moderationDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Moderate message failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Moderate message error: ${error.message}`);
      throw error;
    }
  }

  // User Status
  async updateUserChatStatus(userId: string, status: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.chatServiceUrl}/api/users/status`, { status }, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update user chat status failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update user chat status error: ${error.message}`);
      throw error;
    }
  }
} 