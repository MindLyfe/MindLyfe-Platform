import { Injectable, Logger } from '@nestjs/common';
import { parseStringPromise, Builder } from 'xml2js';
import Joi from 'joi';

export interface XMLValidationOptions {
  maxSize?: number;
  allowedElements?: string[];
  allowedAttributes?: string[];
  preventXXE?: boolean;
  validateSchema?: boolean;
}

export interface DPOPaymentRequest {
  CompanyToken: string;
  Request: string;
  Transaction: {
    PaymentAmount: string;
    PaymentCurrency: string;
    CompanyRef: string;
    RedirectURL: string;
    BackURL: string;
    CompanyRefUnique: string;
    PTL: string;
    PTLtype: string;
    Services?: {
      Service: {
        ServiceType: string;
        ServiceDescription: string;
        ServiceDate: string;
      }[];
    };
  };
}

export interface DPOPaymentResponse {
  API3G: {
    Result: string;
    ResultExplanation: string;
    TransToken?: string;
    TransRef?: string;
  };
}

@Injectable()
export class XMLValidatorService {
  private readonly logger = new Logger(XMLValidatorService.name);
  
  // DPO Pay XML Schema definitions
  private readonly dpoRequestSchema = Joi.object({
    API3G: Joi.object({
      CompanyToken: Joi.string().required().max(100),
      Request: Joi.string().valid('createToken', 'verifyToken', 'refundToken').required(),
      Transaction: Joi.object({
        PaymentAmount: Joi.string().pattern(/^\d+(\.\d{1,2})?$/).required(),
        PaymentCurrency: Joi.string().length(3).required(),
        CompanyRef: Joi.string().max(100).required(),
        RedirectURL: Joi.string().uri().required(),
        BackURL: Joi.string().uri().required(),
        CompanyRefUnique: Joi.string().max(100).required(),
        PTL: Joi.string().max(10).required(),
        PTLtype: Joi.string().valid('hours', 'minutes').required(),
        Services: Joi.object({
          Service: Joi.array().items(
            Joi.object({
              ServiceType: Joi.string().max(50).required(),
              ServiceDescription: Joi.string().max(200).required(),
              ServiceDate: Joi.string().isoDate().required(),
            })
          ).min(1).max(10)
        }).optional()
      }).required()
    }).required()
  });

  private readonly dpoResponseSchema = Joi.object({
    API3G: Joi.object({
      Result: Joi.string().pattern(/^\d{2}$/).required(),
      ResultExplanation: Joi.string().max(500).required(),
      TransToken: Joi.string().max(100).optional(),
      TransRef: Joi.string().max(100).optional(),
    }).required()
  });

  constructor() {
    this.logger.log('🔒 XML Validator Service initialized with DPO Pay schema validation');
  }

  /**
   * Validate and parse XML with security measures
   */
  async validateAndParseXML(
    xmlString: string, 
    options: XMLValidationOptions = {}
  ): Promise<any> {
    const opts = {
      maxSize: options.maxSize || 1024 * 1024, // 1MB default
      preventXXE: options.preventXXE !== false, // Default to true
      validateSchema: options.validateSchema !== false, // Default to true
      ...options
    };

    try {
      // Size validation
      if (xmlString.length > opts.maxSize) {
        throw new Error(`XML size exceeds maximum allowed size of ${opts.maxSize} bytes`);
      }

      // XXE Prevention - check for dangerous patterns
      if (opts.preventXXE) {
        this.validateAgainstXXE(xmlString);
      }

      // Parse XML with security settings
      const parseOptions = {
        explicitArray: false,
        ignoreAttrs: false,
        trim: true,
        normalize: true,
        normalizeTags: false,
        attrkey: '@',
        charkey: '#',
        // Security settings
        xmlns: false, // Disable namespace processing
        explicitCharkey: false,
        emptyTag: null,
        // Prevent XXE attacks
        async: false,
        strict: true,
        // Limit processing
        maxBuffer: opts.maxSize,
      };

      const parsed = await parseStringPromise(xmlString, parseOptions);

      // Additional validation
      if (opts.validateSchema) {
        this.validateParsedStructure(parsed, opts);
      }

      return parsed;

    } catch (error) {
      this.logger.error('XML validation failed:', error.message);
      throw new Error(`XML validation failed: ${error.message}`);
    }
  }

  /**
   * Validate DPO Pay request XML
   */
  async validateDPORequest(xmlString: string): Promise<DPOPaymentRequest> {
    try {
      const parsed = await this.validateAndParseXML(xmlString, {
        maxSize: 10 * 1024, // 10KB for DPO requests
        allowedElements: [
          'API3G', 'CompanyToken', 'Request', 'Transaction',
          'PaymentAmount', 'PaymentCurrency', 'CompanyRef',
          'RedirectURL', 'BackURL', 'CompanyRefUnique', 'PTL', 'PTLtype',
          'Services', 'Service', 'ServiceType', 'ServiceDescription', 'ServiceDate'
        ]
      });

      // Validate against DPO schema
      const { error, value } = this.dpoRequestSchema.validate(parsed);
      if (error) {
        throw new Error(`DPO request schema validation failed: ${error.message}`);
      }

      this.logger.debug('✅ DPO request XML validated successfully');
      return value;

    } catch (error) {
      this.logger.error('❌ DPO request validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate DPO Pay response XML
   */
  async validateDPOResponse(xmlString: string): Promise<DPOPaymentResponse> {
    try {
      const parsed = await this.validateAndParseXML(xmlString, {
        maxSize: 5 * 1024, // 5KB for DPO responses
        allowedElements: [
          'API3G', 'Result', 'ResultExplanation', 'TransToken', 'TransRef'
        ]
      });

      // Validate against DPO response schema
      const { error, value } = this.dpoResponseSchema.validate(parsed);
      if (error) {
        throw new Error(`DPO response schema validation failed: ${error.message}`);
      }

      this.logger.debug('✅ DPO response XML validated successfully');
      return value;

    } catch (error) {
      this.logger.error('❌ DPO response validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Create secure DPO Pay request XML
   */
  createDPORequestXML(data: DPOPaymentRequest): string {
    try {
      const builder = new Builder({
        rootName: 'API3G',
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        renderOpts: { pretty: false },
        headless: false,
      });

      // Sanitize data before building XML
      const sanitizedData = this.sanitizeXMLData(data);
      
      const xml = builder.buildObject(sanitizedData);
      
      this.logger.debug('✅ DPO request XML created successfully');
      return xml;

    } catch (error) {
      this.logger.error('❌ Failed to create DPO request XML:', error.message);
      throw new Error(`Failed to create DPO request XML: ${error.message}`);
    }
  }

  /**
   * Validate against XXE (XML External Entity) attacks
   */
  private validateAgainstXXE(xmlString: string): void {
    const xxePatterns = [
      /<!DOCTYPE[^>]*>/i,
      /<!ENTITY[^>]*>/i,
      /&[a-zA-Z][a-zA-Z0-9]*;/,
      /<\?xml[^>]*encoding\s*=\s*["'][^"']*["'][^>]*\?>/i,
      /SYSTEM\s+["'][^"']*["']/i,
      /PUBLIC\s+["'][^"']*["']/i,
      /file:\/\//i,
      /http:\/\//i,
      /https:\/\//i,
      /ftp:\/\//i,
    ];

    for (const pattern of xxePatterns) {
      if (pattern.test(xmlString)) {
        throw new Error(`Potential XXE attack detected: ${pattern.source}`);
      }
    }

    // Check for suspicious entity references
    const entityMatches = xmlString.match(/&[^;]+;/g);
    if (entityMatches) {
      const allowedEntities = ['&amp;', '&lt;', '&gt;', '&quot;', '&apos;'];
      for (const entity of entityMatches) {
        if (!allowedEntities.includes(entity)) {
          throw new Error(`Suspicious entity reference detected: ${entity}`);
        }
      }
    }
  }

  /**
   * Validate parsed XML structure
   */
  private validateParsedStructure(parsed: any, options: XMLValidationOptions): void {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid XML structure: not an object');
    }

    // Check for allowed elements if specified
    if (options.allowedElements) {
      this.validateAllowedElements(parsed, options.allowedElements);
    }

    // Check for maximum depth
    const maxDepth = 10; // Reasonable limit for DPO Pay XML
    if (this.getObjectDepth(parsed) > maxDepth) {
      throw new Error(`XML structure too deep: exceeds maximum depth of ${maxDepth}`);
    }

    // Check for circular references
    if (this.hasCircularReference(parsed)) {
      throw new Error('Circular reference detected in XML structure');
    }
  }

  /**
   * Validate allowed elements recursively
   */
  private validateAllowedElements(obj: any, allowedElements: string[], path = ''): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      // Skip attributes (prefixed with @)
      if (key.startsWith('@') || key === '#') {
        continue;
      }

      const currentPath = path ? `${path}.${key}` : key;

      if (!allowedElements.includes(key)) {
        throw new Error(`Disallowed element found: ${currentPath}`);
      }

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            this.validateAllowedElements(item, allowedElements, `${currentPath}[${index}]`);
          });
        } else {
          this.validateAllowedElements(value, allowedElements, currentPath);
        }
      }
    }
  }

  /**
   * Get object depth
   */
  private getObjectDepth(obj: any, depth = 0): number {
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }

    let maxDepth = depth;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        const currentDepth = this.getObjectDepth(value, depth + 1);
        maxDepth = Math.max(maxDepth, currentDepth);
      }
    }

    return maxDepth;
  }

  /**
   * Check for circular references
   */
  private hasCircularReference(obj: any, seen = new WeakSet()): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    if (seen.has(obj)) {
      return true;
    }

    seen.add(obj);

    for (const value of Object.values(obj)) {
      if (this.hasCircularReference(value, seen)) {
        return true;
      }
    }

    seen.delete(obj);
    return false;
  }

  /**
   * Sanitize XML data to prevent injection
   */
  private sanitizeXMLData(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeXMLData(item));
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Sanitize key
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
        if (sanitizedKey) {
          sanitized[sanitizedKey] = this.sanitizeXMLData(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Health check for XML validator
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Test basic XML parsing
      const testXML = '<?xml version="1.0" encoding="UTF-8"?><test>value</test>';
      await this.validateAndParseXML(testXML);

      return {
        status: 'healthy',
        details: {
          schemasLoaded: ['dpoRequest', 'dpoResponse'],
          xxeProtection: true,
          maxSize: '1MB',
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message },
      };
    }
  }
} 