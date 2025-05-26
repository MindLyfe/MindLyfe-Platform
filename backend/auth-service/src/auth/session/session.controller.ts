import { Controller, Get, Delete, Param, UseGuards, Req, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SessionService } from './session.service';
import { Roles } from '../roles/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('me')
  @ApiOperation({ 
    summary: 'Get current user\'s active sessions',
    description: 'Returns a list of all active sessions for the currently authenticated user. This includes details like device, IP address, and last activity.'
  })
  @ApiResponse({ 
    status: 200,
    description: 'Returns the user\'s active sessions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t' },
          ipAddress: { type: 'string', example: '192.168.1.1' },
          userAgent: { type: 'string', example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          deviceInfo: { type: 'string', example: 'Windows 10, Chrome 91.0.4472.124' },
          lastUsedAt: { type: 'string', format: 'date-time', example: '2025-05-18T12:34:56.789Z' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-05-15T09:23:45.678Z' },
          expiresAt: { type: 'string', format: 'date-time', example: '2025-05-25T09:23:45.678Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  async getUserSessions(@Req() req) {
    return this.sessionService.getUserActiveSessions(req.user.sub);
  }

  @Delete('me/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Revoke a specific session for the current user',
    description: 'Terminates a specific session identified by sessionId. This will immediately invalidate the associated refresh token.'
  })
  @ApiParam({
    name: 'sessionId',
    description: 'The ID of the session to revoke',
    type: 'string',
    example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t'
  })
  @ApiResponse({ status: 204, description: 'Session revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Session belongs to another user' })
  async revokeSession(@Req() req, @Param('sessionId') sessionId: string) {
    const session = await this.sessionService.findSessionByToken(sessionId);
    
    if (!session) {
      return; // Return 204 even if session doesn't exist
    }
    
    // Check if the session belongs to the current user
    if (session.userId !== req.user.sub) {
      throw new ForbiddenException('You can only revoke your own sessions');
    }
    
    await this.sessionService.revokeSession(sessionId, 'User initiated revocation');
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Revoke all sessions for the current user except the current one',
    description: 'Terminates all sessions for the user except the one making this request. This is useful for logging out from other devices.'
  })
  @ApiResponse({ status: 204, description: 'All other sessions revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  async revokeAllSessions(@Req() req) {
    const currentSessionId = req.headers['x-session-id'];
    await this.sessionService.revokeAllUserSessions(
      req.user.sub,
      'User initiated revocation of all sessions',
      currentSessionId
    );
  }

  // Admin endpoints
  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get active sessions for a specific user (admin only)',
    description: 'Returns a list of all active sessions for a specified user. This endpoint is restricted to administrators.'
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user whose sessions to retrieve',
    type: 'string',
    example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a'
  })
  @ApiResponse({ 
    status: 200,
    description: 'Returns the user\'s active sessions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t' },
          ipAddress: { type: 'string', example: '192.168.1.1' },
          userAgent: { type: 'string', example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          deviceInfo: { type: 'string', example: 'Windows 10, Chrome 91.0.4472.124' },
          lastUsedAt: { type: 'string', format: 'date-time', example: '2025-05-18T12:34:56.789Z' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-05-15T09:23:45.678Z' },
          expiresAt: { type: 'string', format: 'date-time', example: '2025-05-25T09:23:45.678Z' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  async getUserSessionsByAdmin(@Param('userId') userId: string) {
    return this.sessionService.getUserActiveSessions(userId);
  }

  @Delete('user/:userId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Revoke all sessions for a specific user (admin only)',
    description: 'Terminates all sessions for a specified user. This endpoint is restricted to administrators.'
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user whose sessions to revoke',
    type: 'string',
    example: '5f8d7e6b-d3f4-4c2a-9f6a-8d7c9e6b5f4a'
  })
  @ApiResponse({ status: 204, description: 'All sessions for the user revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  async revokeAllSessionsByAdmin(@Param('userId') userId: string) {
    await this.sessionService.revokeAllUserSessions(
      userId,
      'Admin initiated revocation'
    );
  }
} 