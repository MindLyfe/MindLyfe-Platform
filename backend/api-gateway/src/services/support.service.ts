import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private readonly authServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('services.auth.url');
  }

  // Support Team Management
  async registerSupportTeamMember(registerDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/team/register`, registerDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Register support team member failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Register support team member error: ${error.message}`);
      throw error;
    }
  }

  async getSupportTeamMembers() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/team`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get support team members failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get support team members error: ${error.message}`);
      throw error;
    }
  }

  async getSupportTeamMemberById(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/team/${id}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get support team member by ID failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get support team member by ID error: ${error.message}`);
      throw error;
    }
  }

  async updateSupportTeamMemberStatus(id: string, isActive: boolean, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.authServiceUrl}/api/support/team/${id}/status`, { isActive }, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update support team member status failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update support team member status error: ${error.message}`);
      throw error;
    }
  }

  // Shift Management
  async createShift(createShiftDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/shifts`, createShiftDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create shift failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create shift error: ${error.message}`);
      throw error;
    }
  }

  async getShifts(queryDto: any) {
    try {
      const queryString = new URLSearchParams(queryDto).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/shifts?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get shifts failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get shifts error: ${error.message}`);
      throw error;
    }
  }

  async getUserShifts(userId: string, queryDto: any) {
    try {
      const queryString = new URLSearchParams(queryDto).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/shifts/my?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user shifts failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user shifts error: ${error.message}`);
      throw error;
    }
  }

  async getShiftById(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/shifts/${id}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get shift by ID failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get shift by ID error: ${error.message}`);
      throw error;
    }
  }

  async updateShift(id: string, updateShiftDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.authServiceUrl}/api/support/shifts/${id}`, updateShiftDto, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update shift failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update shift error: ${error.message}`);
      throw error;
    }
  }

  async deleteShift(id: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.authServiceUrl}/api/support/shifts/${id}`, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Delete shift failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Delete shift error: ${error.message}`);
      throw error;
    }
  }

  async startShift(id: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/shifts/${id}/start`, {}, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Start shift failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Start shift error: ${error.message}`);
      throw error;
    }
  }

  async endShift(id: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/shifts/${id}/end`, {}, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`End shift failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`End shift error: ${error.message}`);
      throw error;
    }
  }

  // Support Requests
  async createSupportRequest(createRequestDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/requests`, createRequestDto, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create support request failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create support request error: ${error.message}`);
      throw error;
    }
  }

  async getSupportRequests(queryDto: any) {
    try {
      const queryString = new URLSearchParams(queryDto).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/requests?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get support requests failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get support requests error: ${error.message}`);
      throw error;
    }
  }

  async getMySupportRequests(userId: string, queryDto: any) {
    try {
      const queryString = new URLSearchParams(queryDto).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/requests/my?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get my support requests failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get my support requests error: ${error.message}`);
      throw error;
    }
  }

  async getAssignedSupportRequests(userId: string, queryDto: any) {
    try {
      const queryString = new URLSearchParams(queryDto).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/requests/assigned?${queryString}`, {
          headers: { 'x-user-id': userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get assigned support requests failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get assigned support requests error: ${error.message}`);
      throw error;
    }
  }

  async getSupportRequestById(id: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/requests/${id}`, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get support request by ID failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get support request by ID error: ${error.message}`);
      throw error;
    }
  }

  async updateSupportRequest(id: string, updateRequestDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.authServiceUrl}/api/support/requests/${id}`, updateRequestDto, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update support request failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update support request error: ${error.message}`);
      throw error;
    }
  }

  async assignSupportRequest(id: string, assignDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/requests/${id}/assign`, assignDto, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Assign support request failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Assign support request error: ${error.message}`);
      throw error;
    }
  }

  async takeSupportRequest(id: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/requests/${id}/take`, {}, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Take support request failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Take support request error: ${error.message}`);
      throw error;
    }
  }

  async escalateSupportRequest(id: string, reason: string, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/requests/${id}/escalate`, { reason }, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Escalate support request failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Escalate support request error: ${error.message}`);
      throw error;
    }
  }

  // Dashboards
  async getSupportDashboard(user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/dashboard`, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get support dashboard failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get support dashboard error: ${error.message}`);
      throw error;
    }
  }

  async getPersonalDashboard(user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/dashboard/personal`, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get personal dashboard failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get personal dashboard error: ${error.message}`);
      throw error;
    }
  }

  // Settings
  async updateNotificationPreferences(preferencesDto: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.authServiceUrl}/api/support/notifications/preferences`, preferencesDto, {
          headers: { 'x-user-id': user.userId }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update notification preferences failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update notification preferences error: ${error.message}`);
      throw error;
    }
  }

  async getRoutingStatus() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/support/routing/status`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get routing status failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get routing status error: ${error.message}`);
      throw error;
    }
  }

  async toggleAutoRouting(enabled: boolean, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/routing/toggle`, { enabled }, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Toggle auto routing failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Toggle auto routing error: ${error.message}`);
      throw error;
    }
  }

  // Shift Templates
  async createShiftTemplate(templateData: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/shift-templates`, templateData, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create shift template failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create shift template error: ${error.message}`);
      throw error;
    }
  }

  async generateShiftsFromTemplate(generateData: any, user: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/support/shift-templates/generate`, generateData, {
          headers: { 'x-user-id': user.userId, 'x-user-role': user.role }
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Generate shifts from template failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Generate shifts from template error: ${error.message}`);
      throw error;
    }
  }
} 