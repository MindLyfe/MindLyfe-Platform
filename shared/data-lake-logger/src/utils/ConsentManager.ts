import { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { createLogger, Logger, transports, format as winstonFormat } from 'winston';
import { UserConsent, DataLakeError } from '../types';

export class ConsentManager {
  private dynamoClient: DynamoDBClient;
  private logger: Logger;
  private tableName: string;
  private cache: Map<string, { consent: UserConsent; expiry: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(region: string = process.env.AWS_REGION || 'us-east-1') {
    this.dynamoClient = new DynamoDBClient({ region });
    this.tableName = process.env.CONSENT_TABLE_NAME || 'mindlyf-user-consent';
    
    this.logger = createLogger({
      level: 'info',
      format: winstonFormat.combine(
        winstonFormat.timestamp(),
        winstonFormat.json()
      ),
      transports: [
        new transports.Console(),
      ],
    });
  }

  /**
   * Check if user has given consent for a specific purpose
   */
  async checkConsent(userId: string, purpose: keyof UserConsent): Promise<boolean> {
    try {
      const consent = await this.getUserConsent(userId);
      if (!consent) {
        return false;
      }

      // Map purpose to consent field
      const consentField = this.mapPurposeToConsentField(purpose);
      return consent[consentField] === true;

    } catch (error) {
      this.logger.error(`Failed to check consent for user ${userId}:`, error);
      return false; // Fail closed - no consent assumed
    }
  }

  /**
   * Update user consent
   */
  async updateConsent(
    userId: string, 
    consentData: Partial<UserConsent>,
    metadata: {
      ip_address?: string;
      user_agent?: string;
    } = {}
  ): Promise<void> {
    try {
      const existingConsent = await this.getUserConsent(userId);
      
      const updatedConsent: UserConsent = {
        user_id: userId,
        consent_ai_training: consentData.consent_ai_training ?? existingConsent?.consent_ai_training ?? false,
        consent_data_sale: consentData.consent_data_sale ?? existingConsent?.consent_data_sale ?? false,
        consent_analytics: consentData.consent_analytics ?? existingConsent?.consent_analytics ?? false,
        consent_personalization: consentData.consent_personalization ?? existingConsent?.consent_personalization ?? false,
        consent_research: consentData.consent_research ?? existingConsent?.consent_research ?? false,
        consent_timestamp: new Date().toISOString(),
        consent_version: '1.0',
        ...(metadata.ip_address && { ip_address: metadata.ip_address }),
        ...(metadata.user_agent && { user_agent: metadata.user_agent }),
      };

      // Store in DynamoDB
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(updatedConsent),
      });

      await this.dynamoClient.send(command);

      // Update cache
      this.cache.set(userId, {
        consent: updatedConsent,
        expiry: Date.now() + this.cacheTimeout,
      });

      this.logger.info(`Updated consent for user ${userId}`);

    } catch (error) {
      const dataLakeError: DataLakeError = {
        code: 'CONSENT_UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        service: 'consent-manager',
        timestamp: new Date().toISOString(),
        details: { userId, consentData, metadata },
      };

      this.logger.error('Failed to update user consent', dataLakeError);
      throw error;
    }
  }

  /**
   * Get user consent from cache or database
   */
  async getUserConsent(userId: string): Promise<UserConsent | null> {
    try {
      // Check cache first
      const cached = this.cache.get(userId);
      if (cached && cached.expiry > Date.now()) {
        return cached.consent;
      }

      // Fetch from DynamoDB
      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({ user_id: userId }),
      });

      const response = await this.dynamoClient.send(command);

      if (!response.Item) {
        return null;
      }

      const consent = unmarshall(response.Item) as UserConsent;

      // Update cache
      this.cache.set(userId, {
        consent,
        expiry: Date.now() + this.cacheTimeout,
      });

      return consent;

    } catch (error) {
      this.logger.error(`Failed to get consent for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get all users eligible for AI training
   */
  async getEligibleUsersForAITraining(): Promise<string[]> {
    try {
      const eligibleUsers: string[] = [];
      let lastEvaluatedKey: Record<string, any> | undefined;

      do {
        const command = new QueryCommand({
          TableName: this.tableName,
          IndexName: 'consent_ai_training-index', // Assumes GSI exists
          KeyConditionExpression: 'consent_ai_training = :consent',
          ExpressionAttributeValues: marshall({
            ':consent': true,
          }),
          ExclusiveStartKey: lastEvaluatedKey ? marshall(lastEvaluatedKey) : undefined,
        });

        const response = await this.dynamoClient.send(command);

        if (response.Items) {
          for (const item of response.Items) {
            const consent = unmarshall(item) as UserConsent;
            eligibleUsers.push(consent.user_id);
          }
        }

        lastEvaluatedKey = response.LastEvaluatedKey ? unmarshall(response.LastEvaluatedKey) : undefined;

      } while (lastEvaluatedKey);

      this.logger.info(`Found ${eligibleUsers.length} users eligible for AI training`);
      return eligibleUsers;

    } catch (error) {
      this.logger.error('Failed to get eligible users for AI training:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Revoke all consent for a user (GDPR right to be forgotten)
   */
  async revokeAllConsent(userId: string): Promise<void> {
    try {
      const revokedConsent: UserConsent = {
        user_id: userId,
        consent_ai_training: false,
        consent_data_sale: false,
        consent_analytics: false,
        consent_personalization: false,
        consent_research: false,
        consent_timestamp: new Date().toISOString(),
        consent_version: '1.0',
      };

      await this.updateConsent(userId, revokedConsent);
      
      // Remove from cache
      this.cache.delete(userId);

      this.logger.info(`Revoked all consent for user ${userId}`);

    } catch (error) {
      this.logger.error(`Failed to revoke consent for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get consent audit trail for a user
   */
  async getConsentAuditTrail(userId: string): Promise<UserConsent[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'user_id = :userId',
        ExpressionAttributeValues: marshall({
          ':userId': userId,
        }),
        ScanIndexForward: false, // Most recent first
      });

      const response = await this.dynamoClient.send(command);

      if (!response.Items) {
        return [];
      }

      return response.Items.map((item: any) => unmarshall(item) as UserConsent);

    } catch (error) {
      this.logger.error(`Failed to get consent audit trail for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Generate consent report for compliance
   */
  async generateConsentReport(): Promise<{
    totalUsers: number;
    consentBreakdown: Record<string, number>;
    lastUpdated: string;
  }> {
    try {
      const stats = {
        totalUsers: 0,
        consentBreakdown: {
          ai_training: 0,
          data_sale: 0,
          analytics: 0,
          personalization: 0,
          research: 0,
        },
        lastUpdated: new Date().toISOString(),
      };

      // This would typically use a more efficient approach like DynamoDB Streams
      // or a separate analytics table for large datasets
      let lastEvaluatedKey: Record<string, any> | undefined;

      do {
        const command = new QueryCommand({
          TableName: this.tableName,
          ExclusiveStartKey: lastEvaluatedKey ? marshall(lastEvaluatedKey) : undefined,
        });

        const response = await this.dynamoClient.send(command);

        if (response.Items) {
          for (const item of response.Items) {
            const consent = unmarshall(item) as UserConsent;
            stats.totalUsers++;

            if (consent.consent_ai_training) stats.consentBreakdown.ai_training++;
            if (consent.consent_data_sale) stats.consentBreakdown.data_sale++;
            if (consent.consent_analytics) stats.consentBreakdown.analytics++;
            if (consent.consent_personalization) stats.consentBreakdown.personalization++;
            if (consent.consent_research) stats.consentBreakdown.research++;
          }
        }

        lastEvaluatedKey = response.LastEvaluatedKey ? unmarshall(response.LastEvaluatedKey) : undefined;

      } while (lastEvaluatedKey);

      return stats;

    } catch (error) {
      this.logger.error('Failed to generate consent report:', error);
      throw error;
    }
  }

  /**
   * Map purpose to consent field
   */
  private mapPurposeToConsentField(purpose: string): keyof UserConsent {
    const mapping: Record<string, keyof UserConsent> = {
      'ai_training': 'consent_ai_training',
      'data_sale': 'consent_data_sale',
      'analytics': 'consent_analytics',
      'personalization': 'consent_personalization',
      'research': 'consent_research',
      'consent_ai_training': 'consent_ai_training',
      'consent_data_sale': 'consent_data_sale',
      'consent_analytics': 'consent_analytics',
      'consent_personalization': 'consent_personalization',
      'consent_research': 'consent_research',
    };

    return mapping[purpose] || 'consent_analytics';
  }

  /**
   * Clear consent cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('Consent cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
    };
  }
} 