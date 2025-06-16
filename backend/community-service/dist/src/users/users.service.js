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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async getMe(user) {
        const found = await this.userRepo.findOne({ where: { authId: user.id } });
        if (!found) {
            const newUser = this.userRepo.create({
                authId: user.id,
                displayName: user.displayName || user.email || 'User',
                privacySettings: {
                    isAnonymousByDefault: false,
                    showActivityStatus: true,
                    showPostHistory: true,
                    showCommentHistory: true,
                    showReactionHistory: true,
                    allowDirectMessages: true,
                    allowMentions: true,
                    allowTags: true,
                    notifyOnMention: true,
                    notifyOnReply: true,
                    notifyOnReaction: true,
                    notifyOnReport: true,
                },
            });
            return await this.userRepo.save(newUser);
        }
        return found;
    }
    async updateMe(dto, user) {
        const found = await this.userRepo.findOne({ where: { authId: user.id } });
        if (!found)
            throw new common_1.NotFoundException('User profile not found');
        if (dto.displayName)
            found.displayName = dto.displayName;
        if (dto.pseudonym !== undefined)
            found.pseudonym = dto.pseudonym;
        if (dto.bio !== undefined)
            found.bio = dto.bio;
        if (dto.specialties)
            found.specialties = dto.specialties;
        if (dto.certifications)
            found.certifications = dto.certifications;
        if (dto.privacySettings) {
            found.privacySettings = { ...found.privacySettings, ...dto.privacySettings };
        }
        if (dto.therapistProfile && found.isVerifiedTherapist) {
            found.therapistProfile = { ...found.therapistProfile, ...dto.therapistProfile };
        }
        await this.userRepo.save(found);
        return found;
    }
    async requestTherapistVerification(dto, user) {
        const found = await this.userRepo.findOne({ where: { authId: user.id } });
        if (!found)
            throw new common_1.NotFoundException('User profile not found');
        found.therapistProfile = {
            licenseNumber: dto.licenseNumber,
            licenseState: dto.licenseState,
            licenseExpiry: new Date(dto.licenseExpiry),
            yearsOfExperience: dto.yearsOfExperience,
            education: dto.education,
            languages: dto.languages || [],
            acceptedInsurance: dto.acceptedInsurance || [],
            sessionTypes: dto.sessionTypes || [],
            hourlyRate: dto.hourlyRate || 0,
            availability: dto.availability || {},
        };
        found.metadata = {
            ...found.metadata,
            verificationRequest: {
                status: 'pending',
                requestedAt: new Date(),
                additionalNotes: dto.additionalNotes,
            }
        };
        await this.userRepo.save(found);
        return { success: true, message: 'Therapist verification request submitted successfully' };
    }
    async verifyTherapist(id, dto, user) {
        if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
            throw new common_1.ForbiddenException('Only admin or moderator can verify therapists');
        }
        const found = await this.userRepo.findOne({ where: { id } });
        if (!found)
            throw new common_1.NotFoundException('User not found');
        found.isVerifiedTherapist = dto.isVerified;
        found.metadata = {
            ...found.metadata,
            verificationRequest: {
                ...found.metadata?.verificationRequest,
                status: dto.isVerified ? 'approved' : 'rejected',
                verifiedAt: new Date(),
                verifiedBy: user.id,
                notes: dto.notes,
                reason: dto.reason,
            }
        };
        if (dto.isVerified) {
            found.role = user_entity_1.UserRole.THERAPIST;
        }
        await this.userRepo.save(found);
        return {
            success: true,
            user: found,
            message: `Therapist verification ${dto.isVerified ? 'approved' : 'rejected'} successfully`
        };
    }
    async getUserById(id) {
        const found = await this.userRepo.findOne({ where: { id } });
        if (!found)
            throw new common_1.NotFoundException('User not found');
        return found;
    }
    async getUserByAuthId(authId) {
        const found = await this.userRepo.findOne({ where: { authId } });
        if (!found)
            throw new common_1.NotFoundException('User not found');
        return found;
    }
    async getAllUsers(page = 1, limit = 20) {
        const [users, total] = await this.userRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map