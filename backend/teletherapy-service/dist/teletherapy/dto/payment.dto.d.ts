import { PaymentStatus } from '../entities/therapy-session.entity';
export declare class PaymentMethodDto {
    provider: 'stripe' | 'paypal' | 'bank_transfer';
    type: 'card' | 'bank_account' | 'paypal_account';
    details: {
        last4?: string;
        brand?: string;
        expiryMonth?: number;
        expiryYear?: number;
        accountNumber?: string;
        routingNumber?: string;
        accountType?: string;
        paypalEmail?: string;
    };
}
export declare class BillingAddressDto {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export declare class PaymentIntentDto {
    sessionId: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethodDto;
    billingAddress: BillingAddressDto;
    customerEmail: string;
    description: string;
    metadata?: Record<string, any>;
}
export declare class DiscountDto {
    code: string;
    amount: number;
    type: 'percentage' | 'fixed';
    minimumAmount?: number;
    maximumAmount?: number;
    expiresAt?: Date;
}
export declare class InvoiceDto {
    invoiceNumber: string;
    sessionId: string;
    customerId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    dueDate: Date;
    items: InvoiceItemDto[];
    discounts?: DiscountDto[];
    billingAddress: BillingAddressDto;
    notes?: string;
}
export declare class InvoiceItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
}
export declare class RefundDto {
    paymentIntentId: string;
    amount?: number;
    reason: string;
    refundToOriginalMethod?: boolean;
    metadata?: Record<string, any>;
}
export declare class PaymentWebhookDto {
    type: string;
    data: Record<string, any>;
    signature: string;
    timestamp: Date;
}
