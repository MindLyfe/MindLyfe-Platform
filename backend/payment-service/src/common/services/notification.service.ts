import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface PaymentNotificationPayload {
  type: string;
  recipientId: string;
  channels: string[];
  variables: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export enum PaymentNotificationType {
  // Payment transaction notifications
  PAYMENT_CREATED = 'payment_created',
  PAYMENT_PROCESSING = 'payment_processing',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_CANCELLED = 'payment_cancelled',
  PAYMENT_REFUND_REQUESTED = 'payment_refund_requested',
  PAYMENT_REFUNDED = 'payment_refunded',
  PAYMENT_DISPUTED = 'payment_disputed',
  
  // Subscription notifications
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_ACTIVATED = 'subscription_activated',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  SUBSCRIPTION_PAYMENT_FAILED = 'subscription_payment_failed',
  SUBSCRIPTION_TRIAL_ENDING = 'subscription_trial_ending',
  SUBSCRIPTION_TRIAL_ENDED = 'subscription_trial_ended',
  
  // Billing and invoice notifications
  INVOICE_CREATED = 'invoice_created',
  INVOICE_PAID = 'invoice_paid',
  INVOICE_OVERDUE = 'invoice_overdue',
  INVOICE_PAYMENT_FAILED = 'invoice_payment_failed',
  
  // Credits and wallet notifications
  CREDITS_PURCHASED = 'credits_purchased',
  CREDITS_CONSUMED = 'credits_consumed',
  CREDITS_EXPIRING = 'credits_expiring',
  CREDITS_EXPIRED = 'credits_expired',
  CREDITS_REFUNDED = 'credits_refunded',
  LOW_CREDIT_BALANCE = 'low_credit_balance',
  
  // Security and fraud notifications
  SUSPICIOUS_PAYMENT_DETECTED = 'suspicious_payment_detected',
  PAYMENT_METHOD_UPDATED = 'payment_method_updated',
  PAYMENT_METHOD_EXPIRED = 'payment_method_expired',
  PAYMENT_METHOD_FAILED = 'payment_method_failed',
  MULTIPLE_FAILED_PAYMENTS = 'multiple_failed_payments',
  
  // Promotional and billing cycle notifications
  DISCOUNT_APPLIED = 'discount_applied',
  PROMO_CODE_USED = 'promo_code_used',
  BILLING_CYCLE_REMINDER = 'billing_cycle_reminder',
  PRICE_CHANGE_NOTIFICATION = 'price_change_notification',
  
  // Admin and compliance notifications
  PAYMENT_GATEWAY_ERROR = 'payment_gateway_error',
  COMPLIANCE_REPORT_GENERATED = 'compliance_report_generated',
  REVENUE_MILESTONE = 'revenue_milestone'
}

@Injectable()
export class PaymentNotificationService {
  private readonly logger = new Logger(PaymentNotificationService.name);
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationServiceUrl = this.configService.get<string>(
      'services.notificationServiceUrl',
      'http://notification-service:3005'
    );
  }

  /**
   * Send notification to notification service
   */
  async sendNotification(notification: PaymentNotificationPayload): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.notificationServiceUrl}/api/notification`,
          {
            ...notification,
            timestamp: new Date(),
            serviceSource: 'payment-service'
          },
          {
            headers: {
              'X-Service-Name': 'payment-service',
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        )
      );

      this.logger.log(`Payment notification sent: ${notification.type} to user ${notification.recipientId}`);
    } catch (error) {
      this.logger.error(`Failed to send payment notification: ${error.message}`, error.stack);
      // Don't throw - notifications are non-critical for payment functionality
    }
  }

  /**
   * Notify about payment creation
   */
  async notifyPaymentCreated(
    userId: string,
    paymentId: string,
    amount: number,
    currency: string,
    gateway: string,
    paymentUrl?: string
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.PAYMENT_CREATED,
      recipientId: userId,
      channels: ['in_app'],
      variables: {
        paymentId,
        amount,
        currency,
        gateway,
        paymentUrl: paymentUrl || '',
        createdAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about successful payment
   */
  async notifyPaymentSuccess(
    userId: string,
    paymentId: string,
    amount: number,
    currency: string,
    gateway: string,
    transactionId: string,
    serviceType: string
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.PAYMENT_SUCCESS,
      recipientId: userId,
      channels: ['email', 'in_app', 'push'],
      variables: {
        paymentId,
        amount,
        currency,
        gateway,
        transactionId,
        serviceType,
        completedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about failed payment
   */
  async notifyPaymentFailed(
    userId: string,
    paymentId: string,
    amount: number,
    currency: string,
    reason: string,
    gateway: string,
    retryPossible: boolean = true
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.PAYMENT_FAILED,
      recipientId: userId,
      channels: ['email', 'in_app', 'push'],
      variables: {
        paymentId,
        amount,
        currency,
        reason,
        gateway,
        retryPossible,
        failedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about payment refund
   */
  async notifyPaymentRefunded(
    userId: string,
    paymentId: string,
    refundId: string,
    amount: number,
    currency: string,
    reason: string,
    processingDays: number = 5
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.PAYMENT_REFUNDED,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        paymentId,
        refundId,
        amount,
        currency,
        reason,
        processingDays,
        refundedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about subscription creation
   */
  async notifySubscriptionCreated(
    userId: string,
    subscriptionId: string,
    planName: string,
    amount: number,
    currency: string,
    billingCycle: string,
    nextBillingDate: Date,
    trialDays?: number
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.SUBSCRIPTION_CREATED,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        subscriptionId,
        planName,
        amount,
        currency,
        billingCycle,
        nextBillingDate,
        trialDays: trialDays || 0,
        hasTrialPeriod: (trialDays || 0) > 0,
        createdAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about subscription renewal
   */
  async notifySubscriptionRenewed(
    userId: string,
    subscriptionId: string,
    planName: string,
    amount: number,
    currency: string,
    nextBillingDate: Date,
    renewalNumber: number
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.SUBSCRIPTION_RENEWED,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        subscriptionId,
        planName,
        amount,
        currency,
        nextBillingDate,
        renewalNumber,
        renewedAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Notify about subscription cancellation
   */
  async notifySubscriptionCancelled(
    userId: string,
    subscriptionId: string,
    planName: string,
    cancelledBy: 'user' | 'admin' | 'system',
    reason: string,
    effectiveDate: Date,
    remainingDays: number
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.SUBSCRIPTION_CANCELLED,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        subscriptionId,
        planName,
        cancelledBy,
        reason,
        effectiveDate,
        remainingDays,
        cancelledAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about subscription payment failure
   */
  async notifySubscriptionPaymentFailed(
    userId: string,
    subscriptionId: string,
    planName: string,
    amount: number,
    currency: string,
    reason: string,
    retryDate: Date,
    attemptsRemaining: number
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.SUBSCRIPTION_PAYMENT_FAILED,
      recipientId: userId,
      channels: ['email', 'in_app', 'push'],
      variables: {
        subscriptionId,
        planName,
        amount,
        currency,
        reason,
        retryDate,
        attemptsRemaining,
        failedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about trial period ending soon
   */
  async notifyTrialEnding(
    userId: string,
    subscriptionId: string,
    planName: string,
    trialEndDate: Date,
    daysRemaining: number,
    upgradeAmount: number,
    currency: string
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.SUBSCRIPTION_TRIAL_ENDING,
      recipientId: userId,
      channels: ['email', 'in_app', 'push'],
      variables: {
        subscriptionId,
        planName,
        trialEndDate,
        daysRemaining,
        upgradeAmount,
        currency,
        checkedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about credits purchase
   */
  async notifyCreditsPurchased(
    userId: string,
    paymentId: string,
    creditsAmount: number,
    costAmount: number,
    currency: string,
    bonusCredits: number = 0
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.CREDITS_PURCHASED,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        paymentId,
        creditsAmount,
        costAmount,
        currency,
        bonusCredits,
        totalCredits: creditsAmount + bonusCredits,
        purchasedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about low credit balance
   */
  async notifyLowCreditBalance(
    userId: string,
    currentBalance: number,
    threshold: number,
    recommendedTopUp: number,
    currency: string
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.LOW_CREDIT_BALANCE,
      recipientId: userId,
      channels: ['in_app', 'push'],
      variables: {
        currentBalance,
        threshold,
        recommendedTopUp,
        currency,
        checkedAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Notify about credits expiring soon
   */
  async notifyCreditsExpiring(
    userId: string,
    expiringCredits: number,
    expiryDate: Date,
    daysUntilExpiry: number
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.CREDITS_EXPIRING,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        expiringCredits,
        expiryDate,
        daysUntilExpiry,
        checkedAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Notify about suspicious payment activity
   */
  async notifySuspiciousPayment(
    userId: string,
    paymentId: string,
    suspicionReason: string,
    riskScore: number,
    adminIds: string[]
  ): Promise<void> {
    // Notify user
    await this.sendNotification({
      type: PaymentNotificationType.SUSPICIOUS_PAYMENT_DETECTED,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        paymentId,
        suspicionReason,
        detectedAt: new Date()
      },
      priority: 'high'
    });

    // Notify admins
    for (const adminId of adminIds) {
      await this.sendNotification({
        type: PaymentNotificationType.SUSPICIOUS_PAYMENT_DETECTED,
        recipientId: adminId,
        channels: ['email', 'in_app'],
        variables: {
          userId,
          paymentId,
          suspicionReason,
          riskScore,
          detectedAt: new Date()
        },
        priority: 'high'
      });
    }
  }

  /**
   * Notify about multiple failed payment attempts
   */
  async notifyMultipleFailedPayments(
    userId: string,
    failedAttempts: number,
    timeWindow: string,
    lastFailureReason: string,
    accountLocked: boolean = false
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.MULTIPLE_FAILED_PAYMENTS,
      recipientId: userId,
      channels: ['email', 'in_app', 'push'],
      variables: {
        failedAttempts,
        timeWindow,
        lastFailureReason,
        accountLocked,
        detectedAt: new Date()
      },
      priority: 'high'
    });
  }

  /**
   * Notify about payment method updates
   */
  async notifyPaymentMethodUpdated(
    userId: string,
    paymentMethodType: string,
    last4Digits: string,
    updateType: 'added' | 'updated' | 'removed'
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.PAYMENT_METHOD_UPDATED,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        paymentMethodType,
        last4Digits,
        updateType,
        updatedAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Notify about upcoming billing cycle
   */
  async notifyBillingCycleReminder(
    userId: string,
    subscriptionId: string,
    planName: string,
    amount: number,
    currency: string,
    billingDate: Date,
    daysUntilBilling: number
  ): Promise<void> {
    await this.sendNotification({
      type: PaymentNotificationType.BILLING_CYCLE_REMINDER,
      recipientId: userId,
      channels: ['email', 'in_app'],
      variables: {
        subscriptionId,
        planName,
        amount,
        currency,
        billingDate,
        daysUntilBilling,
        reminderSentAt: new Date()
      },
      priority: 'normal'
    });
  }

  /**
   * Schedule billing reminder notifications
   */
  async scheduleBillingReminders(
    userId: string,
    subscriptionId: string,
    planName: string,
    amount: number,
    currency: string,
    billingDate: Date
  ): Promise<void> {
    const billingDateTime = new Date(billingDate);

    // 7 days before billing
    const reminder7Days = new Date(billingDateTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (reminder7Days > new Date()) {
      await this.sendNotification({
        type: PaymentNotificationType.BILLING_CYCLE_REMINDER,
        recipientId: userId,
        scheduledFor: reminder7Days,
        channels: ['email'],
        variables: {
          subscriptionId,
          planName,
          amount,
          currency,
          billingDate: billingDateTime,
          daysUntilBilling: 7,
          reminderType: '7-day'
        },
        priority: 'normal'
      });
    }

    // 1 day before billing
    const reminder1Day = new Date(billingDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (reminder1Day > new Date()) {
      await this.sendNotification({
        type: PaymentNotificationType.BILLING_CYCLE_REMINDER,
        recipientId: userId,
        scheduledFor: reminder1Day,
        channels: ['email', 'push'],
        variables: {
          subscriptionId,
          planName,
          amount,
          currency,
          billingDate: billingDateTime,
          daysUntilBilling: 1,
          reminderType: '1-day'
        },
        priority: 'high'
      });
    }
  }
} 