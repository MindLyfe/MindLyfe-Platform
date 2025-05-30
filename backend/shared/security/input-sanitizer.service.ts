import { Injectable, Logger } from '@nestjs/common';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import validator from 'validator';

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripTags?: boolean;
  maxLength?: number;
  allowHtml?: boolean;
  allowUrls?: boolean;
  allowEmails?: boolean;
}

@Injectable()
export class InputSanitizerService {
  private readonly logger = new Logger(InputSanitizerService.name);
  private readonly window: any;
  private readonly purify: any;

  constructor() {
    // Create a virtual DOM for server-side DOMPurify
    this.window = new JSDOM('').window;
    this.purify = DOMPurify(this.window);
    
    // Configure DOMPurify with secure defaults
    this.purify.setConfig({
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span'],
      ALLOWED_ATTR: ['class'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
      SANITIZE_DOM: true,
      WHOLE_DOCUMENT: false,
      FORCE_BODY: false,
    });
  }

  /**
   * Sanitize HTML content with DOMPurify
   */
  sanitizeHtml(input: string, options: SanitizationOptions = {}): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      const config = {
        ALLOWED_TAGS: options.allowedTags || ['p', 'br', 'strong', 'em', 'u', 'i', 'b'],
        ALLOWED_ATTR: options.allowedAttributes || [],
        KEEP_CONTENT: true,
        SANITIZE_DOM: true,
      };

      let sanitized = this.purify.sanitize(input.trim(), config);
      
      // Apply length limit if specified
      if (options.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength);
      }

      return sanitized;
    } catch (error) {
      this.logger.error('HTML sanitization failed:', error);
      return '';
    }
  }

  /**
   * Sanitize plain text content
   */
  sanitizeText(input: string, options: SanitizationOptions = {}): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      let sanitized = input.trim();

      // Remove HTML tags if not allowed
      if (!options.allowHtml) {
        sanitized = validator.stripLow(sanitized, true);
        sanitized = this.stripHtmlTags(sanitized);
      }

      // Escape special characters
      sanitized = validator.escape(sanitized);

      // Apply length limit
      if (options.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength);
      }

      return sanitized;
    } catch (error) {
      this.logger.error('Text sanitization failed:', error);
      return '';
    }
  }

  /**
   * Sanitize email address
   */
  sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    const trimmed = email.trim().toLowerCase();
    
    if (!validator.isEmail(trimmed)) {
      return '';
    }

    return validator.normalizeEmail(trimmed) || '';
  }

  /**
   * Sanitize URL
   */
  sanitizeUrl(url: string, options: { allowedProtocols?: string[] } = {}): string {
    if (!url || typeof url !== 'string') {
      return '';
    }

    const trimmed = url.trim();
    const allowedProtocols = options.allowedProtocols || ['http', 'https'];

    if (!validator.isURL(trimmed, { protocols: allowedProtocols })) {
      return '';
    }

    return trimmed;
  }

  /**
   * Sanitize phone number
   */
  sanitizePhoneNumber(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Remove all non-digit characters except + at the beginning
    let sanitized = phone.trim().replace(/[^\d+]/g, '');
    
    // Ensure + is only at the beginning
    if (sanitized.includes('+')) {
      const parts = sanitized.split('+');
      sanitized = '+' + parts.join('');
    }

    // Validate phone number format
    if (!validator.isMobilePhone(sanitized, 'any', { strictMode: false })) {
      return '';
    }

    return sanitized;
  }

  /**
   * Sanitize JSON object recursively
   */
  sanitizeObject(obj: any, options: SanitizationOptions = {}): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return options.allowHtml ? 
        this.sanitizeHtml(obj, options) : 
        this.sanitizeText(obj, options);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, options));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize the key
        const sanitizedKey = this.sanitizeText(key, { maxLength: 100 });
        if (sanitizedKey) {
          sanitized[sanitizedKey] = this.sanitizeObject(value, options);
        }
      }
      
      return sanitized;
    }

    return obj;
  }

  /**
   * Validate and sanitize file name
   */
  sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      return '';
    }

    // Remove path traversal attempts
    let sanitized = fileName.replace(/[\/\\:*?"<>|]/g, '');
    
    // Remove leading/trailing dots and spaces
    sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');
    
    // Limit length
    if (sanitized.length > 255) {
      const ext = sanitized.substring(sanitized.lastIndexOf('.'));
      const name = sanitized.substring(0, 255 - ext.length);
      sanitized = name + ext;
    }

    return sanitized;
  }

  /**
   * Sanitize SQL-like input to prevent injection
   */
  sanitizeSqlInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/|;|'|"|`)/g,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
    ];

    let sanitized = input.trim();
    
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }

  /**
   * Sanitize NoSQL injection attempts
   */
  sanitizeNoSqlInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeText(input);
    }

    if (typeof input === 'object' && input !== null) {
      // Remove MongoDB operators
      const mongoOperators = ['$where', '$ne', '$in', '$nin', '$gt', '$gte', '$lt', '$lte', '$regex', '$exists'];
      
      if (Array.isArray(input)) {
        return input.map(item => this.sanitizeNoSqlInput(item));
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (!mongoOperators.includes(key) && !key.startsWith('$')) {
          sanitized[key] = this.sanitizeNoSqlInput(value);
        }
      }
      
      return sanitized;
    }

    return input;
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtmlTags(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  /**
   * Validate input against XSS patterns
   */
  detectXSS(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Comprehensive input validation and sanitization
   */
  validateAndSanitize(input: any, type: 'text' | 'html' | 'email' | 'url' | 'phone' | 'object' = 'text', options: SanitizationOptions = {}): any {
    try {
      switch (type) {
        case 'html':
          return this.sanitizeHtml(input, options);
        case 'email':
          return this.sanitizeEmail(input);
        case 'url':
          return this.sanitizeUrl(input);
        case 'phone':
          return this.sanitizePhoneNumber(input);
        case 'object':
          return this.sanitizeObject(input, options);
        case 'text':
        default:
          return this.sanitizeText(input, options);
      }
    } catch (error) {
      this.logger.error(`Validation failed for type ${type}:`, error);
      return type === 'object' ? {} : '';
    }
  }

  /**
   * Batch sanitization for arrays
   */
  sanitizeBatch(inputs: any[], type: 'text' | 'html' | 'email' | 'url' | 'phone' | 'object' = 'text', options: SanitizationOptions = {}): any[] {
    return inputs.map(input => this.validateAndSanitize(input, type, options));
  }
} 