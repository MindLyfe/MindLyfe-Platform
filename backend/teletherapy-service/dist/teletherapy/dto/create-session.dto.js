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
exports.CreateSessionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const therapy_session_entity_1 = require("../entities/therapy-session.entity");
class RecurringScheduleDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Frequency of recurring sessions',
        enum: ['weekly', 'biweekly', 'monthly'],
        example: 'weekly',
    }),
    (0, class_validator_1.IsEnum)(['weekly', 'biweekly', 'monthly']),
    __metadata("design:type", String)
], RecurringScheduleDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date for recurring sessions',
        example: '2024-12-31T23:59:59Z',
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], RecurringScheduleDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum number of occurrences',
        example: 12,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RecurringScheduleDto.prototype, "maxOccurrences", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dates to skip in the recurring schedule',
        type: [Date],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsDate)({ each: true }),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Array)
], RecurringScheduleDto.prototype, "skipDates", void 0);
class PricingDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Session price amount',
        example: 99.99,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PricingDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'USD',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], PricingDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the price is per participant',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PricingDto.prototype, "perParticipant", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Discount code for the session',
        example: 'EARLYBIRD2024',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PricingDto.prototype, "discountCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Early bird price',
        example: 79.99,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PricingDto.prototype, "earlyBirdPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Early bird price end date',
        example: '2024-03-31T23:59:59Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], PricingDto.prototype, "earlyBirdEndDate", void 0);
class RequirementsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum age requirement',
        example: 18,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RequirementsDto.prototype, "minAge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum age requirement',
        example: 65,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RequirementsDto.prototype, "maxAge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Prerequisites for attending the session',
        example: ['Previous therapy experience', 'Completed intake form'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RequirementsDto.prototype, "prerequisites", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Required documents for the session',
        example: ['Consent form', 'Medical history'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RequirementsDto.prototype, "requiredDocuments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether consent is required',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RequirementsDto.prototype, "consentRequired", void 0);
class CreateSessionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the therapist conducting the session',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "therapistId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the primary client (for individual sessions)',
        example: '123e4567-e89b-12d3-a456-426614174001',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'IDs of participants (for group sessions)',
        type: [String],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateSessionDto.prototype, "participantIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time of the session',
        example: '2024-03-20T14:00:00Z',
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], CreateSessionDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time of the session',
        example: '2024-03-20T15:00:00Z',
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], CreateSessionDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of therapy session',
        enum: therapy_session_entity_1.SessionType,
        example: therapy_session_entity_1.SessionType.GROUP_VIDEO,
    }),
    (0, class_validator_1.IsEnum)(therapy_session_entity_1.SessionType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category of the session',
        enum: therapy_session_entity_1.SessionCategory,
        example: therapy_session_entity_1.SessionCategory.GROUP,
    }),
    (0, class_validator_1.IsEnum)(therapy_session_entity_1.SessionCategory),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Focus areas of the session',
        enum: therapy_session_entity_1.SessionFocus,
        isArray: true,
        example: [therapy_session_entity_1.SessionFocus.ANXIETY, therapy_session_entity_1.SessionFocus.MINDFULNESS],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(therapy_session_entity_1.SessionFocus, { each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(5),
    __metadata("design:type", Array)
], CreateSessionDto.prototype, "focus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Title or topic of the session',
        example: 'Group Mindfulness Workshop',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the session',
        example: 'A group workshop focused on mindfulness techniques for stress management',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum number of participants allowed',
        example: 10,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSessionDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this is a recurring session',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSessionDto.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Schedule for recurring sessions',
        type: RecurringScheduleDto,
        required: false,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RecurringScheduleDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", RecurringScheduleDto)
], CreateSessionDto.prototype, "recurringSchedule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the session is private (invitation only)',
        example: true,
        default: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSessionDto.prototype, "isPrivate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email addresses of invited participants',
        type: [String],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEmail)({}, { each: true }),
    __metadata("design:type", Array)
], CreateSessionDto.prototype, "invitedEmails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pricing information for the session',
        type: PricingDto,
        required: false,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PricingDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", PricingDto)
], CreateSessionDto.prototype, "pricing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Requirements for attending the session',
        type: RequirementsDto,
        required: false,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RequirementsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", RequirementsDto)
], CreateSessionDto.prototype, "requirements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional metadata for the session',
        example: {
            meetingLink: 'https://zoom.us/j/123456789',
            waitingRoomEnabled: true,
            chatEnabled: true,
            recordingEnabled: false,
        },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSessionDto.prototype, "metadata", void 0);
exports.CreateSessionDto = CreateSessionDto;
//# sourceMappingURL=create-session.dto.js.map