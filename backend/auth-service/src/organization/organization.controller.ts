import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrganizationService, CreateOrganizationDto, AddUserToOrganizationDto, OrganizationSubscriptionDto } from './organization.service';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid organization data' })
  async createOrganization(
    @Request() req,
    @Body() createDto: Omit<CreateOrganizationDto, 'adminUserId'>
  ) {
    const fullDto: CreateOrganizationDto = {
      ...createDto,
      adminUserId: req.user.id
    };

    return await this.organizationService.createOrganization(fullDto);
  }

  @Post(':organizationId/subscription')
  @ApiOperation({ summary: 'Create organization subscription payment' })
  @ApiResponse({ status: 201, description: 'Subscription payment created successfully' })
  @ApiResponse({ status: 403, description: 'Only organization admins can create subscriptions' })
  async createOrganizationSubscription(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Body() subscriptionDto: Omit<OrganizationSubscriptionDto, 'organizationId' | 'adminUserId'>
  ) {
    const fullDto: OrganizationSubscriptionDto = {
      ...subscriptionDto,
      organizationId,
      adminUserId: req.user.id
    };

    return await this.organizationService.createOrganizationSubscription(fullDto);
  }

  @Post('payment/:paymentId/confirm')
  @ApiOperation({ summary: 'Confirm organization payment and activate subscription' })
  @ApiResponse({ status: 200, description: 'Payment confirmed and organization activated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async confirmOrganizationPayment(@Param('paymentId') paymentId: string) {
    return await this.organizationService.confirmOrganizationPayment(paymentId);
  }

  @Post(':organizationId/users/add')
  @ApiOperation({ summary: 'Add user to organization' })
  @ApiResponse({ status: 200, description: 'User added to organization successfully' })
  @ApiResponse({ status: 403, description: 'Only organization admins can add users' })
  async addUserToOrganization(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Body() addUserDto: Omit<AddUserToOrganizationDto, 'organizationId' | 'adminUserId'>
  ) {
    const fullDto: AddUserToOrganizationDto = {
      ...addUserDto,
      organizationId,
      adminUserId: req.user.id
    };

    return await this.organizationService.addUserToOrganization(fullDto);
  }

  @Delete(':organizationId/users/:userId')
  @ApiOperation({ summary: 'Remove user from organization' })
  @ApiResponse({ status: 200, description: 'User removed from organization successfully' })
  @ApiResponse({ status: 403, description: 'Only organization admins can remove users' })
  async removeUserFromOrganization(
    @Request() req,
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string
  ) {
    return await this.organizationService.removeUserFromOrganization(
      organizationId,
      userId,
      req.user.id
    );
  }

  @Get(':organizationId')
  @ApiOperation({ summary: 'Get organization details' })
  @ApiResponse({ status: 200, description: 'Organization details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganizationDetails(@Param('organizationId') organizationId: string) {
    return await this.organizationService.getOrganizationDetails(organizationId);
  }

  @Get('my/organization')
  @ApiOperation({ summary: 'Get current user organization details' })
  @ApiResponse({ status: 200, description: 'User organization details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User is not part of any organization' })
  async getMyOrganization(@Request() req) {
    return await this.organizationService.getUserOrganization(req.user.id);
  }
} 