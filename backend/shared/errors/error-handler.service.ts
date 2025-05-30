import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityLoggerService, SecurityEventType } from '../security/security-logger.service';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    userMessage: string;
    details?: any;
    timestamp: string;
    requestId?: string;
    supportReference?: string;
  };
}

export interface ErrorContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  metadata?: any;
}

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);
  private readonly isProduction: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly securityLogger: SecurityLoggerService,
  ) {
    this.isProduction = this.configService.get('environment') === 'production';
  }

  /**
   * Handle and format errors with user-friendly messages
   */
  async handleError(error: any, context?: ErrorContext): Promise<ErrorResponse> {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();

    try {
      // Log the error for debugging
      this.logger.error(`Error ${errorId}:`, {
        error: error.message,
        stack: error.stack,
        context,
      });

      // Determine error type and create appropriate response
      const errorInfo = this.categorizeError(error);
      
      // Log security events for certain error types
      if (errorInfo.isSecurityRelated) {
        await this.logSecurityEvent(error, context, errorId);
      }

      // Create user-friendly response
      const response: ErrorResponse = {
        success: false,
        error: {
          code: errorInfo.code,
          message: this.isProduction ? errorInfo.userMessage : error.message,
          userMessage: errorInfo.userMessage,
          timestamp,
          requestId: context?.requestId || errorId,
          supportReference: errorId,
        },
      };

      // Add details only in non-production environments
      if (!this.isProduction && errorInfo.includeDetails) {
        response.error.details = {
          originalError: error.message,
          stack: error.stack,
          context,
        };
      }

      return response;

    } catch (handlingError) {
      this.logger.error('Error in error handler:', handlingError);
      
      // Fallback error response
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          userMessage: 'We\'re experiencing technical difficulties. Please try again later.',
          timestamp,
          requestId: context?.requestId || errorId,
          supportReference: errorId,
        },
      };
    }
  }

  /**
   * Handle authentication errors
   */
  async handleAuthError(error: any, context?: ErrorContext): Promise<ErrorResponse> {
    const authContext = {
      ...context,
      endpoint: context?.endpoint || '/auth',
    };

    // Log potential security threat
    await this.securityLogger.logSecurityEvent({
      type: SecurityEventType.AUTHENTICATION_FAILURE,
      userId: context?.userId,
      ip: context?.ip,
      endpoint: authContext.endpoint,
      severity: 'medium',
      details: {
        error: error.message,
        userAgent: context?.userAgent,
      },
    });

    return this.handleError(error, authContext);
  }

  /**
   * Handle payment errors
   */
  async handlePaymentError(error: any, context?: ErrorContext): Promise<ErrorResponse> {
    const paymentContext = {
      ...context,
      endpoint: context?.endpoint || '/payments',
    };

    // Log payment failure for monitoring
    await this.securityLogger.logSecurityEvent({
      type: SecurityEventType.PAYMENT_FAILURE,
      userId: context?.userId,
      ip: context?.ip,
      endpoint: paymentContext.endpoint,
      severity: 'high',
      details: {
        error: error.message,
        metadata: context?.metadata,
      },
    });

    return this.handleError(error, paymentContext);
  }

  /**
   * Handle validation errors
   */
  async handleValidationError(error: any, context?: ErrorContext): Promise<ErrorResponse> {
    const validationErrors = this.extractValidationErrors(error);
    
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        userMessage: 'Please check your input and try again.',
        details: this.isProduction ? undefined : validationErrors,
        timestamp: new Date().toISOString(),
        requestId: context?.requestId || this.generateErrorId(),
        supportReference: this.generateErrorId(),
      },
    };
  }

  /**
   * Handle rate limiting errors
   */
  async handleRateLimitError(error: any, context?: ErrorContext): Promise<ErrorResponse> {
    // Log potential abuse
    await this.securityLogger.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      userId: context?.userId,
      ip: context?.ip,
      endpoint: context?.endpoint,
      severity: 'medium',
      details: {
        error: error.message,
        userAgent: context?.userAgent,
      },
    });

    return {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
        userMessage: 'You\'re making requests too quickly. Please wait a moment and try again.',
        timestamp: new Date().toISOString(),
        requestId: context?.requestId || this.generateErrorId(),
        supportReference: this.generateErrorId(),
      },
    };
  }

  /**
   * Create HTTP exception with user-friendly message
   */
  createHttpException(error: any, context?: ErrorContext): HttpException {
    const errorInfo = this.categorizeError(error);
    const errorResponse = {
      success: false,
      error: {
        code: errorInfo.code,
        message: errorInfo.userMessage,
        timestamp: new Date().toISOString(),
        requestId: context?.requestId || this.generateErrorId(),
      },
    };

    return new HttpException(errorResponse, errorInfo.httpStatus);
  }

  /**
   * Categorize error and determine appropriate response
   */
  private categorizeError(error: any): {
    code: string;
    userMessage: string;
    httpStatus: number;
    isSecurityRelated: boolean;
    includeDetails: boolean;
  } {
    // Authentication errors
    if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
      return {
        code: 'AUTHENTICATION_FAILED',
        userMessage: 'Please log in to continue.',
        httpStatus: HttpStatus.UNAUTHORIZED,
        isSecurityRelated: true,
        includeDetails: false,
      };
    }

    // Authorization errors
    if (error.message?.includes('Forbidden') || error.message?.includes('Access denied')) {
      return {
        code: 'ACCESS_DENIED',
        userMessage: 'You don\'t have permission to perform this action.',
        httpStatus: HttpStatus.FORBIDDEN,
        isSecurityRelated: true,
        includeDetails: false,
      };
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.message?.includes('validation')) {
      return {
        code: 'VALIDATION_ERROR',
        userMessage: 'Please check your input and try again.',
        httpStatus: HttpStatus.BAD_REQUEST,
        isSecurityRelated: false,
        includeDetails: true,
      };
    }

    // Payment errors
    if (error.message?.includes('payment') || error.message?.includes('stripe') || error.message?.includes('dpo')) {
      return {
        code: 'PAYMENT_ERROR',
        userMessage: 'Payment processing failed. Please try again or use a different payment method.',
        httpStatus: HttpStatus.PAYMENT_REQUIRED,
        isSecurityRelated: false,
        includeDetails: false,
      };
    }

    // Network/timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
      return {
        code: 'SERVICE_UNAVAILABLE',
        userMessage: 'Service is temporarily unavailable. Please try again in a few moments.',
        httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
        isSecurityRelated: false,
        includeDetails: false,
      };
    }

    // Database errors
    if (error.message?.includes('database') || error.message?.includes('connection')) {
      return {
        code: 'DATABASE_ERROR',
        userMessage: 'We\'re experiencing technical difficulties. Please try again later.',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        isSecurityRelated: false,
        includeDetails: false,
      };
    }

    // Rate limiting
    if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        userMessage: 'You\'re making requests too quickly. Please wait a moment and try again.',
        httpStatus: HttpStatus.TOO_MANY_REQUESTS,
        isSecurityRelated: true,
        includeDetails: false,
      };
    }

    // File upload errors
    if (error.message?.includes('file') || error.message?.includes('upload')) {
      return {
        code: 'FILE_UPLOAD_ERROR',
        userMessage: 'File upload failed. Please check the file size and format.',
        httpStatus: HttpStatus.BAD_REQUEST,
        isSecurityRelated: false,
        includeDetails: true,
      };
    }

    // Security violations
    if (error.message?.includes('security') || error.message?.includes('violation')) {
      return {
        code: 'SECURITY_VIOLATION',
        userMessage: 'Security violation detected. This incident has been logged.',
        httpStatus: HttpStatus.FORBIDDEN,
        isSecurityRelated: true,
        includeDetails: false,
      };
    }

    // Default error
    return {
      code: 'INTERNAL_ERROR',
      userMessage: 'An unexpected error occurred. Please try again later.',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      isSecurityRelated: false,
      includeDetails: false,
    };
  }

  /**
   * Extract validation errors from error object
   */
  private extractValidationErrors(error: any): any {
    if (error.details) {
      return error.details;
    }

    if (error.errors && Array.isArray(error.errors)) {
      return error.errors.map((err: any) => ({
        field: err.property || err.field,
        message: err.message || err.constraints,
        value: err.value,
      }));
    }

    return null;
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(error: any, context?: ErrorContext, errorId?: string): Promise<void> {
    try {
      await this.securityLogger.logSecurityEvent({
        type: SecurityEventType.SECURITY_VIOLATION,
        userId: context?.userId,
        ip: context?.ip,
        endpoint: context?.endpoint,
        method: context?.method,
        severity: 'medium',
        details: {
          errorId,
          error: error.message,
          userAgent: context?.userAgent,
          metadata: context?.metadata,
        },
      });
    } catch (loggingError) {
      this.logger.error('Failed to log security event:', loggingError);
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user-friendly error messages for common scenarios
   */
  getUserFriendlyMessage(errorCode: string): string {
    const messages: Record<string, string> = {
      AUTHENTICATION_FAILED: 'Please log in to continue.',
      ACCESS_DENIED: 'You don\'t have permission to perform this action.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      PAYMENT_ERROR: 'Payment processing failed. Please try again or use a different payment method.',
      SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again in a few moments.',
      DATABASE_ERROR: 'We\'re experiencing technical difficulties. Please try again later.',
      RATE_LIMIT_EXCEEDED: 'You\'re making requests too quickly. Please wait a moment and try again.',
      FILE_UPLOAD_ERROR: 'File upload failed. Please check the file size and format.',
      SECURITY_VIOLATION: 'Security violation detected. This incident has been logged.',
      INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
    };

    return messages[errorCode] || messages.INTERNAL_ERROR;
  }

  /**
   * Health check for error handler
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      return {
        status: 'healthy',
        details: {
          environment: this.isProduction ? 'production' : 'development',
          errorLogging: 'enabled',
          securityLogging: 'enabled',
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