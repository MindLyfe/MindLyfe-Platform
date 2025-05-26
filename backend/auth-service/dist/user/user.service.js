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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const bcrypt = require("bcrypt");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findAll() {
        const users = await this.userRepository.find();
        return users.map(user => this.sanitizeUser(user));
    }
    async findById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.sanitizeUser(user);
    }
    async findByIdInternal(id) {
        return await this.userRepository.findOne({ where: { id } });
    }
    async findByEmail(email) {
        return await this.userRepository.findOne({ where: { email } });
    }
    async findByResetToken(token) {
        return await this.userRepository.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: (0, typeorm_2.MoreThan)(new Date())
            }
        });
    }
    async createUser(userData) {
        let hashedPassword = userData.password;
        if (userData.password) {
            hashedPassword = await bcrypt.hash(userData.password, 10);
        }
        const newUser = this.userRepository.create(Object.assign(Object.assign({}, userData), { password: hashedPassword, role: userData.role || user_entity_1.UserRole.USER, status: userData.status || user_entity_1.UserStatus.PENDING, emailVerified: userData.emailVerified || false, twoFactorEnabled: userData.twoFactorEnabled || false }));
        const savedUser = await this.userRepository.save(newUser);
        return this.sanitizeUser(savedUser);
    }
    async updateLastLogin(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        user.lastLogin = new Date();
        const updatedUser = await this.userRepository.save(user);
        return this.sanitizeUser(updatedUser);
    }
    async updateResetToken(id, token, expires) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        const updatedUser = await this.userRepository.save(user);
        return this.sanitizeUser(updatedUser);
    }
    async updatePassword(id, password) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        const updatedUser = await this.userRepository.save(user);
        return this.sanitizeUser(updatedUser);
    }
    async deactivateUser(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        user.status = user_entity_1.UserStatus.INACTIVE;
        await this.userRepository.save(user);
        return { id, status: 'deactivated' };
    }
    sanitizeUser(user) {
        const { password, hashPassword, comparePassword } = user, result = __rest(user, ["password", "hashPassword", "comparePassword"]);
        return result;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map