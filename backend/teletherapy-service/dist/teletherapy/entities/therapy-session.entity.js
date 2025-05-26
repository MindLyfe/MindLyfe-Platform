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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapySession = exports.PaymentStatus = exports.SessionTemplateType = exports.SessionFocus = exports.SessionCategory = exports.SessionType = exports.SessionStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../auth/entities/user.entity");
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["SCHEDULED"] = "scheduled";
    SessionStatus["IN_PROGRESS"] = "in_progress";
    SessionStatus["COMPLETED"] = "completed";
    SessionStatus["CANCELLED"] = "cancelled";
    SessionStatus["NO_SHOW"] = "no_show";
    SessionStatus["WAITING_ROOM"] = "waiting_room";
})(SessionStatus = exports.SessionStatus || (exports.SessionStatus = {}));
var SessionType;
(function (SessionType) {
    SessionType["VIDEO"] = "video";
    SessionType["AUDIO"] = "audio";
    SessionType["CHAT"] = "chat";
    SessionType["GROUP_VIDEO"] = "group_video";
    SessionType["GROUP_AUDIO"] = "group_audio";
    SessionType["GROUP_CHAT"] = "group_chat";
})(SessionType = exports.SessionType || (exports.SessionType = {}));
var SessionCategory;
(function (SessionCategory) {
    SessionCategory["INDIVIDUAL"] = "individual";
    SessionCategory["GROUP"] = "group";
    SessionCategory["WORKSHOP"] = "workshop";
    SessionCategory["SUPPORT_GROUP"] = "support_group";
    SessionCategory["COUPLES"] = "couples";
    SessionCategory["FAMILY"] = "family";
})(SessionCategory = exports.SessionCategory || (exports.SessionCategory = {}));
var SessionFocus;
(function (SessionFocus) {
    SessionFocus["ANXIETY"] = "anxiety";
    SessionFocus["DEPRESSION"] = "depression";
    SessionFocus["TRAUMA"] = "trauma";
    SessionFocus["RELATIONSHIPS"] = "relationships";
    SessionFocus["STRESS"] = "stress";
    SessionFocus["ADDICTION"] = "addiction";
    SessionFocus["GRIEF"] = "grief";
    SessionFocus["MINDFULNESS"] = "mindfulness";
    SessionFocus["OTHER"] = "other";
})(SessionFocus = exports.SessionFocus || (exports.SessionFocus = {}));
var SessionTemplateType;
(function (SessionTemplateType) {
    SessionTemplateType["INDIVIDUAL_THERAPY"] = "individual_therapy";
    SessionTemplateType["GROUP_THERAPY"] = "group_therapy";
    SessionTemplateType["WORKSHOP"] = "workshop";
    SessionTemplateType["SUPPORT_GROUP"] = "support_group";
    SessionTemplateType["COUPLES_THERAPY"] = "couples_therapy";
    SessionTemplateType["FAMILY_THERAPY"] = "family_therapy";
})(SessionTemplateType = exports.SessionTemplateType || (exports.SessionTemplateType = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["PARTIALLY_REFUNDED"] = "partially_refunded";
})(PaymentStatus = exports.PaymentStatus || (exports.PaymentStatus = {}));
let TherapySession = class TherapySession {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TherapySession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TherapySession.prototype, "therapistId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], TherapySession.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', array: true, default: [] }),
    __metadata("design:type", Array)
], TherapySession.prototype, "participantIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], TherapySession.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], TherapySession.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SessionStatus,
        default: SessionStatus.SCHEDULED
    }),
    __metadata("design:type", String)
], TherapySession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SessionType,
        default: SessionType.VIDEO
    }),
    __metadata("design:type", String)
], TherapySession.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SessionCategory,
        default: SessionCategory.INDIVIDUAL
    }),
    __metadata("design:type", String)
], TherapySession.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        array: true,
        enum: SessionFocus,
        default: []
    }),
    __metadata("design:type", Array)
], TherapySession.prototype, "focus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TherapySession.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TherapySession.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TherapySession.prototype, "maxParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TherapySession.prototype, "currentParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TherapySession.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "recurringSchedule", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TherapySession.prototype, "isPrivate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', array: true, default: [] }),
    __metadata("design:type", Array)
], TherapySession.prototype, "invitedEmails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "pricing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "requirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "recording", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "chat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "resources", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "analytics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "calendar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TherapySession.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], TherapySession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], TherapySession.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'therapistId' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], TherapySession.prototype, "therapist", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'clientId' }),
    __metadata("design:type", typeof (_b = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _b : Object)
], TherapySession.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User),
    (0, typeorm_1.JoinTable)({
        name: 'session_participants',
        joinColumn: { name: 'sessionId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], TherapySession.prototype, "participants", void 0);
TherapySession = __decorate([
    (0, typeorm_1.Entity)('therapy_sessions')
], TherapySession);
exports.TherapySession = TherapySession;
//# sourceMappingURL=therapy-session.entity.js.map