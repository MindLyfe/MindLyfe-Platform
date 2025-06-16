import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  chatRoomId?: string;
  callSessionId?: string;
  service?: string;
  operation?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  endpoint?: string;
  error?: string;
  successful?: boolean;
  status?: string;
  responseTime?: number;
  responseTimeFormatted?: string;
  databaseStatus?: string;
  serviceIssues?: boolean;
  statusCode?: number;
  contentLength?: string;
  method?: string;
  timestamp?: string;
  headers?: any;
  query?: any;
  body?: any;
  metadata?: Record<string, any>;
  [key: string]: any; // Allow any additional properties
}

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private readonly logger: winston.Logger;
  private context: string;

  constructor(private readonly configService: ConfigService) {
    const logLevel = this.configService.get<string>('log.level', 'debug');
    const environment = this.configService.get<string>('environment', 'development');
    const serviceName = this.configService.get<string>('SERVICE_NAME', 'chat-service');

    // Create winston logger
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf((info: any) => {
          const logEntry: any = {
            timestamp: info.timestamp,
            level: info.level,
            service: serviceName,
            environment,
            context: info.context,
            message: info.message,
            ...info
          };
          
          if (info.stack) {
            logEntry.stack = info.stack;
          }
          
          return JSON.stringify(logEntry);
        })
      ),
      defaultMeta: {
        service: serviceName,
        environment,
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: environment === 'development' 
            ? winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                  return `[${timestamp}] ${level} [${context || 'App'}] ${message}${metaStr}`;
                })
              )
            : winston.format.json()
        }),
        
        // File transport for all logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/chat-service-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        
        // Error file transport
        new winston.transports.DailyRotateFile({
          level: 'error',
          filename: 'logs/chat-service-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        
        // Audit log for sensitive operations
        new winston.transports.DailyRotateFile({
          level: 'info',
          filename: 'logs/audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '90d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    });

    // Ensure logs directory exists
    this.ensureLogsDirectory();
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, stack?: string, context?: string) {
    this.logger.error(message, { 
      context: context || this.context,
      stack 
    });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Enhanced logging methods with context
  logWithContext(level: string, message: string, logContext: LogContext = {}) {
    this.logger.log(level, message, {
      context: this.context,
      ...logContext
    });
  }

  // Audit logging for sensitive operations
  audit(action: string, logContext: LogContext = {}) {
    this.logger.info(`AUDIT: ${action}`, {
      context: 'AUDIT',
      action,
      timestamp: new Date().toISOString(),
      ...logContext
    });
  }

  // Performance logging
  performance(operation: string, duration: number, logContext: LogContext = {}) {
    this.logger.info(`PERFORMANCE: ${operation}`, {
      context: 'PERFORMANCE',
      operation,
      duration: `${duration}ms`,
      ...logContext
    });
  }

  // Security logging
  security(event: string, logContext: LogContext = {}) {
    this.logger.warn(`SECURITY: ${event}`, {
      context: 'SECURITY',
      event,
      timestamp: new Date().toISOString(),
      ...logContext
    });
  }

  // Business logic logging
  business(event: string, logContext: LogContext = {}) {
    this.logger.info(`BUSINESS: ${event}`, {
      context: 'BUSINESS',
      event,
      ...logContext
    });
  }

  // Integration logging
  integration(service: string, operation: string, success: boolean, logContext: LogContext = {}) {
    const level = success ? 'info' : 'error';
    this.logger.log(level, `INTEGRATION: ${service} - ${operation}`, {
      context: 'INTEGRATION',
      service,
      operation,
      success,
      ...logContext
    });
  }

  private ensureLogsDirectory() {
    const fs = require('fs');
    const path = require('path');
    
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  // Graceful shutdown
  async close() {
    return new Promise<void>((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }
} 