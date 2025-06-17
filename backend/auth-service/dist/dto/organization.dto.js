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
exports.OrganizationDetailsResponseDto = exports.AddUserToOrganizationRequestDto = exports.OrganizationSubscriptionRequestDto = exports.CreateOrganizationRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const payment_entity_1 = require("../entities/payment.entity");
class CreateOrganizationRequestDto {
    name;
    email;
    phoneNumber;
    address;
    maxUsers;
}
exports.CreateOrganizationRequestDto = CreateOrganizationRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Organization name',
        example: 'Acme Corporation'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationRequestDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Organization email',
        example: 'admin@acme.com'
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateOrganizationRequestDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Organization phone number',
        example: '+256700000000',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)('UG'),
    __metadata("design:type", String)
], CreateOrganizationRequestDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Organization address',
        example: 'Kampala, Uganda',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationRequestDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum number of users allowed',
        example: 50,
        minimum: 1,
        maximum: 1000
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], CreateOrganizationRequestDto.prototype, "maxUsers", void 0);
class OrganizationSubscriptionRequestDto {
    paymentMethod;
    phoneNumber;
}
exports.OrganizationSubscriptionRequestDto = OrganizationSubscriptionRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: payment_entity_1.PaymentMethod,
        description: 'Payment method',
        example: payment_entity_1.PaymentMethod.BANK_TRANSFER
    }),
    __metadata("design:type", String)
], OrganizationSubscriptionRequestDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number for mobile money payments',
        example: '+256700000000',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)('UG'),
    __metadata("design:type", String)
], OrganizationSubscriptionRequestDto.prototype, "phoneNumber", void 0);
class AddUserToOrganizationRequestDto {
    userEmail;
}
exports.AddUserToOrganizationRequestDto = AddUserToOrganizationRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email of user to add to organization',
        example: 'user@example.com'
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AddUserToOrganizationRequestDto.prototype, "userEmail", void 0);
class OrganizationDetailsResponseDto {
    organization;
    users;
    subscriptionStatus;
}
exports.OrganizationDetailsResponseDto = OrganizationDetailsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Organization information' }),
    __metadata("design:type", Object)
], OrganizationDetailsResponseDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of organization users' }),
    __metadata("design:type", Array)
], OrganizationDetailsResponseDto.prototype, "users", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subscription status information' }),
    __metadata("design:type", Object)
], OrganizationDetailsResponseDto.prototype, "subscriptionStatus", void 0);
//# sourceMappingURL=organization.dto.js.map