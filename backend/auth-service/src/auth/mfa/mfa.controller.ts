import { Controller, Post, UseGuards, Req, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiProduces } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MfaService } from './mfa.service';
import { VerifyMfaDto, DisableMfaDto } from './dto/mfa.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('mfa')
@Controller('mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ 
    summary: 'Generate MFA secret for user',
    description: 'Creates a new TOTP (Time-based One-Time Password) secret for the authenticated user. Returns the secret and a QR code for setting up authenticator apps.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA secret generated successfully',
    schema: {
      type: 'object',
      properties: {
        otpAuthUrl: { type: 'string', example: 'otpauth://totp/MindLyf:user@mindlyf.com?secret=HXDMVJECJJWSRB3HWIZR4MKVGIYUC43PNZXW' },
        secret: { type: 'string', example: 'HXDMVJECJJWSRB3HWIZR4MKVGIYUC43PNZXW' },
        qrCodeDataUrl: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQA...' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiProduces('application/json')
  async generateMfaSecret(@Req() req) {
    return this.mfaService.generateTotpSecret(req.user.email);
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify token and enable MFA',
    description: 'Validates the provided TOTP token and enables multi-factor authentication for the user. The user must have previously generated a secret.'
  })
  @ApiBody({ 
    type: VerifyMfaDto,
    description: 'The TOTP token to verify before enabling MFA'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA enabled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Two-factor authentication has been enabled successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid token' })
  @ApiResponse({ status: 400, description: 'MFA secret not generated or invalid verification code' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async enableMfa(
    @Req() req, 
    @Body() verifyMfaDto: VerifyMfaDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.mfaService.verifyAndEnableMfa(req.user.sub, verifyMfaDto.token, { ipAddress, userAgent });
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Disable MFA (requires password)',
    description: 'Disables multi-factor authentication for the user. Requires password verification for security.'
  })
  @ApiBody({ 
    type: DisableMfaDto,
    description: 'The user\'s password for verification before disabling MFA'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA disabled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Two-factor authentication has been disabled successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid password' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async disableMfa(
    @Req() req, 
    @Body() disableMfaDto: DisableMfaDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ipAddress: string
  ) {
    return this.mfaService.disableMfa(req.user.sub, disableMfaDto.password, { ipAddress, userAgent });
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify MFA token',
    description: 'Validates a TOTP token against a provided secret. This is used during login for MFA verification.'
  })
  @ApiBody({ 
    description: 'The TOTP token and secret to verify',
    schema: {
      type: 'object',
      required: ['secret', 'token'],
      properties: {
        secret: { type: 'string', example: 'HXDMVJECJJWSRB3HWIZR4MKVGIYUC43PNZXW' },
        token: { type: 'string', example: '123456' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token verified successfully',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid token or secret' })
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  async verifyMfaToken(@Body() body: { secret: string; token: string }) {
    const isValid = await this.mfaService.verifyTotpToken(body.secret, body.token);
    return { isValid };
  }
} 