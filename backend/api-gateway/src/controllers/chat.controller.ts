import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ChatService } from '../services/chat.service';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Chat Rooms Management
  @Post('rooms')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new chat room', description: 'Create a new chat room' })
  @ApiResponse({ status: 201, description: 'Chat room created successfully' })
  async createRoom(@Body() createRoomDto: any, @Req() req: any) {
    return this.chatService.createRoom(createRoomDto, req.user.userId);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get user chat rooms', description: 'Get all chat rooms for current user' })
  @ApiResponse({ status: 200, description: 'Chat rooms retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by room type' })
  async getUserRooms(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
  ) {
    return this.chatService.getUserRooms(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type,
    });
  }

  @Get('rooms/:roomId')
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiOperation({ summary: 'Get chat room details', description: 'Get specific chat room details' })
  @ApiResponse({ status: 200, description: 'Chat room details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async getRoom(@Param('roomId') roomId: string, @Req() req: any) {
    return this.chatService.getRoom(roomId, req.user.userId);
  }

  @Patch('rooms/:roomId')
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiOperation({ summary: 'Update chat room', description: 'Update chat room details' })
  @ApiResponse({ status: 200, description: 'Chat room updated successfully' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async updateRoom(@Param('roomId') roomId: string, @Body() updateRoomDto: any, @Req() req: any) {
    return this.chatService.updateRoom(roomId, updateRoomDto, req.user.userId);
  }

  @Delete('rooms/:roomId')
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete chat room', description: 'Delete chat room' })
  @ApiResponse({ status: 204, description: 'Chat room deleted successfully' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async deleteRoom(@Param('roomId') roomId: string, @Req() req: any) {
    return this.chatService.deleteRoom(roomId, req.user.userId);
  }

  // Room Participants Management
  @Post('rooms/:roomId/join')
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiOperation({ summary: 'Join chat room', description: 'Join a chat room' })
  @ApiResponse({ status: 200, description: 'Successfully joined chat room' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async joinRoom(@Param('roomId') roomId: string, @Req() req: any) {
    return this.chatService.joinRoom(roomId, req.user.userId);
  }

  @Post('rooms/:roomId/leave')
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiOperation({ summary: 'Leave chat room', description: 'Leave a chat room' })
  @ApiResponse({ status: 200, description: 'Successfully left chat room' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async leaveRoom(@Param('roomId') roomId: string, @Req() req: any) {
    return this.chatService.leaveRoom(roomId, req.user.userId);
  }

  @Get('rooms/:roomId/participants')
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiOperation({ summary: 'Get room participants', description: 'Get all participants in a chat room' })
  @ApiResponse({ status: 200, description: 'Room participants retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async getRoomParticipants(@Param('roomId') roomId: string, @Req() req: any) {
    return this.chatService.getRoomParticipants(roomId, req.user.userId);
  }

  // Messages Management
  @Post('rooms/:roomId/messages')
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message', description: 'Send a message to chat room' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async sendMessage(@Param('roomId') roomId: string, @Body() messageDto: any, @Req() req: any) {
    return this.chatService.sendMessage(roomId, messageDto, req.user.userId);
  }

  @Get('rooms/:roomId/messages')
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiOperation({ summary: 'Get room messages', description: 'Get messages from chat room' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'before', required: false, description: 'Get messages before this timestamp' })
  @ApiQuery({ name: 'after', required: false, description: 'Get messages after this timestamp' })
  async getRoomMessages(
    @Param('roomId') roomId: string,
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
    @Query('after') after?: string,
  ) {
    return this.chatService.getRoomMessages(roomId, req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      before,
      after,
    });
  }

  @Patch('messages/:messageId')
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiOperation({ summary: 'Update message', description: 'Update/edit a message' })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async updateMessage(@Param('messageId') messageId: string, @Body() updateMessageDto: any, @Req() req: any) {
    return this.chatService.updateMessage(messageId, updateMessageDto, req.user.userId);
  }

  @Delete('messages/:messageId')
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete message', description: 'Delete a message' })
  @ApiResponse({ status: 204, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(@Param('messageId') messageId: string, @Req() req: any) {
    return this.chatService.deleteMessage(messageId, req.user.userId);
  }

  // Direct Messages
  @Post('direct')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send direct message', description: 'Send a direct message to another user' })
  @ApiResponse({ status: 201, description: 'Direct message sent successfully' })
  async sendDirectMessage(@Body() directMessageDto: any, @Req() req: any) {
    return this.chatService.sendDirectMessage(directMessageDto, req.user.userId);
  }

  @Get('direct')
  @ApiOperation({ summary: 'Get direct message conversations', description: 'Get all direct message conversations' })
  @ApiResponse({ status: 200, description: 'Direct message conversations retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getDirectMessageConversations(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getDirectMessageConversations(req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('direct/:conversationId')
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiOperation({ summary: 'Get direct messages', description: 'Get messages from direct conversation' })
  @ApiResponse({ status: 200, description: 'Direct messages retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getDirectMessages(
    @Param('conversationId') conversationId: string,
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getDirectMessages(conversationId, req.user.userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  // Moderation (Admin only)
  @Post('rooms/:roomId/moderate')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'roomId', description: 'Chat room ID' })
  @ApiOperation({ summary: 'Moderate chat room', description: 'Admin only - Moderate chat room content' })
  @ApiResponse({ status: 200, description: 'Moderation action completed successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async moderateRoom(@Param('roomId') roomId: string, @Body() moderationDto: any) {
    return this.chatService.moderateRoom(roomId, moderationDto);
  }

  @Post('messages/:messageId/moderate')
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiOperation({ summary: 'Moderate message', description: 'Admin only - Moderate specific message' })
  @ApiResponse({ status: 200, description: 'Message moderation completed successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async moderateMessage(@Param('messageId') messageId: string, @Body() moderationDto: any) {
    return this.chatService.moderateMessage(messageId, moderationDto);
  }

  // User Status
  @Patch('status')
  @ApiOperation({ summary: 'Update chat status', description: 'Update user chat status (online/offline/away)' })
  @ApiResponse({ status: 200, description: 'Chat status updated successfully' })
  async updateChatStatus(@Body() statusDto: { status: string }, @Req() req: any) {
    return this.chatService.updateUserChatStatus(req.user.userId, statusDto.status);
  }
} 