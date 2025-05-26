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
exports.RemoveReactionDto = exports.AddReactionDto = void 0;
const class_validator_1 = require("class-validator");
const reaction_entity_1 = require("../entities/reaction.entity");
class AddReactionDto {
}
exports.AddReactionDto = AddReactionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddReactionDto.prototype, "postId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddReactionDto.prototype, "commentId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(reaction_entity_1.ReactionType),
    __metadata("design:type", String)
], AddReactionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AddReactionDto.prototype, "isAnonymous", void 0);
class RemoveReactionDto {
}
exports.RemoveReactionDto = RemoveReactionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RemoveReactionDto.prototype, "postId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RemoveReactionDto.prototype, "commentId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(reaction_entity_1.ReactionType),
    __metadata("design:type", String)
], RemoveReactionDto.prototype, "type", void 0);
//# sourceMappingURL=index.js.map