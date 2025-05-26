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
exports.UpdateSessionStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const therapy_session_entity_1 = require("../entities/therapy-session.entity");
class UpdateSessionStatusDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New status for the therapy session',
        enum: therapy_session_entity_1.SessionStatus,
        example: therapy_session_entity_1.SessionStatus.IN_PROGRESS,
    }),
    (0, class_validator_1.IsEnum)(therapy_session_entity_1.SessionStatus),
    __metadata("design:type", String)
], UpdateSessionStatusDto.prototype, "status", void 0);
exports.UpdateSessionStatusDto = UpdateSessionStatusDto;
//# sourceMappingURL=update-session-status.dto.js.map