import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req, 
  Res, 
  UseGuards,
  Logger,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Request, Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ProxyService } from '../services/proxy.service';

@ApiTags('Community')
@ApiBearerAuth()
@Controller('community')
export class CommunityController {
  private readonly logger = new Logger(CommunityController.name);

  constructor(private readonly proxyService: ProxyService) {}

  // ==================== USER PROFILE ENDPOINTS ====================

  @Get('users/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get current user anonymous profile',
    description: 'Get the current user\'s anonymous community profile with pseudonym and avatar'
  })
  @ApiResponse({ status: 200, description: 'User anonymous profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserProfile(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/users/profile', req, res);
  }

  @Patch('users/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update user profile settings',
    description: 'Update privacy settings, bio, and other profile preferences'
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUserProfile(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/users/profile', req, res);
  }

  @Post('users/therapist/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Request therapist verification',
    description: 'Submit documentation for therapist verification'
  })
  @ApiResponse({ status: 201, description: 'Verification request submitted' })
  @ApiResponse({ status: 400, description: 'Invalid verification data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async requestTherapistVerification(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/users/therapist/verify', req, res);
  }

  // ==================== POSTS ENDPOINTS ====================

  @Get('posts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get community posts',
    description: 'Get paginated list of community posts with anonymous authors'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order (latest, popular, trending)' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPosts(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/posts', req, res);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Create new post',
    description: 'Create a new anonymous community post'
  })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid post data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPost(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/posts', req, res);
  }

  @Get('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get specific post',
    description: 'Get a specific post with comments and reactions'
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPost(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/posts/${id}`, req, res);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update post',
    description: 'Update own post (author only)'
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 403, description: 'Not the post author' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePost(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/posts/${id}`, req, res);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Delete post',
    description: 'Delete own post (author only) or moderate post (admin/moderator)'
  })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deletePost(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/posts/${id}`, req, res);
  }

  // ==================== COMMENTS ENDPOINTS ====================

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Create comment',
    description: 'Create a new anonymous comment on a post or reply to another comment'
  })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid comment data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createComment(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/comments', req, res);
  }

  @Get('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get comment',
    description: 'Get a specific comment with replies'
  })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getComment(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/comments/${id}`, req, res);
  }

  @Patch('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update comment',
    description: 'Update own comment (author only)'
  })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 403, description: 'Not the comment author' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateComment(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/comments/${id}`, req, res);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Delete comment',
    description: 'Delete own comment (author only) or moderate comment (admin/moderator)'
  })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this comment' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteComment(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/comments/${id}`, req, res);
  }

  // ==================== REACTIONS ENDPOINTS ====================

  @Post('reactions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'React to content',
    description: 'Add an anonymous reaction to a post or comment'
  })
  @ApiResponse({ status: 201, description: 'Reaction added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid reaction data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createReaction(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/reactions', req, res);
  }

  @Delete('reactions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Remove reaction',
    description: 'Remove own reaction from content'
  })
  @ApiParam({ name: 'id', description: 'Reaction ID' })
  @ApiResponse({ status: 200, description: 'Reaction removed successfully' })
  @ApiResponse({ status: 403, description: 'Not your reaction' })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteReaction(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/reactions/${id}`, req, res);
  }

  // ==================== FOLLOW SYSTEM ENDPOINTS ====================

  @Get('follows')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get follow relationships',
    description: 'Get user\'s follow relationships (followers, following, mutual)'
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type (followers, following, mutual)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Follow relationships retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFollows(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/follows', req, res);
  }

  @Post('follows')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Follow a user',
    description: 'Follow another user using their anonymous ID'
  })
  @ApiResponse({ status: 201, description: 'User followed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID or already following' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async followUser(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/follows', req, res);
  }

  @Delete('follows/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Unfollow user',
    description: 'Stop following a user'
  })
  @ApiParam({ name: 'id', description: 'Follow relationship ID' })
  @ApiResponse({ status: 200, description: 'User unfollowed successfully' })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unfollowUser(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/follows/${id}`, req, res);
  }

  @Patch('follows/:id/settings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update follow settings',
    description: 'Update privacy settings for a follow relationship'
  })
  @ApiParam({ name: 'id', description: 'Follow relationship ID' })
  @ApiResponse({ status: 200, description: 'Follow settings updated successfully' })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateFollowSettings(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/follows/${id}/settings`, req, res);
  }

  @Get('follows/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get follow statistics',
    description: 'Get user\'s follow statistics (followers count, following count, mutual follows)'
  })
  @ApiResponse({ status: 200, description: 'Follow statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFollowStats(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/follows/stats', req, res);
  }

  @Get('follows/suggestions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get follow suggestions',
    description: 'Get suggested users to follow based on interests and activity'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of suggestions' })
  @ApiResponse({ status: 200, description: 'Follow suggestions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFollowSuggestions(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/follows/suggestions', req, res);
  }

  // ==================== CHAT INTEGRATION ENDPOINTS ====================

  @Post('follows/check-chat-eligibility')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Check chat eligibility',
    description: 'Check if current user can chat with another user (mutual follow required)'
  })
  @ApiResponse({ status: 200, description: 'Chat eligibility checked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkChatEligibility(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/follows/check-chat-eligibility', req, res);
  }

  @Get('follows/chat-partners')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get chat-eligible users',
    description: 'Get all users who have mutual follow relationship and can be chatted with'
  })
  @ApiResponse({ status: 200, description: 'Chat partners retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getChatPartners(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/follows/chat-partners', req, res);
  }

  // ==================== MODERATION ENDPOINTS ====================

  @Post('moderation/report')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Report content',
    description: 'Report inappropriate content for moderation review'
  })
  @ApiResponse({ status: 201, description: 'Content reported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid report data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reportContent(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/moderation/report', req, res);
  }

  @Post('moderation/review')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Review reported content',
    description: 'Review and moderate reported content (admin/moderator only)'
  })
  @ApiResponse({ status: 200, description: 'Content reviewed successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to review content' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reviewContent(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/moderation/review', req, res);
  }

  @Get('moderation/reports')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get moderation reports',
    description: 'Get list of content reports for review (admin/moderator only)'
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (pending, reviewed, resolved)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Moderation reports retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to view reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getModerationReports(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/moderation/reports', req, res);
  }

  // ==================== HEALTH & MONITORING ENDPOINTS ====================

  @Get('health')
  @Public()
  @ApiOperation({ 
    summary: 'Service health check',
    description: 'Check if the community service is healthy'
  })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async getHealth(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/health', req, res);
  }

  @Get('health/detailed')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Detailed health status',
    description: 'Get detailed health status including dependencies (admin only)'
  })
  @ApiResponse({ status: 200, description: 'Detailed health status retrieved' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDetailedHealth(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/health/detailed', req, res);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get community statistics',
    description: 'Get community-wide statistics (admin only)'
  })
  @ApiResponse({ status: 200, description: 'Community statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCommunityStats(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('/community/admin/stats', req, res);
  }

  @Post('admin/therapist/:id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Verify therapist',
    description: 'Approve or reject therapist verification (admin only)'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Therapist verification updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyTherapist(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyToService(`/community/admin/therapist/${id}/verify`, req, res);
  }

  // ==================== PRIVATE HELPER METHOD ====================

  private async proxyToService(path: string, req: Request, res: Response) {
    try {
      const method = req.method;
      const body = req.body;
      const headers = { ...req.headers };
      const params = req.query;

      // Remove gateway-specific headers
      delete headers.host;
      delete headers.connection;
      delete headers['content-length'];

      this.logger.log(`Proxying ${method} ${path} to community service`);

      const response = await this.proxyService.forwardRequest(
        'community',
        path,
        method,
        body,
        headers as Record<string, string>,
        params as Record<string, any>
      );

      // Set response headers
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'transfer-encoding' && 
            key.toLowerCase() !== 'connection' &&
            key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, response.headers[key]);
        }
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error('Error proxying to community service:', error.message);
      throw new HttpException(
        {
          error: 'Service Unavailable',
          message: 'Community service temporarily unavailable',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
} 