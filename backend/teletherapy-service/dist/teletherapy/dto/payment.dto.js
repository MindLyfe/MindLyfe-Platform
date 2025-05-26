"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookDto = exports.RefundDto = exports.InvoiceItemDto = exports.InvoiceDto = exports.DiscountDto = exports.PaymentIntentDto = exports.BillingAddressDto = exports.PaymentMethodDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const therapy_session_entity_1 = require("../entities/therapy-session.entity");
class PaymentMethodDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment provider', enum: ['stripe', 'paypal', 'bank_transfer'] }),
    (0, class_validator_1.IsEnum)(['stripe', 'paypal', 'bank_transfer']),
    __metadata("design:type", String)
], PaymentMethodDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method type', enum: ['card', 'bank_account', 'paypal_account'] }),
    (0, class_validator_1.IsEnum)(['card', 'bank_account', 'paypal_account']),
    __metadata("design:type", String)
], PaymentMethodDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method details' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PaymentMethodDto.prototype, "details", void 0);
exports.PaymentMethodDto = PaymentMethodDto;
class BillingAddressDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Street address' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BillingAddressDto.prototype, "street", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'City' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BillingAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State/Province' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BillingAddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Postal code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BillingAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BillingAddressDto.prototype, "country", void 0);
exports.BillingAddressDto = BillingAddressDto;
class PaymentIntentDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PaymentIntentDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount in smallest currency unit (e.g., cents)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentIntentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code', example: 'USD' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentIntentDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method', type: PaymentMethodDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PaymentMethodDto),
    __metadata("design:type", PaymentMethodDto)
], PaymentIntentDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing address', type: BillingAddressDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BillingAddressDto),
    __metadata("design:type", BillingAddressDto)
], PaymentIntentDto.prototype, "billingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer email' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], PaymentIntentDto.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of the payment' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentIntentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Metadata for the payment', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PaymentIntentDto.prototype, "metadata", void 0);
exports.PaymentIntentDto = PaymentIntentDto;
class DiscountDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DiscountDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DiscountDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount type', enum: ['percentage', 'fixed'] }),
    (0, class_validator_1.IsEnum)(['percentage', 'fixed']),
    __metadata("design:type", String)
], DiscountDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum purchase amount for discount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DiscountDto.prototype, "minimumAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum discount amount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DiscountDto.prototype, "maximumAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], DiscountDto.prototype, "expiresAt", void 0);
exports.DiscountDto = DiscountDto;
class InvoiceDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invoice number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], InvoiceDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], InvoiceDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount in smallest currency unit' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment status', enum: therapy_session_entity_1.PaymentStatus }),
    (0, class_validator_1.IsEnum)(therapy_session_entity_1.PaymentStatus),
    __metadata("design:type", String)
], InvoiceDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Due date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], InvoiceDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items in the invoice' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InvoiceItemDto),
    __metadata("design:type", Array)
], InvoiceDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Applied discounts', type: [DiscountDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DiscountDto),
    __metadata("design:type", Array)
], InvoiceDto.prototype, "discounts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing address', type: BillingAddressDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BillingAddressDto),
    __metadata("design:type", BillingAddressDto)
], InvoiceDto.prototype, "billingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceDto.prototype, "notes", void 0);
exports.InvoiceDto = InvoiceDto;
class InvoiceItemDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item description' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price in smallest currency unit' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tax rate percentage', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "taxRate", void 0);
exports.InvoiceItemDto = InvoiceItemDto;
class RefundDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment intent ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundDto.prototype, "paymentIntentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount to refund in smallest currency unit', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RefundDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for refund' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to refund to original payment method', default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], RefundDto.prototype, "refundToOriginalMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Metadata for the refund', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RefundDto.prototype, "metadata", void 0);
exports.RefundDto = RefundDto;
class PaymentWebhookDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event data' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PaymentWebhookDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Webhook signature' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of the event' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], PaymentWebhookDto.prototype, "timestamp", void 0);
exports.PaymentWebhookDto = PaymentWebhookDto;
//# sourceMappingURL=payment.dto.js.map