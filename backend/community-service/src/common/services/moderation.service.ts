import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../users/entities/user.entity';
import { Post, PostStatus } from '../../posts/entities/post.entity';
import { Comment, CommentStatus } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { PrivacyService } from './privacy.service';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly privacyService: PrivacyService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
  ) {}

  /**
   * Reports a post
   */
  async reportPost(
    postId: string,
    reporterId: string,
    reason: string,
  ): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('Post not found');
    }

    // Update report count and add reporter to moderation notes
    post.reportCount += 1;
    if (!post.moderationNotes) {
      post.moderationNotes = {
        reportedBy: [],
        reviewNotes: [],
        actionTaken: null,
        actionTakenBy: null,
        actionTakenAt: null,
      };
    }
    post.moderationNotes.reportedBy.push(reporterId);

    // Check if post should be automatically flagged for review
    const maxReports = this.configService.get<number>(
      'moderation.maxReportsBeforeReview',
    );
    if (post.reportCount >= maxReports) {
      post.status = PostStatus.UNDER_REVIEW;
      this.logger.warn(
        `Post ${postId} has been flagged for review due to ${post.reportCount} reports`,
      );
    }

    await this.postRepository.save(post);

    // Notify moderators if needed
    await this.notifyModerators('post', postId, reason);
  }

  /**
   * Reports a comment
   */
  async reportComment(
    commentId: string,
    reporterId: string,
    reason: string,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Update report count and add reporter to moderation notes
    comment.reportCount += 1;
    if (!comment.moderationNotes) {
      comment.moderationNotes = {
        reportedBy: [],
        reviewNotes: [],
        actionTaken: null,
        actionTakenBy: null,
        actionTakenAt: null,
      };
    }
    comment.moderationNotes.reportedBy.push(reporterId);

    // Check if comment should be automatically flagged for review
    const maxReports = this.configService.get<number>(
      'moderation.maxReportsBeforeReview',
    );
    if (comment.reportCount >= maxReports) {
      comment.status = CommentStatus.UNDER_REVIEW;
      this.logger.warn(
        `Comment ${commentId} has been flagged for review due to ${comment.reportCount} reports`,
      );
    }

    await this.commentRepository.save(comment);

    // Notify moderators if needed
    await this.notifyModerators('comment', commentId, reason);
  }

  /**
   * Reviews and takes action on reported content
   */
  async reviewContent(
    contentId: string,
    contentType: 'post' | 'comment',
    moderatorId: string,
    action: 'approve' | 'remove' | 'warn',
    notes: string,
  ): Promise<void> {
    if (contentType === 'post') {
      const post = await this.postRepository.findOne({ where: { id: contentId } });
      if (!post) {
        throw new Error('Post not found');
      }

      // Update moderation notes
      if (!post.moderationNotes) {
        post.moderationNotes = {
          reportedBy: [],
          reviewNotes: [],
          actionTaken: null,
          actionTakenBy: null,
          actionTakenAt: null,
        };
      }

      post.moderationNotes.reviewNotes.push(notes);
      post.moderationNotes.actionTaken = action;
      post.moderationNotes.actionTakenBy = moderatorId;
      post.moderationNotes.actionTakenAt = new Date();

      // Take action based on moderator's decision
      switch (action) {
        case 'approve':
          post.status = PostStatus.PUBLISHED;
          post.reportCount = 0;
          break;
        case 'remove':
          post.status = PostStatus.REMOVED;
          break;
        case 'warn':
          post.status = PostStatus.PUBLISHED;
          break;
      }

      await this.postRepository.save(post);
      await this.notifyContentAuthor(post, action, notes);
    } else {
      const comment = await this.commentRepository.findOne({ where: { id: contentId } });
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Update moderation notes
      if (!comment.moderationNotes) {
        comment.moderationNotes = {
          reportedBy: [],
          reviewNotes: [],
          actionTaken: null,
          actionTakenBy: null,
          actionTakenAt: null,
        };
      }

      comment.moderationNotes.reviewNotes.push(notes);
      comment.moderationNotes.actionTaken = action;
      comment.moderationNotes.actionTakenBy = moderatorId;
      comment.moderationNotes.actionTakenAt = new Date();

      // Take action based on moderator's decision
      switch (action) {
        case 'approve':
          comment.status = CommentStatus.ACTIVE;
          comment.reportCount = 0;
          break;
        case 'remove':
          comment.status = CommentStatus.REMOVED;
          break;
        case 'warn':
          comment.status = CommentStatus.ACTIVE;
          break;
      }

      await this.commentRepository.save(comment);
      await this.notifyContentAuthor(comment, action, notes);
    }
  }

  /**
   * Checks if a user should be automatically moderated
   */
  async checkUserModeration(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Check report count
    if (user.reportCount >= this.configService.get<number>('moderation.maxReportsBeforeReview')) {
      user.status = UserStatus.SUSPENDED;
      this.logger.warn(`User ${userId} has been suspended due to high report count`);
      await this.userRepository.save(user);
    }
  }

  /**
   * Notifies moderators about reported content
   */
  private async notifyModerators(
    contentType: 'post' | 'comment',
    contentId: string,
    reason: string,
  ): Promise<void> {
    // TODO: Implement moderator notification
    // This could involve:
    // 1. Sending email notifications
    // 2. Creating moderation queue entries
    // 3. Sending in-app notifications
    // 4. Integrating with a moderation dashboard
    this.logger.log(
      `Moderators notified about reported ${contentType} ${contentId}: ${reason}`,
    );
  }

  /**
   * Notifies content author about moderation action
   */
  private async notifyContentAuthor(
    content: Post | Comment,
    action: 'approve' | 'remove' | 'warn',
    notes: string,
  ): Promise<void> {
    // TODO: Implement author notification
    // This could involve:
    // 1. Sending email notifications
    // 2. Creating in-app notifications
    // 3. Updating user's moderation history
    this.logger.log(
      `Author of ${content.id} notified about moderation action: ${action}`,
    );
  }

  /**
   * Checks content for sensitive material
   */
  async checkContentSensitivity(content: string): Promise<{
    isSensitive: boolean;
    confidence: number;
    categories: string[];
  }> {
    // TODO: Implement content sensitivity checking
    // This could involve:
    // 1. Using NLP to detect sensitive topics
    // 2. Using ML models to classify content
    // 3. Checking against predefined sensitive word lists
    // 4. Using external content moderation APIs
    return {
      isSensitive: false,
      confidence: 0,
      categories: [],
    };
  }
} 