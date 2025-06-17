import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { SupportShift, ShiftStatus, ShiftType } from '../entities/support-shift.entity';
import { SupportRouting, RoutingStatus, Priority, RequestType } from '../entities/support-routing.entity';
import {
  RegisterSupportTeamDto,
  CreateShiftDto,
  UpdateShiftDto,
  ShiftQueryDto,
  CreateSupportRequestDto,
  UpdateSupportRequestDto,
  AssignSupportRequestDto,
  SupportRequestQueryDto,
  NotificationPreferencesDto,
  SupportTeamMemberResponseDto,
  ShiftResponseDto,
  SupportRequestResponseDto,
  SupportDashboardDto,
} from './support.dto';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private autoRoutingEnabled = true;
  private notificationServiceUrl: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SupportShift)
    private shiftRepository: Repository<SupportShift>,
    @InjectRepository(SupportRouting)
    private routingRepository: Repository<SupportRouting>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL', 'http://localhost:3002');
  }

  // Support Team Management
  async registerSupportTeamMember(dto: RegisterSupportTeamDto, adminUser: User): Promise<SupportTeamMemberResponseDto> {
    // Only SUPER_ADMIN can register support team members
    if (adminUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can register support team members');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create support team member
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      role: UserRole.SUPPORT_TEAM,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Send welcome email via notification service
    try {
      await this.httpService.post(`${this.notificationServiceUrl}/support-notifications/support-team-welcome`, {
        email: savedUser.email,
        name: `${savedUser.firstName} ${savedUser.lastName}`,
        role: savedUser.role,
        department: dto.department,
        preferredShifts: dto.preferredShifts,
      }).toPromise();
    } catch (error) {
      this.logger.error('Failed to send support team welcome email:', error.message);
    }

    return this.mapToSupportTeamMemberResponse(savedUser);
  }

  async getSupportTeamMembers(): Promise<SupportTeamMemberResponseDto[]> {
    const members = await this.userRepository.find({
      where: { role: UserRole.SUPPORT_TEAM },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(members.map(member => this.mapToSupportTeamMemberResponse(member)));
  }

  async getSupportTeamMemberById(id: string): Promise<SupportTeamMemberResponseDto> {
    const member = await this.userRepository.findOne({
      where: { id, role: UserRole.SUPPORT_TEAM },
    });

    if (!member) {
      throw new NotFoundException('Support team member not found');
    }

    return this.mapToSupportTeamMemberResponse(member);
  }

  async updateSupportTeamMemberStatus(id: string, isActive: boolean, adminUserId: string): Promise<void> {
    // Check if the admin user has permission
    const adminUser = await this.userRepository.findOne({ where: { id: adminUserId } });
    if (!adminUser || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(adminUser.role)) {
      throw new ForbiddenException('You do not have permission to update support team member status');
    }

    // Find the support team member
    const member = await this.userRepository.findOne({
      where: { id, role: UserRole.SUPPORT_TEAM },
    });

    if (!member) {
      throw new NotFoundException('Support team member not found');
    }

    // Update the status
    member.status = isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    await this.userRepository.save(member);

    // Send notification if needed
    try {
      await this.httpService.post(`${this.notificationServiceUrl}/notifications/support-member-status-updated`, {
        userId: member.id,
        isActive,
        updatedBy: adminUserId,
      }).toPromise();
    } catch (error) {
      console.error('Failed to send support member status update notification:', error);
    }
  }

  // Shift Management
  async createShift(dto: CreateShiftDto, adminUser: User): Promise<ShiftResponseDto> {
    if (![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(adminUser.role)) {
      throw new ForbiddenException('Only admins can create shifts');
    }

    // Verify assigned user is support team member
    const assignedUser = await this.userRepository.findOne({
      where: { id: dto.assignedUserId, role: UserRole.SUPPORT_TEAM },
    });

    if (!assignedUser) {
      throw new NotFoundException('Support team member not found');
    }

    // Check for conflicting shifts
    const existingShift = await this.shiftRepository.findOne({
      where: {
        shiftDate: new Date(dto.shiftDate),
        shiftType: dto.shiftType,
        status: In([ShiftStatus.SCHEDULED, ShiftStatus.ACTIVE]),
      },
    });

    if (existingShift) {
      throw new BadRequestException('A shift already exists for this time slot');
    }

    const shiftTimes = SupportShift.getShiftTimes(dto.shiftType);
    
    const shift = this.shiftRepository.create({
      shiftType: dto.shiftType,
      shiftDate: new Date(dto.shiftDate),
      startTime: shiftTimes.start,
      endTime: shiftTimes.end,
      assignedUserId: dto.assignedUserId,
      notes: dto.notes,
    });

    const savedShift = await this.shiftRepository.save(shift);
    return this.mapToShiftResponse(savedShift, assignedUser);
  }

  async getShifts(query: ShiftQueryDto): Promise<ShiftResponseDto[]> {
    const whereConditions: any = {};

    if (query.startDate && query.endDate) {
      whereConditions.shiftDate = Between(new Date(query.startDate), new Date(query.endDate));
    }

    if (query.shiftType) {
      whereConditions.shiftType = query.shiftType;
    }

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.assignedUserId) {
      whereConditions.assignedUserId = query.assignedUserId;
    }

    const shifts = await this.shiftRepository.find({
      where: whereConditions,
      relations: ['assignedUser'],
      order: { shiftDate: 'ASC', startTime: 'ASC' },
    });

    return shifts.map(shift => this.mapToShiftResponse(shift, shift.assignedUser));
  }

  async getUserShifts(userId: string, query: ShiftQueryDto): Promise<ShiftResponseDto[]> {
    const whereConditions: any = {
      assignedUserId: userId,
    };

    if (query.startDate && query.endDate) {
      whereConditions.shiftDate = Between(new Date(query.startDate), new Date(query.endDate));
    }

    if (query.shiftType) {
      whereConditions.shiftType = query.shiftType;
    }

    if (query.status) {
      whereConditions.status = query.status;
    }

    const shifts = await this.shiftRepository.find({
      where: whereConditions,
      relations: ['assignedUser'],
      order: { shiftDate: 'ASC', startTime: 'ASC' },
    });

    return shifts.map(shift => this.mapToShiftResponse(shift, shift.assignedUser));
  }

  async updateShift(id: string, dto: UpdateShiftDto, adminUser: User): Promise<ShiftResponseDto> {
    if (![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(adminUser.role)) {
      throw new ForbiddenException('Only admins can update shifts');
    }

    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['assignedUser'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (dto.assignedUserId) {
      const assignedUser = await this.userRepository.findOne({
        where: { id: dto.assignedUserId, role: UserRole.SUPPORT_TEAM },
      });

      if (!assignedUser) {
        throw new NotFoundException('Support team member not found');
      }

      shift.assignedUserId = dto.assignedUserId;
      shift.assignedUser = assignedUser;
    }

    if (dto.status) {
      shift.status = dto.status;
    }

    if (dto.notes !== undefined) {
      shift.notes = dto.notes;
    }

    const updatedShift = await this.shiftRepository.save(shift);
    return this.mapToShiftResponse(updatedShift, shift.assignedUser);
  }

  async getCurrentActiveShift(): Promise<ShiftResponseDto | null> {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = now.toISOString().split('T')[0];

    // Find active shift for current time
    const shifts = await this.shiftRepository.find({
      where: {
        shiftDate: new Date(today),
        status: In([ShiftStatus.SCHEDULED, ShiftStatus.ACTIVE]),
      },
      relations: ['assignedUser'],
    });

    const activeShift = shifts.find(shift => {
      if (shift.shiftType === ShiftType.NIGHT) {
        return currentTime >= shift.startTime || currentTime < shift.endTime;
      }
      return currentTime >= shift.startTime && currentTime < shift.endTime;
    });

    return activeShift ? this.mapToShiftResponse(activeShift, activeShift.assignedUser) : null;
  }

  async startShift(shiftId: string, userId: string): Promise<void> {
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
      relations: ['assignedUser'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.assignedUserId !== userId) {
      throw new ForbiddenException('You can only start your own shifts');
    }

    if (shift.status !== ShiftStatus.SCHEDULED) {
      throw new BadRequestException('Shift cannot be started');
    }

    // Check if shift time is appropriate
    if (!shift.isCurrentlyActive()) {
      throw new BadRequestException('Shift is not scheduled for current time');
    }

    shift.status = ShiftStatus.ACTIVE;
    await this.shiftRepository.save(shift);

    // Send notification about shift start
    try {
      await this.httpService.post(`${this.notificationServiceUrl}/support-notifications/shift-started`, {
        userId: shift.assignedUser.id,
        email: shift.assignedUser.email,
        userName: shift.assignedUser.firstName,
        shiftType: shift.shiftType,
        startTime: shift.startTime,
        endTime: shift.endTime,
      }).toPromise();
    } catch (error) {
      this.logger.error(`Failed to send shift start notification:`, error);
    }
  }

  async endShift(shiftId: string, userId: string): Promise<void> {
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
      relations: ['assignedUser'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.assignedUserId !== userId) {
      throw new ForbiddenException('You can only end your own shifts');
    }

    if (shift.status !== ShiftStatus.ACTIVE) {
      throw new BadRequestException('Shift is not active');
    }

    shift.status = ShiftStatus.COMPLETED;
    await this.shiftRepository.save(shift);

    // Send notification about shift end
    try {
      await this.httpService.post(`${this.notificationServiceUrl}/support-notifications/shift-ended`, {
        userId: shift.assignedUser.id,
        email: shift.assignedUser.email,
        userName: shift.assignedUser.firstName,
        shiftType: shift.shiftType,
        startTime: shift.startTime,
        endTime: shift.endTime,

      }).toPromise();
    } catch (error) {
      this.logger.error(`Failed to send shift end notification:`, error);
    }
  }

  async getShiftById(shiftId: string): Promise<SupportShift> {
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
      relations: ['assignedUser'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return shift;
  }

  async deleteShift(shiftId: string, userId: string): Promise<void> {
    // Find the shift
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
      relations: ['assignedUser'],
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Check if user has permission to delete (must be admin or the assigned user)
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const canDelete = user.role === UserRole.ADMIN || 
                     user.role === UserRole.SUPER_ADMIN || 
                     shift.assignedUserId === userId;

    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this shift');
    }

    // Can only delete scheduled shifts
    if (shift.status !== ShiftStatus.SCHEDULED) {
      throw new BadRequestException('Can only delete scheduled shifts');
    }

    await this.shiftRepository.remove(shift);
  }

  // Support Request Management
  async createSupportRequest(dto: CreateSupportRequestDto, requesterId: string): Promise<SupportRequestResponseDto> {
    const request = this.routingRepository.create({
      requesterId: requesterId,
      requestType: dto.requestType,
      priority: dto.priority || Priority.MEDIUM,
      description: dto.description,
      metadata: dto.metadata,
    });

    const savedRequest = await this.routingRepository.save(request);

    // Auto-assign to current active shift
    await this.autoAssignRequest(savedRequest.id);

    const fullRequest = await this.routingRepository.findOne({
      where: { id: savedRequest.id },
      relations: ['requester', 'assignedSupportUser', 'shift'],
    });

    return this.mapToSupportRequestResponse(fullRequest!);
  }

  async autoAssignRequest(requestId: string): Promise<void> {
    const activeShift = await this.getCurrentActiveShift();
    
    if (activeShift) {
      await this.routingRepository.update(requestId, {
        assignedSupportUserId: activeShift.assignedUser.id,
        shiftId: activeShift.id,
        status: RoutingStatus.ASSIGNED,
        assignedAt: new Date(),
      });

      // Send notification to assigned support user via notification service
      const request = await this.routingRepository.findOne({
        where: { id: requestId },
        relations: ['requester', 'assignedSupportUser'],
      });

      if (request && request.assignedSupportUser) {
        try {
          await this.httpService.post(`${this.notificationServiceUrl}/support-notifications/support-request-assigned`, {
            userId: request.assignedSupportUser.id,
            email: request.assignedSupportUser.email,
            phoneNumber: request.assignedSupportUser.phoneNumber,
            userName: request.assignedSupportUser.firstName,
            requestId: request.id,
            requestType: request.requestType,
            priority: request.priority,
            description: request.description,
            requesterEmail: request.requester.email,
          }).toPromise();
        } catch (error) {
          this.logger.error(`Failed to send support request notification:`, error);
        }
      }
    }
  }

  async getSupportRequests(query: SupportRequestQueryDto): Promise<SupportRequestResponseDto[]> {
    const whereConditions: any = {};

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.requestType) {
      whereConditions.requestType = query.requestType;
    }

    if (query.priority) {
      whereConditions.priority = query.priority;
    }

    if (query.assignedSupportUserId) {
      whereConditions.assignedSupportUserId = query.assignedSupportUserId;
    }

    if (query.requesterId) {
      whereConditions.requesterId = query.requesterId;
    }

    if (query.startDate && query.endDate) {
      whereConditions.createdAt = Between(new Date(query.startDate), new Date(query.endDate));
    }

    const requests = await this.routingRepository.find({
      where: whereConditions,
      relations: ['requester', 'assignedSupportUser', 'shift'],
      order: { createdAt: 'DESC' },
    });

    return requests.map(request => this.mapToSupportRequestResponse(request));
  }

  async getUserSupportRequests(userId: string, query: SupportRequestQueryDto): Promise<SupportRequestResponseDto[]> {
    const whereConditions: any = {
      requesterId: userId,
    };

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.requestType) {
      whereConditions.requestType = query.requestType;
    }

    if (query.priority) {
      whereConditions.priority = query.priority;
    }

    if (query.startDate && query.endDate) {
      whereConditions.createdAt = Between(new Date(query.startDate), new Date(query.endDate));
    }

    const requests = await this.routingRepository.find({
      where: whereConditions,
      relations: ['requester', 'assignedSupportUser', 'shift'],
      order: { createdAt: 'DESC' },
    });

    return requests.map(request => this.mapToSupportRequestResponse(request));
  }

  async getAssignedSupportRequests(userId: string, query: SupportRequestQueryDto): Promise<SupportRequestResponseDto[]> {
    const whereConditions: any = {
      assignedSupportUserId: userId,
    };

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.priority) {
      whereConditions.priority = query.priority;
    }

    if (query.startDate && query.endDate) {
      whereConditions.createdAt = Between(new Date(query.startDate), new Date(query.endDate));
    }

    const requests = await this.routingRepository.find({
      where: whereConditions,
      relations: ['requester', 'assignedSupportUser', 'shift'],
      order: { createdAt: 'DESC' },
      take: query.limit || 50,
      skip: query.offset || 0,
    });

    return requests.map(request => this.mapToSupportRequestResponse(request));
  }

  async getSupportRequestById(id: string, userId: string, userRole: UserRole): Promise<SupportRequestResponseDto | null> {
    const whereConditions: any = { id };

    // Non-admin users can only see their own requests or requests assigned to them
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      whereConditions.OR = [
        { requesterId: userId },
        { assignedSupportUserId: userId }
      ];
    }

    const request = await this.routingRepository.findOne({
      where: whereConditions,
      relations: ['requester', 'assignedSupportUser', 'shift'],
    });

    return request ? this.mapToSupportRequestResponse(request) : null;
  }

  async takeSupportRequest(id: string, userId: string): Promise<SupportRequestResponseDto> {
    const request = await this.routingRepository.findOne({
      where: { id },
      relations: ['requester', 'assignedSupportUser', 'shift'],
    });

    if (!request) {
      throw new NotFoundException('Support request not found');
    }

    if (request.assignedSupportUserId && request.assignedSupportUserId !== userId) {
      throw new BadRequestException('Support request is already assigned to another team member');
    }

    if (request.status === RoutingStatus.RESOLVED) {
      throw new BadRequestException('Cannot take a resolved support request');
    }

    // Assign the request to the current user
    request.assignedSupportUserId = userId;
    request.status = RoutingStatus.IN_PROGRESS;
    request.assignedAt = new Date();
    request.startedAt = new Date();

    const updatedRequest = await this.routingRepository.save(request);

    // Send notification about assignment
    try {
      await this.httpService.post(`${this.notificationServiceUrl}/support-notifications/support-request-taken`, {
        requestId: request.id,
        assignedToId: userId,
        requesterId: request.requesterId,
        requestType: request.requestType,
        priority: request.priority,
        description: request.description,
      }).toPromise();
    } catch (error) {
      this.logger.warn('Failed to send assignment notification', error.message);
    }

    return this.mapToSupportRequestResponse(updatedRequest);
  }

  async updateSupportRequest(id: string, dto: UpdateSupportRequestDto, currentUserId: string): Promise<SupportRequestResponseDto> {
    const request = await this.routingRepository.findOne({
      where: { id },
      relations: ['requester', 'assignedSupportUser', 'shift'],
    });

    if (!request) {
      throw new NotFoundException('Support request not found');
    }

    // Check permissions
    const currentUser = await this.userRepository.findOne({ where: { id: currentUserId } });
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    
    if (currentUser.role === UserRole.SUPPORT_TEAM && request.assignedSupportUserId !== currentUserId) {
      throw new ForbiddenException('You can only update requests assigned to you');
    }

    if (dto.status) {
      request.status = dto.status;
      
      if (dto.status === RoutingStatus.IN_PROGRESS && !request.startedAt) {
        request.startedAt = new Date();
      }
      
      if (dto.status === RoutingStatus.RESOLVED && !request.resolvedAt) {
        request.resolvedAt = new Date();
      }
      
      if (dto.status === RoutingStatus.ESCALATED && !request.escalatedAt) {
        request.escalatedAt = new Date();
      }
    }

    if (dto.priority) {
      request.priority = dto.priority;
    }

    if (dto.resolution !== undefined) {
      request.resolution = dto.resolution;
    }

    if (dto.notes !== undefined) {
      request.notes = dto.notes;
    }

    if (dto.metadata) {
      request.metadata = { ...request.metadata, ...dto.metadata };
    }

    const updatedRequest = await this.routingRepository.save(request);
    return this.mapToSupportRequestResponse(updatedRequest);
  }

  async assignSupportRequest(id: string, dto: AssignSupportRequestDto, adminUserId: string): Promise<SupportRequestResponseDto> {
    const adminUser = await this.userRepository.findOne({ where: { id: adminUserId } });
    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }
    
    if (![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(adminUser.role)) {
      throw new ForbiddenException('Only admins can manually assign requests');
    }

    const request = await this.routingRepository.findOne({
      where: { id },
      relations: ['requester', 'assignedSupportUser', 'shift'],
    });

    if (!request) {
      throw new NotFoundException('Support request not found');
    }

    const supportUser = await this.userRepository.findOne({
      where: { id: dto.assignedSupportUserId, role: UserRole.SUPPORT_TEAM },
    });

    if (!supportUser) {
      throw new NotFoundException('Support team member not found');
    }

    request.assignedSupportUserId = dto.assignedSupportUserId;
    request.status = RoutingStatus.ASSIGNED;
    request.assignedAt = new Date();
    
    if (dto.notes) {
      request.notes = dto.notes;
    }

    const updatedRequest = await this.routingRepository.save(request);
    
    // Send notification via notification service
    try {
      await this.httpService.post(`${this.notificationServiceUrl}/support-notifications/support-request-assigned`, {
        userId: supportUser.id,
        email: supportUser.email,
        phoneNumber: supportUser.phoneNumber,
        userName: supportUser.firstName,
        requestId: request.id,
        requestType: request.requestType,
        priority: request.priority,
        description: request.description,
        requesterEmail: request.requester.email,
      }).toPromise();
    } catch (error) {
      this.logger.error(`Failed to send support request assignment notification:`, error);
    }

    return this.mapToSupportRequestResponse(updatedRequest);
  }

  async escalateSupportRequest(id: string, reason: string, escalatedByUserId: string): Promise<SupportRequestResponseDto> {
    const request = await this.routingRepository.findOne({
      where: { id },
      relations: ['requester', 'assignedSupportUser', 'shift'],
    });

    if (!request) {
      throw new NotFoundException('Support request not found');
    }

    const escalatedByUser = await this.userRepository.findOne({ where: { id: escalatedByUserId } });
    if (!escalatedByUser) {
      throw new NotFoundException('User not found');
    }

    // Update request status to escalated
    request.status = RoutingStatus.ESCALATED;
    request.escalatedAt = new Date();
    request.escalationReason = reason;

    const updatedRequest = await this.routingRepository.save(request);

    // Send escalation notification
    try {
      await this.httpService.post(`${this.notificationServiceUrl}/support-notifications/support-escalation-email`, {
        userId: request.assignedSupportUser?.id,
        email: request.assignedSupportUser?.email,
        userName: request.assignedSupportUser?.firstName,
        requestId: request.id,
        requestType: request.requestType,
        priority: request.priority,
        description: request.description,
        escalatedBy: escalatedByUser.firstName + ' ' + escalatedByUser.lastName,
        escalationReason: reason,
      }).toPromise();
    } catch (error) {
      this.logger.error(`Failed to send escalation notification:`, error);
    }

    return this.mapToSupportRequestResponse(updatedRequest);
  }

  async getSupportDashboard(userId: string, userRole: UserRole): Promise<SupportDashboardDto> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get active shifts
    const activeShifts = await this.getShifts({
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
      status: ShiftStatus.ACTIVE,
    });

    // Get pending requests
    const pendingRequests = await this.getSupportRequests({
      status: RoutingStatus.PENDING,
    });

    // Get user's assigned requests (if support team member)
    let myAssignedRequests: SupportRequestResponseDto[] = [];
    if (userRole === UserRole.SUPPORT_TEAM) {
      myAssignedRequests = await this.getSupportRequests({
        assignedSupportUserId: userId,
        status: RoutingStatus.ASSIGNED,
      });
    }

    // Get overdue requests
    const allActiveRequests = await this.getSupportRequests({
      status: RoutingStatus.ASSIGNED,
    });
    const overdueRequests = allActiveRequests.filter(req => req.isOverdue);

    // Calculate today's stats
    const todayRequests = await this.routingRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    const resolvedToday = todayRequests.filter(req => req.status === RoutingStatus.RESOLVED);
    const avgResponseTime = this.calculateAverageResponseTime(todayRequests);
    const avgResolutionTime = this.calculateAverageResolutionTime(resolvedToday);

    // Get upcoming shifts
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const upcomingShifts = await this.getShifts({
      startDate: tomorrow.toISOString(),
      endDate: new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Calculate request type breakdown
    const allRequests = [...pendingRequests, ...myAssignedRequests];
    const requestsByType = {
      [RequestType.GENERAL_INQUIRY]: allRequests.filter(r => r.requestType === RequestType.GENERAL_INQUIRY).length,
      [RequestType.TECHNICAL_SUPPORT]: allRequests.filter(r => r.requestType === RequestType.TECHNICAL_SUPPORT).length,
      [RequestType.BILLING_INQUIRY]: allRequests.filter(r => r.requestType === RequestType.BILLING_INQUIRY).length,
      [RequestType.THERAPIST_SUPPORT]: allRequests.filter(r => r.requestType === RequestType.THERAPIST_SUPPORT).length,
      [RequestType.EMERGENCY]: allRequests.filter(r => r.requestType === RequestType.EMERGENCY).length,
      [RequestType.OTHER]: allRequests.filter(r => r.requestType === RequestType.OTHER).length,
    };

    // Calculate priority breakdown
    const requestsByPriority = {
      [Priority.LOW]: allRequests.filter(r => r.priority === Priority.LOW).length,
      [Priority.MEDIUM]: allRequests.filter(r => r.priority === Priority.MEDIUM).length,
      [Priority.HIGH]: allRequests.filter(r => r.priority === Priority.HIGH).length,
      [Priority.URGENT]: allRequests.filter(r => r.priority === Priority.URGENT).length,
    };

    return {
      totalRequests: todayRequests.length,
      pendingRequests: pendingRequests.length,
      inProgressRequests: myAssignedRequests.length,
      resolvedRequests: resolvedToday.length,
      escalatedRequests: allRequests.filter(r => r.status === RoutingStatus.ESCALATED).length,
      averageResponseTime: avgResponseTime,
      averageResolutionTime: avgResolutionTime,
      activeShifts: activeShifts.length,
      availableAgents: activeShifts.filter(shift => shift.status === ShiftStatus.ACTIVE).length,
      requestsByType,
      requestsByPriority,
      recentRequests: allRequests.slice(0, 10),
      overdueRequests,
    } as SupportDashboardDto;
  }

  // Notification System
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkShiftNotifications(): Promise<void> {
    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
    const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000);

    // Find shifts starting in 30 minutes (SMS notification)
    const shiftsFor30MinSms = await this.shiftRepository.find({
      where: {
        shiftDate: new Date(now.toISOString().split('T')[0]),
        status: ShiftStatus.SCHEDULED,
        smsNotificationSent: false,
      },
      relations: ['assignedUser'],
    });

    for (const shift of shiftsFor30MinSms) {
      const shiftDateTime = this.getShiftDateTime(shift);
      const timeDiff = shiftDateTime.getTime() - now.getTime();
      
      if (timeDiff <= 30 * 60 * 1000 && timeDiff > 25 * 60 * 1000) {
        if (shift.assignedUser.phoneNumber) {
          try {
            await this.httpService.post(`${this.notificationServiceUrl}/support-notifications/shift-reminder/sms`, {
              userId: shift.assignedUser.id,
              phoneNumber: shift.assignedUser.phoneNumber,
              userName: shift.assignedUser.firstName,
              shiftType: shift.shiftType,
              startTime: shift.startTime,
              endTime: shift.endTime,
            }).toPromise();
          } catch (error) {
            this.logger.error(`Failed to send SMS shift reminder:`, error);
          }
        }
        
        shift.smsNotificationSent = true;
        shift.smsNotificationSentAt = now;
        await this.shiftRepository.save(shift);
      }
    }

    // Find shifts starting in 10 minutes (Email notification)
    const shiftsFor10MinEmail = await this.shiftRepository.find({
      where: {
        shiftDate: new Date(now.toISOString().split('T')[0]),
        status: ShiftStatus.SCHEDULED,
        emailNotificationSent: false,
      },
      relations: ['assignedUser'],
    });

    for (const shift of shiftsFor10MinEmail) {
      const shiftDateTime = this.getShiftDateTime(shift);
      const timeDiff = shiftDateTime.getTime() - now.getTime();
      
      if (timeDiff <= 10 * 60 * 1000 && timeDiff > 5 * 60 * 1000) {
        try {
          await this.httpService.post(`${this.notificationServiceUrl}/support-notifications/shift-reminder/email`, {
            userId: shift.assignedUser.id,
            email: shift.assignedUser.email,
            userName: shift.assignedUser.firstName,
            shiftType: shift.shiftType,
            startTime: shift.startTime,
            endTime: shift.endTime,
          }).toPromise();
        } catch (error) {
          this.logger.error(`Failed to send email shift reminder:`, error);
        }
        
        shift.emailNotificationSent = true;
        shift.emailNotificationSentAt = now;
        await this.shiftRepository.save(shift);
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateShiftStatuses(): Promise<void> {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = now.toISOString().split('T')[0];

    // Activate shifts that should be starting
    const shiftsToActivate = await this.shiftRepository.find({
      where: {
        shiftDate: new Date(today),
        status: ShiftStatus.SCHEDULED,
      },
    });

    for (const shift of shiftsToActivate) {
      if (shift.isCurrentlyActive()) {
        shift.status = ShiftStatus.ACTIVE;
        await this.shiftRepository.save(shift);
      }
    }

    // Complete shifts that have ended
    const shiftsToComplete = await this.shiftRepository.find({
      where: {
        status: ShiftStatus.ACTIVE,
      },
    });

    for (const shift of shiftsToComplete) {
      if (!shift.isCurrentlyActive()) {
        shift.status = ShiftStatus.COMPLETED;
        await this.shiftRepository.save(shift);
      }
    }
  }

  // Helper Methods
  private async mapToSupportTeamMemberResponse(user: User): Promise<SupportTeamMemberResponseDto> {
    const currentShift = await this.shiftRepository.findOne({
      where: {
        assignedUserId: user.id,
        shiftDate: new Date(),
        status: In([ShiftStatus.SCHEDULED, ShiftStatus.ACTIVE]),
      },
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      currentShift: currentShift ? {
        id: currentShift.id,
        shiftType: currentShift.shiftType,
        shiftDate: currentShift.shiftDate,
        status: currentShift.status,
      } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private mapToShiftResponse(shift: SupportShift, assignedUser: User): ShiftResponseDto {
    return {
      id: shift.id,
      shiftType: shift.shiftType,
      shiftDate: shift.shiftDate,
      startTime: shift.startTime,
      endTime: shift.endTime,
      status: shift.status,
      assignedUser: {
        id: assignedUser.id,
        firstName: assignedUser.firstName,
        lastName: assignedUser.lastName,
        email: assignedUser.email,
        phoneNumber: assignedUser.phoneNumber,
      },
      smsNotificationSent: shift.smsNotificationSent,
      emailNotificationSent: shift.emailNotificationSent,
      smsNotificationSentAt: shift.smsNotificationSentAt,
      emailNotificationSentAt: shift.emailNotificationSentAt,
      notes: shift.notes,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    };
  }

  private mapToSupportRequestResponse(request: SupportRouting): SupportRequestResponseDto {
    return {
      id: request.id,
      requestType: request.requestType,
      priority: request.priority,
      status: request.status,
      description: request.description,
      resolution: request.resolution,
      requester: {
        id: request.requester.id,
        firstName: request.requester.firstName,
        lastName: request.requester.lastName,
        email: request.requester.email,
      },
      assignedSupportUser: request.assignedSupportUser ? {
        id: request.assignedSupportUser.id,
        firstName: request.assignedSupportUser.firstName,
        lastName: request.assignedSupportUser.lastName,
        email: request.assignedSupportUser.email,
        phoneNumber: request.assignedSupportUser.phoneNumber,
      } : undefined,
      shift: request.shift ? {
        id: request.shift.id,
        shiftType: request.shift.shiftType,
        shiftDate: request.shift.shiftDate,
      } : undefined,
      assignedAt: request.assignedAt,
      startedAt: request.startedAt,
      resolvedAt: request.resolvedAt,
      escalatedAt: request.escalatedAt,
      responseTime: request.getResponseTime(),
      resolutionTime: request.getResolutionTime(),
      isOverdue: request.isOverdue(),
      metadata: request.metadata,
      notes: request.notes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  private getShiftDateTime(shift: SupportShift): Date {
    const [hours, minutes] = shift.startTime.split(':').map(Number);
    const shiftDate = new Date(shift.shiftDate);
    shiftDate.setHours(hours, minutes, 0, 0);
    return shiftDate;
  }

  private calculateAverageResponseTime(requests: SupportRouting[]): number {
    const responseTimes = requests
      .map(req => req.getResponseTime())
      .filter(time => time !== null) as number[];
    
    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
  }

  private calculateAverageResolutionTime(requests: SupportRouting[]): number {
    const resolutionTimes = requests
      .map(req => req.getResolutionTime())
      .filter(time => time !== null) as number[];
    
    return resolutionTimes.length > 0 
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
      : 0;
  }

  async updateNotificationPreferences(userId: string, preferencesDto: NotificationPreferencesDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user contact information for notifications
    if (preferencesDto.smsNumber) {
      user.phoneNumber = preferencesDto.smsNumber;
    }
    if (preferencesDto.emailAddress) {
      user.email = preferencesDto.emailAddress;
    }

    await this.userRepository.save(user);
    
    // Note: SMS and email enabled flags would typically be stored in a separate
    // notification preferences table or handled by the notification service
    this.logger.log(`Updated notification preferences for user ${userId}`);
  }

  async createShiftTemplate(templateData: any, createdBy: string): Promise<any> {
    // Placeholder implementation for shift template creation
    // This would typically involve creating a shift template entity
    throw new BadRequestException('Shift template functionality not yet implemented');
  }

  async generateShiftsFromTemplate(
    templateId: string,
    startDate: Date,
    endDate: Date,
    createdBy: string
  ): Promise<number> {
    // Placeholder implementation for generating shifts from template
    // This would typically involve reading a template and creating multiple shifts
    throw new BadRequestException('Generate shifts from template functionality not yet implemented');
  }

  async toggleAutoRouting(enabled: boolean, userId: string): Promise<boolean> {
    this.autoRoutingEnabled = enabled;
    this.logger.log(`Auto-routing ${enabled ? 'enabled' : 'disabled'} by user ${userId}`);
    return this.autoRoutingEnabled;
  }

  async getRoutingStatus(): Promise<{ autoRoutingEnabled: boolean; activeShifts: number; pendingRequests: number }> {
    const activeShifts = await this.shiftRepository.count({
      where: {
        status: ShiftStatus.ACTIVE,
        shiftDate: new Date(),
      },
    });

    const pendingRequests = await this.routingRepository.count({
      where: {
        status: RoutingStatus.PENDING,
      },
    });

    return {
      autoRoutingEnabled: this.autoRoutingEnabled,
      activeShifts,
      pendingRequests,
    };
  }

  async getPersonalDashboard(userId: string): Promise<SupportDashboardDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's active shifts
    const activeShifts = await this.shiftRepository.find({
      where: {
        assignedUserId: userId,
        status: ShiftStatus.ACTIVE,
      },
    });

    // Get assigned requests
    const assignedRequests = await this.routingRepository.find({
      where: {
        assignedSupportUserId: userId,
        status: RoutingStatus.ASSIGNED,
      },
    });

    // Get pending requests
    const pendingRequests = await this.routingRepository.find({
      where: {
        status: RoutingStatus.PENDING,
      },
    });

    // Get overdue requests (placeholder logic)
    const overdueRequests = await this.routingRepository.find({
      where: {
        assignedSupportUserId: userId,
        status: RoutingStatus.ASSIGNED,
      },
      take: 5, // Limit for demo
    });

    // Convert shifts to DTOs
    const activeShiftDtos = await Promise.all(
      activeShifts.map(shift => this.toShiftResponseDto(shift))
    );

    // Convert routing requests to response DTOs
    const pendingRequestDtos = await Promise.all(
      pendingRequests.map(request => this.mapToSupportRequestResponse(request))
    );
    const assignedRequestDtos = await Promise.all(
      assignedRequests.map(request => this.mapToSupportRequestResponse(request))
    );
    const overdueRequestDtos = await Promise.all(
      overdueRequests.map(request => this.mapToSupportRequestResponse(request))
    );

    // Calculate request type breakdown
    const requestsByType = {
      [RequestType.GENERAL_INQUIRY]: pendingRequests.filter(r => r.requestType === RequestType.GENERAL_INQUIRY).length,
      [RequestType.TECHNICAL_SUPPORT]: pendingRequests.filter(r => r.requestType === RequestType.TECHNICAL_SUPPORT).length,
      [RequestType.BILLING_INQUIRY]: pendingRequests.filter(r => r.requestType === RequestType.BILLING_INQUIRY).length,
      [RequestType.THERAPIST_SUPPORT]: pendingRequests.filter(r => r.requestType === RequestType.THERAPIST_SUPPORT).length,
      [RequestType.EMERGENCY]: pendingRequests.filter(r => r.requestType === RequestType.EMERGENCY).length,
      [RequestType.OTHER]: pendingRequests.filter(r => r.requestType === RequestType.OTHER).length,
    };

    // Calculate priority breakdown
    const requestsByPriority = {
      [Priority.LOW]: pendingRequests.filter(r => r.priority === Priority.LOW).length,
      [Priority.MEDIUM]: pendingRequests.filter(r => r.priority === Priority.MEDIUM).length,
      [Priority.HIGH]: pendingRequests.filter(r => r.priority === Priority.HIGH).length,
      [Priority.URGENT]: pendingRequests.filter(r => r.priority === Priority.URGENT).length,
    };

    return {
      totalRequests: pendingRequests.length + assignedRequests.length,
      pendingRequests: pendingRequests.length,
      inProgressRequests: assignedRequests.length,
      resolvedRequests: 0, // Placeholder - would need resolved status
      escalatedRequests: 0, // Placeholder - would need escalated status
      averageResponseTime: 15.5, // Placeholder - would calculate from actual data
      averageResolutionTime: 240.8, // Placeholder - would calculate from actual data
      activeShifts: activeShiftDtos.length,
      availableAgents: activeShiftDtos.filter(shift => shift.status === ShiftStatus.ACTIVE).length,
      requestsByType,
      requestsByPriority,
      recentRequests: pendingRequestDtos.slice(0, 10),
      overdueRequests: overdueRequestDtos,
    };
  }

  private async toShiftResponseDto(shift: SupportShift): Promise<ShiftResponseDto> {
    // Get assigned user details
    const assignedUser = await this.userRepository.findOne({
      where: { id: shift.assignedUserId },
    });

    return {
      id: shift.id,
      shiftType: shift.shiftType,
      shiftDate: shift.shiftDate,
      startTime: shift.startTime,
      endTime: shift.endTime,
      status: shift.status,
      assignedUser: assignedUser ? {
        id: assignedUser.id,
        firstName: assignedUser.firstName,
        lastName: assignedUser.lastName,
        email: assignedUser.email,
        phoneNumber: assignedUser.phoneNumber,
      } : {
        id: shift.assignedUserId,
        firstName: 'Unknown',
        lastName: 'User',
        email: 'unknown@example.com',
      },
      smsNotificationSent: false, // Placeholder
      emailNotificationSent: false, // Placeholder
      smsNotificationSentAt: undefined,
      emailNotificationSentAt: undefined,
      notes: shift.notes,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    };
  }
}