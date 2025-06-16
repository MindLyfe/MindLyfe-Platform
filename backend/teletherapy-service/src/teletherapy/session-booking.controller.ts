import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeletherapyService } from './teletherapy.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { BookSessionDto } from './dto/book-session.dto';
import axios from 'axios';

@ApiTags('Session Booking')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionBookingController {
  constructor(private readonly teletherapyService: TeletherapyService) {}

  @Post('book')
  @ApiOperation({ summary: 'Book a new therapy session' })
  @ApiResponse({ status: 201, description: 'Session booked successfully' })
  @ApiResponse({ status: 403, description: 'Cannot book session - no available sessions or weekly limit reached' })
  @ApiResponse({ status: 400, description: 'Invalid booking data' })
  async bookSession(
    @Request() req,
    @Body() bookSessionDto: BookSessionDto
  ) {
    try {
      // 1. Validate user can book session via auth service
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
      const serviceToken = process.env.JWT_SERVICE_SECRET || 'mindlyfe-service-secret-key-dev';
      
      const validationResponse = await axios.get(
        `${authServiceUrl}/api/subscriptions/validate-booking/${req.user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${serviceToken}`,
            'X-Service-Name': 'teletherapy-service'
          }
        }
      );

      const validation = validationResponse.data;
      if (!validation.canBook) {
        throw new HttpException(validation.reason || 'Cannot book session', HttpStatus.FORBIDDEN);
      }

      // 2. Create session data for teletherapy service
      const createSessionData: CreateSessionDto = {
        clientId: req.user.id,
        therapistId: bookSessionDto.therapistId,
        startTime: bookSessionDto.sessionDate,
        endTime: new Date(new Date(bookSessionDto.sessionDate).getTime() + (bookSessionDto.duration || 60) * 60000),
        type: bookSessionDto.sessionType as any, // TODO: Fix type mapping
        category: 'individual' as any, // Default to individual
        focus: [], // Default empty focus array
        title: `Therapy Session with ${bookSessionDto.therapistId}`, // Default title
        metadata: {
          notes: bookSessionDto.notes,
          isEmergency: bookSessionDto.isEmergency || false
        }
      };

      // 3. Create session in teletherapy service
      const session = await this.teletherapyService.createSession(createSessionData, req.user);

      // 4. Consume session from user's subscription
      try {
        const consumeResponse = await axios.post(
          `${authServiceUrl}/api/subscriptions/consume-session/${req.user.id}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${serviceToken}`,
              'X-Service-Name': 'teletherapy-service'
            }
          }
        );

        const sessionPayment = consumeResponse.data;
        
        // 5. Update session with payment information
        await this.teletherapyService.updateSessionPayment(session.id, sessionPayment);

        return {
          ...session,
          paymentInfo: sessionPayment,
          availableSessions: validation.availableSessions - 1
        };

      } catch (consumeError) {
        // If consumption fails, we should probably cancel the session
        await this.teletherapyService.cancelSession(session.id, req.user, 'Payment processing failed');
        throw new HttpException(
          'Failed to process session payment. Session cancelled.',
          HttpStatus.PAYMENT_REQUIRED
        );
      }

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      if (error.response) {
        // Auth service returned an error
        throw new HttpException(
          error.response.data.message || 'Subscription validation failed',
          error.response.status || HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        'Failed to book session',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user sessions' })
  @ApiResponse({ status: 200, description: 'User sessions retrieved successfully' })
  async getMySessions(@Request() req) {
    return await this.teletherapyService.getSessionsByUser(req.user.id);
  }

  @Get('available-therapists')
  @ApiOperation({ summary: 'Get list of available therapists' })
  @ApiResponse({ status: 200, description: 'Available therapists retrieved successfully' })
  async getAvailableTherapists() {
    return await this.teletherapyService.getAvailableTherapists();
  }

  @Get('available-slots/:therapistId')
  @ApiOperation({ summary: 'Get available time slots for a therapist' })
  @ApiResponse({ status: 200, description: 'Available slots retrieved successfully' })
  async getAvailableSlots(
    @Param('therapistId') therapistId: string,
    @Request() req
  ) {
    const date = req.query.date as string;
    const endDate = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return await this.teletherapyService.getAvailableSlots(therapistId, date, endDate, 60);
  }

  @Get('subscription-status')
  @ApiOperation({ summary: 'Get user subscription status from auth service' })
  @ApiResponse({ status: 200, description: 'Subscription status retrieved successfully' })
  async getSubscriptionStatus(@Request() req) {
    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
      
      const response = await axios.get(
        `${authServiceUrl}/api/subscriptions/status`,
        {
          headers: {
            'Authorization': req.headers.authorization
          }
        }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message || 'Failed to get subscription status',
          error.response.status || HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException(
        'Failed to connect to auth service',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}