import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface AnonymousIdentity {
  displayName: string;
  avatarColor: string;
  id: string; // Consistent ID for the same user within community context
}

@Injectable()
export class AnonymityService {
  private readonly logger = new Logger(AnonymityService.name);
  
  // Predefined pool of anonymous names
  private readonly anonymousFirstNames = [
    'Mindful', 'Peaceful', 'Calm', 'Serene', 'Gentle', 'Kind', 'Brave', 'Strong',
    'Wise', 'Caring', 'Hopeful', 'Bright', 'Warm', 'Quiet', 'Grace', 'Light',
    'Dawn', 'Bloom', 'River', 'Ocean', 'Forest', 'Sky', 'Moon', 'Star',
    'Phoenix', 'Harmony', 'Journey', 'Spirit', 'Dream', 'Wonder', 'Faith', 'Trust',
    'Balance', 'Clarity', 'Focus', 'Energy', 'Vibrant', 'Radiant', 'Golden', 'Silver',
    'Azure', 'Emerald', 'Crimson', 'Violet', 'Amber', 'Pearl', 'Ruby', 'Sapphire'
  ];

  private readonly anonymousLastNames = [
    'Walker', 'Seeker', 'Dreamer', 'Warrior', 'Guardian', 'Helper', 'Listener', 'Healer',
    'Builder', 'Creator', 'Explorer', 'Traveler', 'Wanderer', 'Keeper', 'Finder', 'Giver',
    'Sharer', 'Learner', 'Teacher', 'Student', 'Friend', 'Companion', 'Guide', 'Mentor',
    'Soul', 'Heart', 'Mind', 'Spirit', 'Being', 'Voice', 'Path', 'Bridge',
    'Mountain', 'Valley', 'River', 'Ocean', 'Forest', 'Garden', 'Meadow', 'Field',
    'Sunrise', 'Sunset', 'Rainbow', 'Storm', 'Breeze', 'Wind', 'Rain', 'Snow'
  ];

  private readonly avatarColors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'
  ];

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates a consistent anonymous identity for a user within community context
   * The same user will always get the same anonymous identity in the community
   */
  generateAnonymousIdentity(userId: string, contentType: 'post' | 'comment' | 'reaction' = 'post'): AnonymousIdentity {
    // Create a deterministic hash based on user ID for consistency
    // But make it different from the real user ID for privacy
    const seed = crypto
      .createHash('sha256')
      .update(`community_anonymous_${userId}_${this.configService.get('jwt.secret', 'default-secret')}`)
      .digest('hex');

    // Use the hash to generate consistent but random-looking selections
    const firstNameIndex = parseInt(seed.substring(0, 8), 16) % this.anonymousFirstNames.length;
    const lastNameIndex = parseInt(seed.substring(8, 16), 16) % this.anonymousLastNames.length;
    const colorIndex = parseInt(seed.substring(16, 24), 16) % this.avatarColors.length;

    const displayName = `${this.anonymousFirstNames[firstNameIndex]} ${this.anonymousLastNames[lastNameIndex]}`;
    const avatarColor = this.avatarColors[colorIndex];
    
    // Generate a consistent community-anonymous ID (different from real user ID)
    const anonymousId = crypto
      .createHash('sha256')
      .update(`community_id_${userId}_${seed}`)
      .digest('hex')
      .substring(0, 16);

    return {
      displayName,
      avatarColor,
      id: anonymousId
    };
  }

  /**
   * Generates a time-based pseudonym for posts/comments that changes periodically
   * This provides additional privacy by not having the same name forever
   */
  generateTimeBoundPseudonym(userId: string, timeWindow: 'daily' | 'weekly' | 'monthly' = 'weekly'): string {
    const now = new Date();
    let timeSeed: string;

    switch (timeWindow) {
      case 'daily':
        timeSeed = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        break;
      case 'weekly':
        const weekOfYear = this.getWeekOfYear(now);
        timeSeed = `${now.getFullYear()}-W${weekOfYear}`;
        break;
      case 'monthly':
        timeSeed = `${now.getFullYear()}-${now.getMonth()}`;
        break;
    }

    const hash = crypto
      .createHash('sha256')
      .update(`${userId}_${timeSeed}_${this.configService.get('jwt.secret', 'default-secret')}`)
      .digest('hex');

    const firstNameIndex = parseInt(hash.substring(0, 8), 16) % this.anonymousFirstNames.length;
    const lastNameIndex = parseInt(hash.substring(8, 16), 16) % this.anonymousLastNames.length;

    return `${this.anonymousFirstNames[firstNameIndex]} ${this.anonymousLastNames[lastNameIndex]}`;
  }

  /**
   * Anonymizes content response for community display
   * Removes all real user information and replaces with anonymous identity
   */
  anonymizeContentResponse(content: any, userAnonymousIdentity: AnonymousIdentity): any {
    if (!content) return null;

    const anonymized = { ...content };

    // Remove real user identification
    delete anonymized.authorId;
    
    // Replace author information with anonymous identity
    if (anonymized.author) {
      anonymized.author = {
        id: userAnonymousIdentity.id,
        displayName: userAnonymousIdentity.displayName,
        avatarColor: userAnonymousIdentity.avatarColor,
        role: anonymized.author.role || 'user', // Keep role for therapist verification
        isVerifiedTherapist: anonymized.author.isVerifiedTherapist || false
      };
    }

    // Use anonymous display name as pseudonym if not set
    if (!anonymized.pseudonym) {
      anonymized.pseudonym = userAnonymousIdentity.displayName;
    }

    // Remove any metadata that could identify the user
    if (anonymized.metadata) {
      delete anonymized.metadata.lastLoginIp;
      delete anonymized.metadata.lastLoginDevice;
      delete anonymized.metadata.lastLoginLocation;
      delete anonymized.metadata.accountCreatedFrom;
    }

    return anonymized;
  }

  /**
   * Anonymizes user profile for community display
   * Ensures no real personal information is exposed
   */
  anonymizeUserProfile(user: any): any {
    if (!user) return null;

    const anonymousIdentity = this.generateAnonymousIdentity(user.id || user.authId);

    return {
      id: anonymousIdentity.id,
      displayName: anonymousIdentity.displayName,
      avatarColor: anonymousIdentity.avatarColor,
      role: user.role,
      isVerifiedTherapist: user.isVerifiedTherapist || false,
      // Only show generalized bio without personal details
      bio: user.bio ? this.sanitizeBio(user.bio) : null,
      // Show specialties for therapists but remove personal certifications
      specialties: user.isVerifiedTherapist ? user.specialties : [],
      postCount: user.postCount || 0,
      commentCount: user.commentCount || 0,
      lastActiveAt: user.lastActiveAt,
      // No personal metadata exposed
      metadata: null
    };
  }

  /**
   * Sanitizes bio content to remove personally identifiable information
   */
  private sanitizeBio(bio: string): string {
    if (!bio) return '';
    
    // Remove common PII patterns (this is a basic implementation)
    // In production, this should be more sophisticated
    return bio
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]') // emails
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone]') // phone numbers
      .replace(/\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|way|blvd|boulevard)\b/gi, '[address]') // addresses
      .trim();
  }

  /**
   * Checks if a user should have their real identity revealed
   * Only in chat service or when explicitly opted in
   */
  shouldRevealIdentity(context: 'community' | 'chat' | 'therapy'): boolean {
    switch (context) {
      case 'community':
        return false; // Never reveal in community
      case 'chat':
      case 'therapy':
        return true; // Allow real identity in private contexts
      default:
        return false;
    }
  }

  /**
   * Gets the week number of the year for time-bound pseudonyms
   */
  private getWeekOfYear(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Ensures content is marked as anonymous and has proper pseudonym
   */
  enforceAnonymity(content: any, userId: string): any {
    const anonymousIdentity = this.generateAnonymousIdentity(userId);
    
    return {
      ...content,
      isAnonymous: true,
      pseudonym: content.pseudonym || anonymousIdentity.displayName,
      // Remove any direct user references
      authorId: userId, // Keep for backend reference but never expose
    };
  }

  /**
   * Generates a session-specific anonymous ID for reactions/interactions
   * This allows tracking user interactions without exposing identity
   */
  generateSessionAnonymousId(userId: string, sessionContext: string = 'community'): string {
    return crypto
      .createHash('sha256')
      .update(`${sessionContext}_${userId}_${Date.now()}`)
      .digest('hex')
      .substring(0, 16);
  }
} 