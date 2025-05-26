import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('test')
@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  @ApiOperation({ summary: 'Check service health' })
  check() {
    return {
      status: 'ok',
      service: 'auth-service',
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint' })
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
    };
  }

  @Post('test-login')
  @ApiOperation({ summary: 'Test login endpoint' })
  testLogin(@Body() credentials: { email: string; password: string }) {
    const { email, password } = credentials;
    
    // Demo credentials for testing
    if (email === 'user@mindlyf.com' && password === 'User@123') {
      return {
        success: true,
        user: {
          id: '1',
          email: 'user@mindlyf.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
        },
        token: 'demo-jwt-token',
      };
    }
    
    if (email === 'admin@mindlyf.com' && password === 'Admin@123') {
      return {
        success: true,
        user: {
          id: '2',
          email: 'admin@mindlyf.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
        },
        token: 'demo-admin-jwt-token',
      };
    }
    
    return {
      success: false,
      message: 'Invalid credentials',
    };
  }
} 