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
exports.MediaSession = exports.MediaSessionStatus = exports.MediaSessionType = void 0;
const typeorm_1 = require("typeorm");
var MediaSessionType;
(function (MediaSessionType) {
    MediaSessionType["TELETHERAPY"] = "teletherapy";
    MediaSessionType["CHAT"] = "chat";
})(MediaSessionType = exports.MediaSessionType || (exports.MediaSessionType = {}));
var MediaSessionStatus;
(function (MediaSessionStatus) {
    MediaSessionStatus["PENDING"] = "pending";
    MediaSessionStatus["ACTIVE"] = "active";
    MediaSessionStatus["ENDED"] = "ended";
})(MediaSessionStatus = exports.MediaSessionStatus || (exports.MediaSessionStatus = {}));
let MediaSession = class MediaSession {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MediaSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MediaSessionType }),
    __metadata("design:type", String)
], MediaSession.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MediaSession.prototype, "contextId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', default: [] }),
    __metadata("design:type", Array)
], MediaSession.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MediaSessionStatus, default: MediaSessionStatus.PENDING }),
    __metadata("design:type", String)
], MediaSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MediaSession.prototype, "startedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MediaSession.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MediaSession.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MediaSession.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MediaSession.prototype, "metadata", void 0);
MediaSession = __decorate([
    (0, typeorm_1.Entity)('media_sessions')
], MediaSession);
exports.MediaSession = MediaSession;
//# sourceMappingURL=media-session.entity.js.map