import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService, EmailOptions } from './email.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @Roles('admin')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not an admin' })
  async sendEmail(@Body() emailOptions: EmailOptions): Promise<{ success: boolean; message: string }> {
    await this.emailService.sendEmail(emailOptions);
    return {
      success: true,
      message: 'Email sent successfully',
    };
  }

  @Post('send-template')
  @Roles('admin')
  @ApiOperation({ summary: 'Send a templated email' })
  @ApiResponse({ status: 201, description: 'Templated email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not an admin' })
  async sendTemplatedEmail(
    @Body()
    options: {
      to: string | string[];
      templateName: string;
      templateData: Record<string, any>;
      subject?: string;
      from?: string;
      cc?: string | string[];
      bcc?: string | string[];
    },
  ): Promise<{ success: boolean; message: string }> {
    await this.emailService.sendTemplatedEmail(options);
    return {
      success: true,
      message: 'Templated email sent successfully',
    };
  }

  @Post('send-bulk')
  @Roles('admin')
  @ApiOperation({ summary: 'Send bulk templated emails' })
  @ApiResponse({ status: 201, description: 'Bulk templated emails sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not an admin' })
  async sendBulkTemplatedEmail(
    @Body()
    options: {
      destinations: Array<{
        to: string;
        templateData: Record<string, any>;
      }>;
      templateName: string;
      subject?: string;
      from?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    await this.emailService.sendBulkTemplatedEmail(options);
    return {
      success: true,
      message: 'Bulk templated emails sent successfully',
    };
  }
} 