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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const auth_client_1 = require("@mindlyf/shared/auth-client");
let UsersService = class UsersService {
    constructor(userRepo, authClient) {
        this.userRepo = userRepo;
        this.authClient = authClient;
    }
    async getMe(user) {
        const found = await this.userRepo.findOne({ where: { id: user.id } });
        if (!found)
            throw new common_1.NotFoundException('User not found');
        delete found.password;
        delete found.email;
        return found;
    }
    async updateMe(dto, user) {
        const found = await this.userRepo.findOne({ where: { id: user.id } });
        if (!found)
            throw new common_1.NotFoundException('User not found');
        Object.assign(found, dto);
        await this.userRepo.save(found);
        return found;
    }
    async requestTherapistVerification(dto, user) {
        const found = await this.userRepo.findOne({ where: { id: user.id } });
        if (!found)
            throw new common_1.NotFoundException('User not found');
        found.therapistVerificationRequest = dto;
        found.therapistVerificationStatus = 'pending';
        await this.userRepo.save(found);
        return { success: true };
    }
    async verifyTherapist(id, dto, user) {
        if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
            throw new common_1.ForbiddenException('Only admin or moderator can verify therapists');
        }
        const found = await this.userRepo.findOne({ where: { id } });
        if (!found)
            throw new common_1.NotFoundException('User not found');
        found.isTherapist = dto.isVerified;
        found.therapistVerificationStatus = dto.isVerified ? 'approved' : 'rejected';
        found.therapistVerificationNotes = dto.notes;
        await this.userRepo.save(found);
        return found;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof auth_client_1.AuthClientService !== "undefined" && auth_client_1.AuthClientService) === "function" ? _a : Object])
], UsersService);
//# sourceMappingURL=users.service.js.map