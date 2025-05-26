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
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organization_entity_1 = require("../entities/organization.entity");
const user_entity_1 = require("../entities/user.entity");
const subscription_entity_1 = require("../entities/subscription.entity");
const payment_entity_1 = require("../entities/payment.entity");
let OrganizationService = class OrganizationService {
    constructor(organizationRepository, userRepository, subscriptionRepository, paymentRepository, dataSource) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.dataSource = dataSource;
    }
    async createOrganization(createDto) {
        const adminUser = await this.userRepository.findOne({
            where: { id: createDto.adminUserId }
        });
        if (!adminUser) {
            throw new common_1.NotFoundException('Admin user not found');
        }
        const existingOrg = await this.organizationRepository.findOne({
            where: [
                { name: createDto.name },
                { email: createDto.email }
            ]
        });
        if (existingOrg) {
            throw new common_1.BadRequestException('Organization with this name or email already exists');
        }
        return await this.dataSource.transaction(async (manager) => {
            const organization = manager.create(organization_entity_1.Organization, {
                name: createDto.name,
                email: createDto.email,
                phoneNumber: createDto.phoneNumber,
                address: createDto.address,
                maxUsers: createDto.maxUsers,
                currentUsers: 1,
                status: organization_entity_1.OrganizationStatus.ACTIVE,
                isActive: false
            });
            const savedOrganization = await manager.save(organization);
            adminUser.organizationId = savedOrganization.id;
            adminUser.userType = user_entity_1.UserType.ORGANIZATION_MEMBER;
            adminUser.role = 'organization_admin';
            await manager.save(adminUser);
            return savedOrganization;
        });
    }
    async createOrganizationSubscription(subscriptionDto) {
        const organization = await this.organizationRepository.findOne({
            where: { id: subscriptionDto.organizationId },
            relations: ['users']
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const adminUser = await this.userRepository.findOne({
            where: {
                id: subscriptionDto.adminUserId,
                organizationId: organization.id,
                role: 'organization_admin'
            }
        });
        if (!adminUser) {
            throw new common_1.ForbiddenException('Only organization admins can create subscriptions');
        }
        const totalCost = organization.maxUsers * organization.pricePerUser;
        return await this.dataSource.transaction(async (manager) => {
            const payment = manager.create(payment_entity_1.Payment, {
                userId: subscriptionDto.adminUserId,
                organizationId: organization.id,
                type: payment_entity_1.PaymentType.ORGANIZATION_PAYMENT,
                status: payment_entity_1.PaymentStatus.PENDING,
                method: subscriptionDto.paymentMethod,
                amount: totalCost,
                currency: 'UGX',
                reference: this.generatePaymentReference(),
                phoneNumber: subscriptionDto.phoneNumber,
                description: `Annual subscription for ${organization.name} (${organization.maxUsers} users)`,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                metadata: {
                    organizationId: organization.id,
                    maxUsers: organization.maxUsers,
                    pricePerUser: organization.pricePerUser
                }
            });
            const savedPayment = await manager.save(payment);
            return { payment: savedPayment };
        });
    }
    async confirmOrganizationPayment(paymentId) {
        return await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(payment_entity_1.Payment, {
                where: { id: paymentId },
                relations: ['organization']
            });
            if (!payment || !payment.organization) {
                throw new common_1.NotFoundException('Payment or organization not found');
            }
            if (payment.status !== payment_entity_1.PaymentStatus.PENDING) {
                throw new common_1.BadRequestException('Payment is not pending');
            }
            payment.status = payment_entity_1.PaymentStatus.COMPLETED;
            payment.paidAt = new Date();
            await manager.save(payment);
            const organization = payment.organization;
            organization.isActive = true;
            organization.subscriptionStartDate = new Date();
            organization.subscriptionEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            await manager.save(organization);
            const users = await manager.find(user_entity_1.User, {
                where: { organizationId: organization.id }
            });
            for (const user of users) {
                const subscription = manager.create(subscription_entity_1.Subscription, {
                    userId: user.id,
                    type: subscription_entity_1.SubscriptionType.ORGANIZATION,
                    status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                    amount: organization.pricePerUser,
                    sessionsIncluded: organization.sessionsPerUser,
                    sessionsUsed: 0,
                    creditsAvailable: 0,
                    startDate: organization.subscriptionStartDate,
                    endDate: organization.subscriptionEndDate,
                    autoRenew: false
                });
                await manager.save(subscription);
            }
            return organization;
        });
    }
    async addUserToOrganization(addUserDto) {
        const organization = await this.organizationRepository.findOne({
            where: { id: addUserDto.organizationId },
            relations: ['users']
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        if (!organization.isActive) {
            throw new common_1.BadRequestException('Organization subscription is not active');
        }
        const adminUser = await this.userRepository.findOne({
            where: {
                id: addUserDto.adminUserId,
                organizationId: organization.id,
                role: 'organization_admin'
            }
        });
        if (!adminUser) {
            throw new common_1.ForbiddenException('Only organization admins can add users');
        }
        if (organization.currentUsers >= organization.maxUsers) {
            throw new common_1.BadRequestException('Organization has reached maximum user limit');
        }
        const userToAdd = await this.userRepository.findOne({
            where: { email: addUserDto.userEmail }
        });
        if (!userToAdd) {
            throw new common_1.NotFoundException('User not found');
        }
        if (userToAdd.organizationId) {
            throw new common_1.BadRequestException('User is already part of an organization');
        }
        return await this.dataSource.transaction(async (manager) => {
            userToAdd.organizationId = organization.id;
            userToAdd.userType = user_entity_1.UserType.ORGANIZATION_MEMBER;
            const savedUser = await manager.save(userToAdd);
            organization.currentUsers += 1;
            await manager.save(organization);
            if (organization.isActive) {
                const subscription = manager.create(subscription_entity_1.Subscription, {
                    userId: userToAdd.id,
                    type: subscription_entity_1.SubscriptionType.ORGANIZATION,
                    status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                    amount: organization.pricePerUser,
                    sessionsIncluded: organization.sessionsPerUser,
                    sessionsUsed: 0,
                    creditsAvailable: 0,
                    startDate: organization.subscriptionStartDate,
                    endDate: organization.subscriptionEndDate,
                    autoRenew: false
                });
                await manager.save(subscription);
            }
            return savedUser;
        });
    }
    async removeUserFromOrganization(organizationId, userId, adminUserId) {
        const organization = await this.organizationRepository.findOne({
            where: { id: organizationId }
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const adminUser = await this.userRepository.findOne({
            where: {
                id: adminUserId,
                organizationId: organization.id,
                role: 'organization_admin'
            }
        });
        if (!adminUser) {
            throw new common_1.ForbiddenException('Only organization admins can remove users');
        }
        const userToRemove = await this.userRepository.findOne({
            where: { id: userId, organizationId: organization.id }
        });
        if (!userToRemove) {
            throw new common_1.NotFoundException('User not found in organization');
        }
        if (userToRemove.id === adminUserId) {
            throw new common_1.BadRequestException('Admin cannot remove themselves');
        }
        await this.dataSource.transaction(async (manager) => {
            userToRemove.organizationId = null;
            userToRemove.userType = user_entity_1.UserType.INDIVIDUAL;
            userToRemove.role = 'user';
            await manager.save(userToRemove);
            await manager.update(subscription_entity_1.Subscription, { userId: userToRemove.id, type: subscription_entity_1.SubscriptionType.ORGANIZATION }, { status: subscription_entity_1.SubscriptionStatus.CANCELLED });
            organization.currentUsers -= 1;
            await manager.save(organization);
        });
    }
    async getOrganizationDetails(organizationId) {
        const organization = await this.organizationRepository.findOne({
            where: { id: organizationId },
            relations: ['users']
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const users = await this.userRepository.find({
            where: { organizationId: organization.id },
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt']
        });
        let remainingDays = 0;
        if (organization.subscriptionEndDate) {
            const now = new Date();
            const endDate = new Date(organization.subscriptionEndDate);
            remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
        return {
            organization,
            users,
            subscriptionStatus: {
                isActive: organization.isActive,
                totalCost: organization.maxUsers * organization.pricePerUser,
                remainingDays
            }
        };
    }
    async getUserOrganization(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['organization']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.organizationId || !user.organization) {
            return {
                organization: null,
                userRole: user.role,
                subscriptionStatus: undefined
            };
        }
        const organization = user.organization;
        let remainingDays = 0;
        if (organization.subscriptionEndDate) {
            const now = new Date();
            const endDate = new Date(organization.subscriptionEndDate);
            remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
        return {
            organization,
            userRole: user.role,
            subscriptionStatus: {
                isActive: organization.isActive,
                totalCost: organization.maxUsers * organization.pricePerUser,
                remainingDays
            }
        };
    }
    generatePaymentReference() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8);
        return `ORG_${timestamp}_${random}`.toUpperCase();
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map