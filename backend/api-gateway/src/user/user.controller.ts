import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  findAll(@Req() req: any, @Query() query: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.userService.findAll(token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return a user by ID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.userService.findById(id, token);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.userService.update(id, updateDto, token);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.userService.delete(id, token);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  updatePassword(
    @Param('id') id: string,
    @Body() passwordDto: any,
    @Req() req: any,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.userService.updatePassword(id, passwordDto, token);
  }
}
