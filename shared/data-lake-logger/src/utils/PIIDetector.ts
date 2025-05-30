import { createHash } from 'crypto';
import { LogEntry, PIIField } from '../types';

export type AnonymizationMethod = 'hash' | 'mask' | 'remove' | 'tokenize';

export interface PIIDetectionConfig {
  enableEmailDetection: boolean;
  enablePhoneDetection: boolean;
  enableSSNDetection: boolean;
  enableCreditCardDetection: boolean;
  enableNameDetection: boolean;
  enableAddressDetection: boolean;
  defaultAnonymizationMethod: AnonymizationMethod;
  customPatterns: Array<{
    name: string;
    pattern: RegExp;
    method: AnonymizationMethod;
  }>;
}

export class PIIDetector {
  private config: PIIDetectionConfig;
  private tokenMap: Map<string, string> = new Map();

  constructor(config: Partial<PIIDetectionConfig> = {}) {
    this.config = {
      enableEmailDetection: true,
      enablePhoneDetection: true,
      enableSSNDetection: true,
      enableCreditCardDetection: true,
      enableNameDetection: true,
      enableAddressDetection: true,
      defaultAnonymizationMethod: 'hash',
      customPatterns: [],
      ...config,
    };
  }

  /**
   * Detect and anonymize PII in a log entry
   */
  async detectAndAnonymize(entry: LogEntry): Promise<LogEntry> {
    const anonymizedEntry = { ...entry } as Record<string, any>;

    // Process each field in the entry
    for (const [key, value] of Object.entries(entry)) {
      if (typeof value === 'string') {
        anonymizedEntry[key] = await this.anonymizeString(value, key);
      } else if (typeof value === 'object' && value !== null) {
        anonymizedEntry[key] = await this.anonymizeObject(value);
      }
    }

    return anonymizedEntry as LogEntry;
  }

  /**
   * Anonymize a string value
   */
  private async anonymizeString(text: string, fieldName: string): Promise<string> {
    let anonymizedText = text;

    // Apply PII detection patterns
    const patterns = this.getPIIPatterns();

    for (const pattern of patterns) {
      if (this.shouldApplyPattern(pattern.name, fieldName)) {
        anonymizedText = await this.applyAnonymization(
          anonymizedText,
          pattern.pattern,
          pattern.method
        );
      }
    }

    return anonymizedText;
  }

  /**
   * Anonymize an object recursively
   */
  private async anonymizeObject(obj: any): Promise<any> {
    if (Array.isArray(obj)) {
      return Promise.all(obj.map(item => this.anonymizeObject(item)));
    }

    if (typeof obj === 'object' && obj !== null) {
      const anonymizedObj: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          anonymizedObj[key] = await this.anonymizeString(value, key);
        } else if (typeof value === 'object' && value !== null) {
          anonymizedObj[key] = await this.anonymizeObject(value);
        } else {
          anonymizedObj[key] = value;
        }
      }
      
      return anonymizedObj;
    }

    return obj;
  }

  /**
   * Get all PII detection patterns
   */
  private getPIIPatterns(): Array<{
    name: string;
    pattern: RegExp;
    method: AnonymizationMethod;
  }> {
    const patterns: Array<{
      name: string;
      pattern: RegExp;
      method: AnonymizationMethod;
    }> = [];

    if (this.config.enableEmailDetection) {
      patterns.push({
        name: 'email',
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        method: 'mask',
      });
    }

    if (this.config.enablePhoneDetection) {
      patterns.push({
        name: 'phone',
        pattern: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
        method: 'mask',
      });
    }

    if (this.config.enableSSNDetection) {
      patterns.push({
        name: 'ssn',
        pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g,
        method: 'hash',
      });
    }

    if (this.config.enableCreditCardDetection) {
      patterns.push({
        name: 'credit_card',
        pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
        method: 'hash',
      });
    }

    if (this.config.enableNameDetection) {
      patterns.push({
        name: 'name',
        pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
        method: 'tokenize',
      });
    }

    if (this.config.enableAddressDetection) {
      patterns.push({
        name: 'address',
        pattern: /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
        method: 'hash',
      });
    }

    // Add custom patterns
    patterns.push(...this.config.customPatterns);

    return patterns;
  }

  /**
   * Check if a pattern should be applied to a specific field
   */
  private shouldApplyPattern(patternName: string, fieldName: string): boolean {
    // Skip certain fields that are known to be safe
    const safeFields = ['timestamp', 'service', 'interaction_type', 'session_id'];
    if (safeFields.includes(fieldName)) {
      return false;
    }

    // Apply email detection to email-related fields
    if (patternName === 'email' && !fieldName.toLowerCase().includes('email')) {
      return false;
    }

    // Apply phone detection to phone-related fields
    if (patternName === 'phone' && !fieldName.toLowerCase().includes('phone')) {
      return false;
    }

    return true;
  }

  /**
   * Apply anonymization to text based on pattern and method
   */
  private async applyAnonymization(
    text: string,
    pattern: RegExp,
    method: AnonymizationMethod
  ): Promise<string> {
    return text.replace(pattern, (match) => {
      switch (method) {
        case 'hash':
          return this.hashValue(match);
        case 'mask':
          return this.maskValue(match);
        case 'remove':
          return '[REMOVED]';
        case 'tokenize':
          return this.tokenizeValue(match);
        default:
          return this.hashValue(match);
      }
    });
  }

  /**
   * Hash a value using SHA-256
   */
  private hashValue(value: string): string {
    const hash = createHash('sha256');
    hash.update(value);
    return `[HASH:${hash.digest('hex').substring(0, 8)}]`;
  }

  /**
   * Mask a value by replacing characters with asterisks
   */
  private maskValue(value: string): string {
    if (value.includes('@')) {
      // Email masking
      const [local, domain] = value.split('@');
      if (!local || !domain) return '[MASKED_EMAIL]';
      
      const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(0, local.length - 2)) + local.charAt(local.length - 1);
      return `${maskedLocal}@${domain}`;
    }

    // General masking
    if (value.length <= 2) {
      return '*'.repeat(value.length);
    }

    return value.charAt(0) + '*'.repeat(value.length - 2) + value.charAt(value.length - 1);
  }

  /**
   * Tokenize a value by replacing it with a consistent token
   */
  private tokenizeValue(value: string): string {
    // Check if we already have a token for this value
    if (this.tokenMap.has(value)) {
      return this.tokenMap.get(value)!;
    }

    // Generate a new token
    const tokenId = this.tokenMap.size + 1;
    const token = `[TOKEN_${tokenId.toString().padStart(4, '0')}]`;
    
    this.tokenMap.set(value, token);
    return token;
  }

  /**
   * Detect PII fields in a log entry without anonymizing
   */
  detectPIIFields(entry: LogEntry): PIIField[] {
    const piiFields: PIIField[] = [];
    const patterns = this.getPIIPatterns();

    const checkValue = (value: any, fieldPath: string): void => {
      if (typeof value === 'string') {
        for (const pattern of patterns) {
          const matches = value.match(pattern.pattern);
          if (matches && matches.length > 0) {
            piiFields.push({
              field: fieldPath,
              type: pattern.name as PIIField['type'],
              value: value,
              matches: matches,
              confidence: this.calculateConfidence(pattern.name, matches),
            });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const [key, nestedValue] of Object.entries(value)) {
          checkValue(nestedValue, `${fieldPath}.${key}`);
        }
      }
    };

    for (const [key, value] of Object.entries(entry)) {
      checkValue(value, key);
    }

    return piiFields;
  }

  /**
   * Calculate confidence score for PII detection
   */
  private calculateConfidence(type: string, matches: string[]): number {
    // Base confidence scores by type
    const baseConfidence: Record<string, number> = {
      email: 0.95,
      phone: 0.85,
      ssn: 0.99,
      credit_card: 0.90,
      name: 0.70,
      address: 0.75,
    };

    let confidence = baseConfidence[type] || 0.50;

    // Adjust based on number of matches
    if (matches.length > 1) {
      confidence = Math.min(confidence + 0.05, 1.0);
    }

    return confidence;
  }

  /**
   * Validate anonymization quality
   */
  validateAnonymization(original: string, anonymized: string): {
    isValid: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 1.0;

    // Check if any original PII patterns still exist
    const patterns = this.getPIIPatterns();
    const anonymizedMatches: string[] = [];

    for (const pattern of patterns) {
      const matches = anonymized.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          if (anonymizedMatches.includes(match)) {
            issues.push(`PII pattern '${pattern.name}' still detected: ${match}`);
            score -= 0.2;
          }
        }
      }
    }

    // Check if anonymization markers are present
    const anonymizationMarkers = ['[HASH:', '[TOKEN_', '[REMOVED]', '*'];
    const hasMarkers = anonymizationMarkers.some(marker => anonymized.includes(marker));

    if (!hasMarkers && original !== anonymized) {
      issues.push('No anonymization markers found, but content was modified');
      score -= 0.1;
    }

    // Check if content is completely removed
    if (anonymized.trim().length === 0 && original.trim().length > 0) {
      issues.push('All content was removed during anonymization');
      score -= 0.3;
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(score, 0),
    };
  }

  /**
   * Get anonymization statistics
   */
  getStats(): {
    totalTokens: number;
    patternCounts: Record<string, number>;
    methodCounts: Record<AnonymizationMethod, number>;
  } {
    const patterns = this.getPIIPatterns();
    
    return {
      totalTokens: this.tokenMap.size,
      patternCounts: patterns.reduce((acc, pattern) => {
        acc[pattern.name] = 0; // Would need to track actual usage
        return acc;
      }, {} as Record<string, number>),
      methodCounts: {
        hash: 0,
        mask: 0,
        remove: 0,
        tokenize: this.tokenMap.size,
      },
    };
  }

  /**
   * Clear token map (for testing or reset)
   */
  clearTokens(): void {
    this.tokenMap.clear();
  }

  /**
   * Export token map for backup/restore
   */
  exportTokenMap(): Record<string, string> {
    return Object.fromEntries(this.tokenMap);
  }

  /**
   * Import token map from backup
   */
  importTokenMap(tokenMap: Record<string, string>): void {
    this.tokenMap = new Map(Object.entries(tokenMap));
  }
} 