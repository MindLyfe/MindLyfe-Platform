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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recording = exports.RecordingResolution = exports.RecordingFormat = exports.RecordingQuality = exports.RecordingStatus = void 0;
const typeorm_1 = require("typeorm");
const therapy_session_entity_1 = require("./therapy-session.entity");
const user_entity_1 = require("../../auth/entities/user.entity");
var RecordingStatus;
(function (RecordingStatus) {
    RecordingStatus["PENDING"] = "pending";
    RecordingStatus["RECORDING"] = "recording";
    RecordingStatus["PROCESSING"] = "processing";
    RecordingStatus["COMPLETED"] = "completed";
    RecordingStatus["FAILED"] = "failed";
})(RecordingStatus = exports.RecordingStatus || (exports.RecordingStatus = {}));
var RecordingQuality;
(function (RecordingQuality) {
    RecordingQuality["HIGH"] = "high";
    RecordingQuality["MEDIUM"] = "medium";
    RecordingQuality["LOW"] = "low";
})(RecordingQuality = exports.RecordingQuality || (exports.RecordingQuality = {}));
var RecordingFormat;
(function (RecordingFormat) {
    RecordingFormat["MP4"] = "mp4";
    RecordingFormat["WEBM"] = "webm";
})(RecordingFormat = exports.RecordingFormat || (exports.RecordingFormat = {}));
var RecordingResolution;
(function (RecordingResolution) {
    RecordingResolution["P1080"] = "1080p";
    RecordingResolution["P720"] = "720p";
    RecordingResolution["P480"] = "480p";
})(RecordingResolution = exports.RecordingResolution || (exports.RecordingResolution = {}));
let Recording = class Recording {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Recording.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recording.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => therapy_session_entity_1.TherapySession),
    (0, typeorm_1.JoinColumn)({ name: 'sessionId' }),
    __metadata("design:type", therapy_session_entity_1.TherapySession)
], Recording.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recording.prototype, "startedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'startedBy' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], Recording.prototype, "starter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RecordingStatus,
        default: RecordingStatus.PENDING,
    }),
    __metadata("design:type", String)
], Recording.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RecordingQuality,
        default: RecordingQuality.MEDIUM,
    }),
    __metadata("design:type", String)
], Recording.prototype, "quality", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RecordingFormat,
        default: RecordingFormat.MP4,
    }),
    __metadata("design:type", String)
], Recording.prototype, "format", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RecordingResolution,
        default: RecordingResolution.P720,
    }),
    __metadata("design:type", String)
], Recording.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Recording.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Recording.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Recording.prototype, "storageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Recording.prototype, "storageKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Recording.prototype, "streams", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Recording.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Recording.prototype, "analytics", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Recording.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Recording.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Recording.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Recording.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Recording.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Recording.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Recording.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Recording.prototype, "isEncrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Recording.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Recording.prototype, "deletedAt", void 0);
Recording = __decorate([
    (0, typeorm_1.Entity)('recordings')
], Recording);
exports.Recording = Recording;
//# sourceMappingURL=recording.entity.js.map