import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto, TherapistVerificationRequestDto, TherapistVerifyDto } from './dto';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  async getMe(@Request() req) {
    return this.usersService.getMe(req.user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  async updateMe(@Body() dto: UpdateUserDto, @Request() req) {
    return this.usersService.updateMe(dto, req.user);
  }

  @Post('therapist/verify-request')
  @ApiOperation({ summary: 'Request therapist verification' })
  async requestTherapistVerification(@Body() dto: TherapistVerificationRequestDto, @Request() req) {
    return this.usersService.requestTherapistVerification(dto, req.user);
  }

  @Patch(':id/therapist/verify')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Admin/Moderator verifies therapist' })
  async verifyTherapist(@Param('id') id: string, @Body() dto: TherapistVerifyDto, @Request() req) {
    return this.usersService.verifyTherapist(id, dto, req.user);
  }
} 