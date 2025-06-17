import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class TeletherapyService {
  private readonly logger = new Logger(TeletherapyService.name);
  private readonly teletherapyServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.teletherapyServiceUrl = this.configService.get<string>('services.teletherapy.url');
  }

  async healthCheck() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/health`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Teletherapy health check failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Teletherapy health check error: ${error.message}`);
      throw error;
    }
  }

  async createSession(createSessionDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.teletherapyServiceUrl}/api/teletherapy/sessions`, createSessionDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create session failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create session error: ${error.message}`);
      throw error;
    }
  }

  async getUpcomingSessions(user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/upcoming`, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get upcoming sessions failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get upcoming sessions error: ${error.message}`);
      throw error;
    }
  }

  async getSessionsByDateRange(startDate: string, endDate: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/sessions?startDate=${startDate}&endDate=${endDate}`, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get sessions by date range failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get sessions by date range error: ${error.message}`);
      throw error;
    }
  }

  async getGroupSessions(user: any, category?: string, focus?: string[]) {
    try {
      let queryParams = '';
      if (category) queryParams += `category=${category}&`;
      if (focus) queryParams += focus.map(f => `focus=${f}`).join('&');
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/group?${queryParams}`, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get group sessions failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get group sessions error: ${error.message}`);
      throw error;
    }
  }

  async getIndividualSessions(user: any, category?: string) {
    try {
      const queryParams = category ? `?category=${category}` : '';
      const response = await firstValueFrom(
        this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/individual${queryParams}`, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get individual sessions failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get individual sessions error: ${error.message}`);
      throw error;
    }
  }

  async getSessionById(id: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}`, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get session by ID failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get session by ID error: ${error.message}`);
      throw error;
    }
  }

  async updateSessionStatus(id: string, updateStatusDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/status`, updateStatusDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update session status failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update session status error: ${error.message}`);
      throw error;
    }
  }

  async updateSessionNotes(id: string, updateNotesDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/notes`, updateNotesDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update session notes failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update session notes error: ${error.message}`);
      throw error;
    }
  }

  async cancelSession(id: string, cancelSessionDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/cancel`, cancelSessionDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Cancel session failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Cancel session error: ${error.message}`);
      throw error;
    }
  }

  async joinSession(id: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/join`, {}, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Join session failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Join session error: ${error.message}`);
      throw error;
    }
  }

  async leaveSession(id: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/leave`, {}, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Leave session failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Leave session error: ${error.message}`);
      throw error;
    }
  }

  async addParticipants(id: string, addParticipantsDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/participants`, addParticipantsDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Add participants failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Add participants error: ${error.message}`);
      throw error;
    }
  }

  async removeParticipants(id: string, removeParticipantsDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/participants`, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role },
          data: removeParticipantsDto
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Remove participants failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Remove participants error: ${error.message}`);
      throw error;
    }
  }

  async updateParticipantRole(id: string, updateRoleDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/participants/role`, updateRoleDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update participant role failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update participant role error: ${error.message}`);
      throw error;
    }
  }

  async manageBreakoutRooms(id: string, breakoutRoomsDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/breakout-rooms`, breakoutRoomsDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Manage breakout rooms failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Manage breakout rooms error: ${error.message}`);
      throw error;
    }
  }

  async createChatRoomForSession(id: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.teletherapyServiceUrl}/api/teletherapy/sessions/${id}/chat-room`, {}, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create chat room for session failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create chat room for session error: ${error.message}`);
      throw error;
    }
  }

  async checkTherapistClientRelationship(therapistId: string, clientId: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.teletherapyServiceUrl}/api/teletherapy/relationship/check?therapistId=${therapistId}&clientId=${clientId}`, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Check therapist client relationship failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Check therapist client relationship error: ${error.message}`);
      throw error;
    }
  }
} 