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
exports.TherapySession = exports.SessionType = exports.SessionStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const subscription_entity_1 = require("./subscription.entity");
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["SCHEDULED"] = "scheduled";
    SessionStatus["IN_PROGRESS"] = "in_progress";
    SessionStatus["COMPLETED"] = "completed";
    SessionStatus["CANCELLED"] = "cancelled";
    SessionStatus["NO_SHOW"] = "no_show";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
var SessionType;
(function (SessionType) {
    SessionType["INDIVIDUAL"] = "individual";
    SessionType["GROUP"] = "group";
    SessionType["EMERGENCY"] = "emergency";
})(SessionType || (exports.SessionType = SessionType = {}));
let TherapySession = class TherapySession {
    id;
    userId;
    user;
    therapistId;
    therapist;
    subscriptionId;
    subscription;
    status;
    type;
    scheduledAt;
    startedAt;
    endedAt;
    durationMinutes;
    cost;
    paidFromCredit;
    paidFromSubscription;
    paymentReference;
    notes;
    cancellationReason;
    meetingLink;
    meetingId;
    createdAt;
    updatedAt;
    get isCompleted() {
        return this.status === SessionStatus.COMPLETED;
    }
    get canCancel() {
        if (this.status === SessionStatus.COMPLETED || this.status === SessionStatus.CANCELLED) {
            return false;
        }
        const twentyFourHoursFromNow = new Date();
        twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);
        return this.scheduledAt > twentyFourHoursFromNow;
    }
    get actualDuration() {
        if (!this.startedAt || !this.endedAt)
            return null;
        return Math.round((this.endedAt.getTime() - this.startedAt.getTime()) / (1000 * 60));
    }
};
exports.TherapySession = TherapySession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TherapySession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TherapySession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.therapySessions),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], TherapySession.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TherapySession.prototype, "therapistId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'therapistId' }),
    __metadata("design:type", user_entity_1.User)
], TherapySession.prototype, "therapist", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TherapySession.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_entity_1.Subscription),
    (0, typeorm_1.JoinColumn)({ name: 'subscriptionId' }),
    __metadata("design:type", subscription_entity_1.Subscription)
], TherapySession.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SessionStatus, default: SessionStatus.SCHEDULED }),
    __metadata("design:type", String)
], TherapySession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SessionType, default: SessionType.INDIVIDUAL }),
    __metadata("design:type", String)
], TherapySession.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TherapySession.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TherapySession.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TherapySession.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 60 }),
    __metadata("design:type", Number)
], TherapySession.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 76000 }),
    __metadata("design:type", Number)
], TherapySession.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TherapySession.prototype, "paidFromCredit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TherapySession.prototype, "paidFromSubscription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TherapySession.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TherapySession.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TherapySession.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TherapySession.prototype, "meetingLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TherapySession.prototype, "meetingId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TherapySession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TherapySession.prototype, "updatedAt", void 0);
exports.TherapySession = TherapySession = __decorate([
    (0, typeorm_1.Entity)()
], TherapySession);
//# sourceMappingURL=therapy-session.entity.js.map