import { IsEnum, IsNumber, IsOptional, IsString, IsBoolean, validateSync } from 'class-validator';
import { Transform, plainToInstance } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number = 3009;

  // Analytics Database
  @IsString()
  @IsOptional()
  ANALYTICS_DB_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  ANALYTICS_DB_PORT: number = 5432;

  @IsString()
  @IsOptional()
  ANALYTICS_DB_USERNAME: string = 'postgres';

  @IsString()
  @IsOptional()
  ANALYTICS_DB_PASSWORD: string = 'postgres';

  @IsString()
  @IsOptional()
  ANALYTICS_DB_NAME: string = 'mindlyfe_analytics';

  // Operational Database
  @IsString()
  @IsOptional()
  OPERATIONAL_DB_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  OPERATIONAL_DB_PORT: number = 5432;

  @IsString()
  @IsOptional()
  OPERATIONAL_DB_USERNAME: string = 'postgres';

  @IsString()
  @IsOptional()
  OPERATIONAL_DB_PASSWORD: string = 'postgres';

  @IsString()
  @IsOptional()
  OPERATIONAL_DB_NAME: string = 'mindlyfe_main';

  // JWT
  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_SERVICE_SECRET: string;

  // Redis
  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  // AWS
  @IsString()
  @IsOptional()
  AWS_REGION: string = 'us-east-1';

  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID?: string;

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsString()
  @IsOptional()
  S3_REPORTS_BUCKET: string = 'mindlyfe-reports';

  @IsString()
  @IsOptional()
  ATHENA_DATABASE: string = 'mindlyfe_analytics';

  @IsString()
  @IsOptional()
  ATHENA_WORKGROUP: string = 'mindlyfe-primary';

  // Service URLs
  @IsString()
  @IsOptional()
  AUTH_SERVICE_URL: string = 'http://auth-service:3001';

  @IsString()
  @IsOptional()
  NOTIFICATION_SERVICE_URL: string = 'http://notification-service:3005';

  @IsString()
  @IsOptional()
  PAYMENT_SERVICE_URL: string = 'http://payment-service:3006';

  // ETL Configuration
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  ETL_BATCH_SIZE: number = 1000;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  ETL_SCHEDULE_INTERVAL: number = 300000;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  ENABLE_REAL_TIME_PROCESSING: boolean = false;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  DATA_RETENTION_DAYS: number = 365;

  // Report Configuration
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  REPORT_CACHE_TTL: number = 3600;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  MAX_REPORT_SIZE_MB: number = 50;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  ENABLE_SCHEDULED_REPORTS: boolean = false;

  @IsString()
  @IsOptional()
  REPORT_STORAGE_PATH: string = '/tmp/reports';

  // Dashboard Configuration
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  DASHBOARD_REFRESH_INTERVAL: number = 60000;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  MAX_DASHBOARD_WIDGETS: number = 20;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  ENABLE_CUSTOM_DASHBOARDS: boolean = false;

  // Data Lake
  @IsString()
  @IsOptional()
  DATA_LAKE_BUCKET_NAME: string = 'mindlyfe-data-lake';

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  ENABLE_DATA_LAKE_QUERY: boolean = false;

  // Analytics
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  ANALYTICS_REAL_TIME_WINDOW: number = 300;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  AGGREGATION_BATCH_SIZE: number = 5000;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== 'false')
  ENABLE_METRIC_CACHING: boolean = true;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  METRIC_CACHE_TTL: number = 300;

  // Notification Analytics
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  ENABLE_NOTIFICATION_REAL_TIME_TRACKING: boolean = false;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  NOTIFICATION_TRACKING_RETENTION_DAYS: number = 90;

  @IsString()
  @IsOptional()
  NOTIFICATION_AGGREGATION_LEVEL: string = 'hourly';

  // Security
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== 'false')
  ENABLE_AUDIT_LOGGING: boolean = true;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  AUDIT_RETENTION_DAYS: number = 365;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  ENABLE_DATA_MASKING: boolean = false;

  // Rate Limiting
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_TTL: number = 60;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  THROTTLE_LIMIT: number = 100;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  REPORT_THROTTLE_TTL: number = 300;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  REPORT_THROTTLE_LIMIT: number = 10;

  // CORS
  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = '*';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
} 