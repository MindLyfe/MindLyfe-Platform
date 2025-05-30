import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export interface SecretConfig {
  secretName: string;
  region: string;
  versionId?: string;
  versionStage?: string;
}

export interface DatabaseSecrets {
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

export interface JWTSecrets {
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_SERVICE_SECRET: string;
}

export interface PaymentSecrets {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  DPO_COMPANY_TOKEN: string;
  DPO_SERVICE_TYPE: string;
}

export interface ExternalAPISecrets {
  OPENAI_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  CURRENCY_API_KEY: string;
  EXCHANGERATE_API_KEY: string;
  FIXER_API_KEY: string;
}

@Injectable()
export class SecretsManagerService implements OnModuleInit {
  private readonly logger = new Logger(SecretsManagerService.name);
  private readonly client: SecretsManagerClient;
  private readonly secretsCache = new Map<string, any>();
  private readonly cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get('aws.region', 'us-east-1');
    
    this.client = new SecretsManagerClient({
      region,
      credentials: {
        accessKeyId: this.configService.get('aws.accessKeyId'),
        secretAccessKey: this.configService.get('aws.secretAccessKey'),
      },
    });
  }

  async onModuleInit() {
    if (this.configService.get('environment') === 'production') {
      this.logger.log('🔐 Initializing AWS Secrets Manager for production environment');
      await this.preloadCriticalSecrets();
    }
  }

  /**
   * Preload critical secrets on application startup
   */
  private async preloadCriticalSecrets(): Promise<void> {
    const criticalSecrets = [
      'mindlyf/database',
      'mindlyf/jwt',
      'mindlyf/payment',
      'mindlyf/external-apis'
    ];

    for (const secretName of criticalSecrets) {
      try {
        await this.getSecret(secretName);
        this.logger.log(`✅ Preloaded secret: ${secretName}`);
      } catch (error) {
        this.logger.error(`❌ Failed to preload secret ${secretName}:`, error.message);
        throw new Error(`Critical secret ${secretName} unavailable`);
      }
    }
  }

  /**
   * Get secret from AWS Secrets Manager with caching
   */
  async getSecret(secretName: string, config?: Partial<SecretConfig>): Promise<any> {
    const cacheKey = `${secretName}-${config?.versionId || 'AWSCURRENT'}`;
    
    // Check cache first
    if (this.isSecretCached(cacheKey)) {
      return this.secretsCache.get(cacheKey);
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: secretName,
        VersionId: config?.versionId,
        VersionStage: config?.versionStage || 'AWSCURRENT',
      });

      const response = await this.client.send(command);
      
      if (!response.SecretString) {
        throw new Error(`Secret ${secretName} has no string value`);
      }

      const secretValue = JSON.parse(response.SecretString);
      
      // Cache the secret
      this.secretsCache.set(cacheKey, secretValue);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
      
      this.logger.debug(`🔐 Retrieved secret: ${secretName}`);
      return secretValue;
      
    } catch (error) {
      this.logger.error(`❌ Failed to retrieve secret ${secretName}:`, error.message);
      
      // Fallback to environment variables in development
      if (this.configService.get('environment') !== 'production') {
        this.logger.warn(`⚠️ Falling back to environment variables for ${secretName}`);
        return this.getFallbackSecret(secretName);
      }
      
      throw error;
    }
  }

  /**
   * Get database secrets
   */
  async getDatabaseSecrets(): Promise<DatabaseSecrets> {
    return this.getSecret('mindlyf/database');
  }

  /**
   * Get JWT secrets
   */
  async getJWTSecrets(): Promise<JWTSecrets> {
    return this.getSecret('mindlyf/jwt');
  }

  /**
   * Get payment secrets
   */
  async getPaymentSecrets(): Promise<PaymentSecrets> {
    return this.getSecret('mindlyf/payment');
  }

  /**
   * Get external API secrets
   */
  async getExternalAPISecrets(): Promise<ExternalAPISecrets> {
    return this.getSecret('mindlyf/external-apis');
  }

  /**
   * Update secret in AWS Secrets Manager
   */
  async updateSecret(secretName: string, secretValue: any): Promise<void> {
    try {
      const { UpdateSecretCommand } = await import('@aws-sdk/client-secrets-manager');
      
      const command = new UpdateSecretCommand({
        SecretId: secretName,
        SecretString: JSON.stringify(secretValue),
      });

      await this.client.send(command);
      
      // Invalidate cache
      this.invalidateSecretCache(secretName);
      
      this.logger.log(`✅ Updated secret: ${secretName}`);
    } catch (error) {
      this.logger.error(`❌ Failed to update secret ${secretName}:`, error.message);
      throw error;
    }
  }

  /**
   * Rotate secret (create new version)
   */
  async rotateSecret(secretName: string): Promise<void> {
    try {
      const { RotateSecretCommand } = await import('@aws-sdk/client-secrets-manager');
      
      const command = new RotateSecretCommand({
        SecretId: secretName,
        ForceRotateSecrets: true,
      });

      await this.client.send(command);
      
      // Invalidate cache
      this.invalidateSecretCache(secretName);
      
      this.logger.log(`🔄 Rotated secret: ${secretName}`);
    } catch (error) {
      this.logger.error(`❌ Failed to rotate secret ${secretName}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if secret is cached and not expired
   */
  private isSecretCached(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    if (!expiry || Date.now() > expiry) {
      this.secretsCache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
      return false;
    }
    return this.secretsCache.has(cacheKey);
  }

  /**
   * Invalidate cache for a specific secret
   */
  private invalidateSecretCache(secretName: string): void {
    const keysToDelete = Array.from(this.secretsCache.keys())
      .filter(key => key.startsWith(secretName));
    
    keysToDelete.forEach(key => {
      this.secretsCache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  /**
   * Fallback to environment variables for development
   */
  private getFallbackSecret(secretName: string): any {
    switch (secretName) {
      case 'mindlyf/database':
        return {
          DB_HOST: this.configService.get('DB_HOST', 'localhost'),
          DB_PORT: this.configService.get('DB_PORT', '5432'),
          DB_USERNAME: this.configService.get('DB_USERNAME', 'postgres'),
          DB_PASSWORD: this.configService.get('DB_PASSWORD', 'postgres'),
          DB_NAME: this.configService.get('DB_NAME', 'mindlyf'),
        };
      
      case 'mindlyf/jwt':
        return {
          JWT_SECRET: this.configService.get('JWT_SECRET', 'dev-secret-key'),
          JWT_REFRESH_SECRET: this.configService.get('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
          JWT_SERVICE_SECRET: this.configService.get('JWT_SERVICE_SECRET', 'dev-service-secret'),
        };
      
      case 'mindlyf/payment':
        return {
          STRIPE_SECRET_KEY: this.configService.get('STRIPE_SECRET_KEY', ''),
          STRIPE_WEBHOOK_SECRET: this.configService.get('STRIPE_WEBHOOK_SECRET', ''),
          DPO_COMPANY_TOKEN: this.configService.get('DPO_COMPANY_TOKEN', ''),
          DPO_SERVICE_TYPE: this.configService.get('DPO_SERVICE_TYPE', ''),
        };
      
      case 'mindlyf/external-apis':
        return {
          OPENAI_API_KEY: this.configService.get('OPENAI_API_KEY', ''),
          AWS_ACCESS_KEY_ID: this.configService.get('AWS_ACCESS_KEY_ID', ''),
          AWS_SECRET_ACCESS_KEY: this.configService.get('AWS_SECRET_ACCESS_KEY', ''),
          CURRENCY_API_KEY: this.configService.get('CURRENCY_API_KEY', ''),
          EXCHANGERATE_API_KEY: this.configService.get('EXCHANGERATE_API_KEY', ''),
          FIXER_API_KEY: this.configService.get('FIXER_API_KEY', ''),
        };
      
      default:
        throw new Error(`Unknown secret: ${secretName}`);
    }
  }

  /**
   * Health check for secrets manager
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Try to list secrets to verify connectivity
      const { ListSecretsCommand } = await import('@aws-sdk/client-secrets-manager');
      const command = new ListSecretsCommand({ MaxResults: 1 });
      await this.client.send(command);
      
      return {
        status: 'healthy',
        details: {
          cacheSize: this.secretsCache.size,
          region: this.client.config.region,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          cacheSize: this.secretsCache.size,
        },
      };
    }
  }
} 