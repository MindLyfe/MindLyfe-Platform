import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PrivacyService {
  private readonly logger = new Logger(PrivacyService.name);
  private readonly algorithm: string;
  private readonly key: Buffer;
  private readonly ivLength: number;
  private readonly saltLength: number;

  constructor(private readonly configService: ConfigService) {
    this.algorithm = this.configService.get<string>('encryption.algorithm');
    this.key = Buffer.from(
      this.configService.get<string>('encryption.key'),
      'hex',
    );
    this.ivLength = this.configService.get<number>('encryption.ivLength');
    this.saltLength = this.configService.get<number>('encryption.saltLength');
  }

  /**
   * Encrypts sensitive data
   */
  encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const salt = crypto.randomBytes(this.saltLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as crypto.CipherGCM;
      
      const encrypted = Buffer.concat([
        cipher.update(data, 'utf8'),
        cipher.final(),
      ]);

      const authTag = cipher.getAuthTag();

      // Combine IV, salt, auth tag, and encrypted data
      const result = Buffer.concat([iv, salt, authTag, encrypted]);
      return result.toString('base64');
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`, error.stack);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypts encrypted data
   */
  decrypt(encryptedData: string): string {
    try {
      const buffer = Buffer.from(encryptedData, 'base64');
      
      // Extract IV, salt, auth tag, and encrypted data
      const iv = buffer.subarray(0, this.ivLength);
      const salt = buffer.subarray(this.ivLength, this.ivLength + this.saltLength);
      const authTag = buffer.subarray(
        this.ivLength + this.saltLength,
        this.ivLength + this.saltLength + 16,
      );
      const encrypted = buffer.subarray(this.ivLength + this.saltLength + 16);

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv) as crypto.DecipherGCM;
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`, error.stack);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Generates a pseudonym for anonymous content
   */
  generatePseudonym(userId: string, type: 'post' | 'comment' | 'reaction'): string {
    const prefix = type.charAt(0).toUpperCase();
    const hash = crypto
      .createHash('sha256')
      .update(userId + type + Date.now().toString())
      .digest('hex')
      .substring(0, 6);
    
    return `${prefix}${hash}`;
  }

  /**
   * Anonymizes user data for public display
   */
  anonymizeUserData(user: any): any {
    if (!user) return null;

    const anonymized = { ...user };
    
    // Remove sensitive fields
    delete anonymized.email;
    delete anonymized.phone;
    delete anonymized.address;
    delete anonymized.metadata?.lastLoginIp;
    delete anonymized.metadata?.lastLoginLocation;
    
    // Anonymize display name if user is anonymous
    if (user.privacySettings?.isAnonymousByDefault) {
      anonymized.displayName = this.generatePseudonym(user.id, 'post');
    }

    return anonymized;
  }

  /**
   * Anonymizes content data for public display
   */
  anonymizeContent(content: any, type: 'post' | 'comment' | 'reaction'): any {
    if (!content) return null;

    const anonymized = { ...content };
    
    if (content.isAnonymous) {
      // Remove author information
      delete anonymized.author;
      delete anonymized.authorId;
      
      // Use pseudonym if available, otherwise generate one
      if (!anonymized.pseudonym) {
        anonymized.pseudonym = this.generatePseudonym(content.id, type);
      }
    }

    return anonymized;
  }

  /**
   * Checks if content should be automatically moderated
   */
  async shouldAutoModerate(content: string): Promise<boolean> {
    // TODO: Implement content moderation logic
    // This could involve:
    // 1. Checking against a list of banned words/phrases
    // 2. Using NLP to detect harmful content
    // 3. Using ML models to classify content
    // 4. Checking for spam patterns
    return false;
  }

  /**
   * Sanitizes content before storage
   */
  sanitizeContent(content: string): string {
    // TODO: Implement content sanitization
    // This could involve:
    // 1. Removing HTML tags
    // 2. Escaping special characters
    // 3. Trimming whitespace
    // 4. Normalizing line endings
    return content.trim();
  }
} 