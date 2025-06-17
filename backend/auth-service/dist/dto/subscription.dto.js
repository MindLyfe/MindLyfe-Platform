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
exports.SubscriptionPlanResponseDto = exports.SubscriptionStatusResponseDto = exports.PurchaseCreditsRequestDto = exports.CreateSubscriptionRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const subscription_entity_1 = require("../entities/subscription.entity");
const payment_entity_1 = require("../entities/payment.entity");
class CreateSubscriptionRequestDto {
    type;
    paymentMethod;
    phoneNumber;
}
exports.CreateSubscriptionRequestDto = CreateSubscriptionRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: subscription_entity_1.SubscriptionType,
        description: 'Type of subscription',
        example: subscription_entity_1.SubscriptionType.MONTHLY
    }),
    (0, class_validator_1.IsEnum)(subscription_entity_1.SubscriptionType),
    __metadata("design:type", String)
], CreateSubscriptionRequestDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: payment_entity_1.PaymentMethod,
        description: 'Payment method',
        example: payment_entity_1.PaymentMethod.MOBILE_MONEY
    }),
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentMethod),
    __metadata("design:type", String)
], CreateSubscriptionRequestDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number for mobile money payments',
        example: '+256700000000',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)('UG'),
    __metadata("design:type", String)
], CreateSubscriptionRequestDto.prototype, "phoneNumber", void 0);
class PurchaseCreditsRequestDto {
    credits;
    paymentMethod;
    phoneNumber;
}
exports.PurchaseCreditsRequestDto = PurchaseCreditsRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of session credits to purchase',
        example: 2,
        minimum: 1,
        maximum: 20
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], PurchaseCreditsRequestDto.prototype, "credits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: payment_entity_1.PaymentMethod,
        description: 'Payment method',
        example: payment_entity_1.PaymentMethod.MOBILE_MONEY
    }),
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentMethod),
    __metadata("design:type", String)
], PurchaseCreditsRequestDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number for mobile money payments',
        example: '+256700000000',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)('UG'),
    __metadata("design:type", String)
], PurchaseCreditsRequestDto.prototype, "phoneNumber", void 0);
class SubscriptionStatusResponseDto {
    hasActiveSubscription;
    totalAvailableSessions;
    canBookSession;
    nextAvailableBookingDate;
    subscriptions;
}
exports.SubscriptionStatusResponseDto = SubscriptionStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether user has active subscription' }),
    __metadata("design:type", Boolean)
], SubscriptionStatusResponseDto.prototype, "hasActiveSubscription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total available sessions from all subscriptions' }),
    __metadata("design:type", Number)
], SubscriptionStatusResponseDto.prototype, "totalAvailableSessions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether user can book a session now' }),
    __metadata("design:type", Boolean)
], SubscriptionStatusResponseDto.prototype, "canBookSession", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Next available booking date if weekly limit reached',
        required: false
    }),
    __metadata("design:type", Date)
], SubscriptionStatusResponseDto.prototype, "nextAvailableBookingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of active subscriptions' }),
    __metadata("design:type", Array)
], SubscriptionStatusResponseDto.prototype, "subscriptions", void 0);
class SubscriptionPlanResponseDto {
    type;
    name;
    price;
    sessions;
    duration;
    description;
}
exports.SubscriptionPlanResponseDto = SubscriptionPlanResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: subscription_entity_1.SubscriptionType }),
    __metadata("design:type", String)
], SubscriptionPlanResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Plan name' }),
    __metadata("design:type", String)
], SubscriptionPlanResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price in UGX' }),
    __metadata("design:type", Number)
], SubscriptionPlanResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of sessions included' }),
    __metadata("design:type", Number)
], SubscriptionPlanResponseDto.prototype, "sessions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration in days' }),
    __metadata("design:type", Number)
], SubscriptionPlanResponseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Plan description' }),
    __metadata("design:type", String)
], SubscriptionPlanResponseDto.prototype, "description", void 0);
//# sourceMappingURL=subscription.dto.js.map