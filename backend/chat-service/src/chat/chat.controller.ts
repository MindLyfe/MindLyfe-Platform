import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { ModerateMessageDto, ModerateRoomDto, ReportMessageDto } from './dto/moderation.dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../auth';
import { JwtUser } from '../auth/interfaces/user.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiResponse({ status: 201, description: 'The chat room has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only therapists and admins can create group chats.' })
  @Roles('user', 'therapist', 'admin')
  async createRoom(@Body() createRoomDto: CreateRoomDto, @CurrentUser() user: JwtUser) {
    return this.chatService.createRoom(createRoomDto, user);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get all chat rooms for the current user' })
  @ApiResponse({ status: 200, description: 'Returns the list of chat rooms.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Roles('user', 'therapist', 'admin')
  async getRooms(@CurrentUser() user: JwtUser) {
    return this.chatService.getRooms(user);
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Get a specific chat room by ID' })
  @ApiParam({ name: 'id', description: 'The chat room ID' })
  @ApiResponse({ status: 200, description: 'Returns the chat room.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Chat room not found.' })
  @Roles('user', 'therapist', 'admin')
  async getRoomById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.chatService.getRoomById(id, user);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Create a new chat message' })
  @ApiResponse({ status: 201, description: 'The chat message has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Chat room not found.' })
  @Roles('user', 'therapist', 'admin')
  async createMessage(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: JwtUser) {
    return this.chatService.createMessage(createMessageDto, user);
  }

  @Get('rooms/:id/messages')
  @ApiOperation({ summary: 'Get messages for a specific chat room' })
  @ApiParam({ name: 'id', description: 'The chat room ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of messages to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of messages to skip' })
  @ApiResponse({ status: 200, description: 'Returns the list of messages.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Chat room not found.' })
  @Roles('user', 'therapist', 'admin')
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.chatService.getMessages(id, user, limit, offset);
  }

  @Post('rooms/:id/read')
  @ApiOperation({ summary: 'Mark all messages in a room as read' })
  @ApiParam({ name: 'id', description: 'The chat room ID' })
  @ApiResponse({ status: 200, description: 'Messages marked as read.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Chat room not found.' })
  @Roles('user', 'therapist', 'admin')
  async markMessagesAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    await this.chatService.markMessagesAsRead(id, user);
    return { success: true };
  }

  @Get('chat-partners')
  @ApiOperation({ 
    summary: 'Get chat-eligible users',
    description: 'Get all users who have mutual follow relationship and can be chatted with'
  })
  @ApiResponse({ status: 200, description: 'Returns list of chat-eligible users.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Roles('user', 'therapist', 'admin')
  async getChatEligibleUsers(@CurrentUser() user: JwtUser) {
    return this.chatService.getChatEligibleUsers(user);
  }

  @Patch('rooms/:id/identity-settings')
  @ApiOperation({ 
    summary: 'Update room identity reveal settings',
    description: 'Update whether real names should be shown or anonymous names in this room'
  })
  @ApiParam({ name: 'id', description: 'The chat room ID' })
  @ApiResponse({ status: 200, description: 'Identity settings updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Chat room not found.' })
  @Roles('user', 'therapist', 'admin')
  async updateRoomIdentitySettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() settings: { allowRealNames?: boolean; showAnonymousNames?: boolean },
    @CurrentUser() user: JwtUser
  ) {
    await this.chatService.updateRoomIdentitySettings(id, settings, user);
    return { success: true };
  }

  @Post('moderation/message')
  @ApiOperation({ summary: 'Moderate a message' })
  @ApiResponse({ status: 200, description: 'Message moderated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only admins and moderators can moderate messages.' })
  @Roles('admin', 'moderator', 'therapist')
  async moderateMessage(@Body() moderateDto: ModerateMessageDto, @CurrentUser() user: JwtUser) {
    return this.chatService.moderateMessage(moderateDto.messageId, moderateDto.action, user);
  }

  @Post('moderation/report')
  @ApiOperation({ summary: 'Report a message' })
  @ApiResponse({ status: 200, description: 'Message reported successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Roles('user', 'therapist', 'admin')
  async reportMessage(@Body() reportDto: ReportMessageDto, @CurrentUser() user: JwtUser) {
    // Implementation would typically involve storing the report and possibly notifying moderators
    return { success: true, message: 'Message reported successfully' };
  }
}