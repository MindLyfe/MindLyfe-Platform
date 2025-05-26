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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const subscription_entity_1 = require("../entities/subscription.entity");
const organization_entity_1 = require("../entities/organization.entity");
const payment_entity_1 = require("../entities/payment.entity");
let SubscriptionService = class SubscriptionService {
    constructor(userRepository, subscriptionRepository, organizationRepository, paymentRepository, dataSource) {
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.organizationRepository = organizationRepository;
        this.paymentRepository = paymentRepository;
        this.dataSource = dataSource;
        this.PLANS = {
            [subscription_entity_1.SubscriptionType.MONTHLY]: {
                type: subscription_entity_1.SubscriptionType.MONTHLY,
                name: 'Monthly Membership',
                price: 200000,
                sessions: 4,
                duration: 30,
                description: 'Monthly membership with 4 therapy sessions'
            },
            [subscription_entity_1.SubscriptionType.ORGANIZATION]: {
                type: subscription_entity_1.SubscriptionType.ORGANIZATION,
                name: 'Organization Plan',
                price: 680000,
                sessions: 8,
                duration: 365,
                description: 'Annual organization plan with 8 sessions per user'
            },
            [subscription_entity_1.SubscriptionType.CREDIT]: {
                type: subscription_entity_1.SubscriptionType.CREDIT,
                name: 'Session Credits',
                price: 76000,
                sessions: 1,
                duration: 90,
                description: 'Individual session credits'
            }
        };
    }
    async getAvailablePlans(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['organization']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isOrganizationMember) {
            return [this.PLANS[subscription_entity_1.SubscriptionType.CREDIT]];
        }
        return [
            this.PLANS[subscription_entity_1.SubscriptionType.MONTHLY],
            this.PLANS[subscription_entity_1.SubscriptionType.CREDIT]
        ];
    }
    async createSubscription(createDto) {
        const user = await this.userRepository.findOne({
            where: { id: createDto.userId },
            relations: ['organization', 'subscriptions']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.validateSubscriptionType(user, createDto.type);
        const plan = this.PLANS[createDto.type];
        return await this.dataSource.transaction(async (manager) => {
            const subscription = await manager.save(manager.create(subscription_entity_1.Subscription, {
                userId: createDto.userId,
                type: createDto.type,
                status: subscription_entity_1.SubscriptionStatus.PENDING,
                amount: plan.price,
                sessionsIncluded: plan.sessions,
                sessionsUsed: 0,
                creditsAvailable: 0,
                startDate: new Date(),
                endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
                autoRenew: createDto.type === subscription_entity_1.SubscriptionType.MONTHLY
            }));
            const savedSubscription = subscription;
            const payment = manager.create(payment_entity_1.Payment, {
                userId: createDto.userId,
                subscriptionId: savedSubscription.id,
                type: payment_entity_1.PaymentType.SUBSCRIPTION,
                status: payment_entity_1.PaymentStatus.PENDING,
                method: createDto.paymentMethod,
                amount: plan.price,
                currency: 'UGX',
                reference: this.generatePaymentReference(),
                phoneNumber: createDto.phoneNumber,
                description: `Payment for ${plan.name}`,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000)
            });
            const savedPayment = await manager.save(payment);
            return { subscription: savedSubscription, payment: savedPayment };
        });
    }
    async purchaseCredits(purchaseDto) {
        const user = await this.userRepository.findOne({
            where: { id: purchaseDto.userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const creditPlan = this.PLANS[subscription_entity_1.SubscriptionType.CREDIT];
        const totalAmount = creditPlan.price * purchaseDto.credits;
        return await this.dataSource.transaction(async (manager) => {
            const subscription = await manager.save(manager.create(subscription_entity_1.Subscription, {
                userId: purchaseDto.userId,
                type: subscription_entity_1.SubscriptionType.CREDIT,
                status: subscription_entity_1.SubscriptionStatus.PENDING,
                amount: totalAmount,
                sessionsIncluded: 0,
                sessionsUsed: 0,
                creditsAvailable: purchaseDto.credits,
                startDate: new Date(),
                endDate: new Date(Date.now() + creditPlan.duration * 24 * 60 * 60 * 1000),
                autoRenew: false
            }));
            const savedSubscription = subscription;
            const payment = manager.create(payment_entity_1.Payment, {
                userId: purchaseDto.userId,
                subscriptionId: savedSubscription.id,
                type: payment_entity_1.PaymentType.CREDIT_PURCHASE,
                status: payment_entity_1.PaymentStatus.PENDING,
                method: purchaseDto.paymentMethod,
                amount: totalAmount,
                currency: 'UGX',
                reference: this.generatePaymentReference(),
                phoneNumber: purchaseDto.phoneNumber,
                description: `Purchase of ${purchaseDto.credits} session credits`,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000)
            });
            const savedPayment = await manager.save(payment);
            return { subscription: savedSubscription, payment: savedPayment };
        });
    }
    async getUserSubscriptionStatus(userId) {
        var _a;
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['subscriptions', 'organization']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const activeSubscriptions = ((_a = user.subscriptions) === null || _a === void 0 ? void 0 : _a.filter(sub => sub.status === subscription_entity_1.SubscriptionStatus.ACTIVE && !sub.isExpired)) || [];
        const totalAvailableSessions = activeSubscriptions.reduce((total, sub) => total + sub.totalAvailableSessions, 0);
        return {
            hasActiveSubscription: activeSubscriptions.length > 0,
            subscriptions: activeSubscriptions,
            totalAvailableSessions,
            canBookSession: totalAvailableSessions > 0
        };
    }
    async confirmPayment(paymentId) {
        return await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(payment_entity_1.Payment, {
                where: { id: paymentId },
                relations: ['subscription']
            });
            if (!payment) {
                throw new common_1.NotFoundException('Payment not found');
            }
            if (payment.status !== payment_entity_1.PaymentStatus.PENDING) {
                throw new common_1.BadRequestException('Payment is not pending');
            }
            payment.status = payment_entity_1.PaymentStatus.COMPLETED;
            payment.paidAt = new Date();
            await manager.save(payment);
            if (payment.subscription) {
                payment.subscription.status = subscription_entity_1.SubscriptionStatus.ACTIVE;
                return await manager.save(payment.subscription);
            }
            throw new common_1.BadRequestException('No subscription associated with payment');
        });
    }
    async validateUserCanBookSession(userId) {
        var _a;
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['subscriptions']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const activeSubscriptions = ((_a = user.subscriptions) === null || _a === void 0 ? void 0 : _a.filter(sub => sub.status === subscription_entity_1.SubscriptionStatus.ACTIVE && !sub.isExpired)) || [];
        const totalAvailableSessions = activeSubscriptions.reduce((total, sub) => total + sub.totalAvailableSessions, 0);
        if (totalAvailableSessions <= 0) {
            return {
                canBook: false,
                reason: 'No available sessions. Please purchase a subscription or credits.',
                availableSessions: 0
            };
        }
        const lastSessionSub = activeSubscriptions
            .filter(sub => sub.lastSessionDate)
            .sort((a, b) => { var _a, _b; return (((_a = b.lastSessionDate) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.lastSessionDate) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); })[0];
        if (lastSessionSub === null || lastSessionSub === void 0 ? void 0 : lastSessionSub.lastSessionDate) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            if (lastSessionSub.lastSessionDate > oneWeekAgo) {
                const nextAvailableDate = new Date(lastSessionSub.lastSessionDate);
                nextAvailableDate.setDate(nextAvailableDate.getDate() + 7);
                return {
                    canBook: false,
                    reason: 'Weekly limit reached. Only one session per week allowed.',
                    availableSessions: totalAvailableSessions,
                    nextAvailableDate
                };
            }
        }
        return {
            canBook: true,
            availableSessions: totalAvailableSessions
        };
    }
    async consumeSession(userId) {
        return await this.dataSource.transaction(async (manager) => {
            var _a;
            const user = await manager.findOne(user_entity_1.User, {
                where: { id: userId },
                relations: ['subscriptions']
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const activeSubscriptions = (_a = user.subscriptions) === null || _a === void 0 ? void 0 : _a.filter(sub => sub.status === subscription_entity_1.SubscriptionStatus.ACTIVE && !sub.isExpired).sort((a, b) => {
                if (a.remainingSessions > 0 && b.remainingSessions === 0)
                    return -1;
                if (b.remainingSessions > 0 && a.remainingSessions === 0)
                    return 1;
                if (a.endDate && b.endDate) {
                    return a.endDate.getTime() - b.endDate.getTime();
                }
                return 0;
            });
            if (!activeSubscriptions || activeSubscriptions.length === 0) {
                throw new common_1.ForbiddenException('No active subscription found');
            }
            const subscription = activeSubscriptions[0];
            if (subscription.totalAvailableSessions <= 0) {
                throw new common_1.ForbiddenException('No sessions available');
            }
            let paidFromSubscription = false;
            let paidFromCredit = false;
            if (subscription.remainingSessions > 0) {
                subscription.sessionsUsed += 1;
                paidFromSubscription = true;
            }
            else if (subscription.creditsAvailable > 0) {
                subscription.creditsAvailable -= 1;
                paidFromCredit = true;
            }
            else {
                throw new common_1.ForbiddenException('No sessions or credits available');
            }
            subscription.lastSessionDate = new Date();
            await manager.save(subscription);
            return {
                subscriptionId: subscription.id,
                paidFromSubscription,
                paidFromCredit
            };
        });
    }
    async validateSubscriptionType(user, type) {
        var _a;
        if (user.isOrganizationMember && type !== subscription_entity_1.SubscriptionType.CREDIT) {
            throw new common_1.ForbiddenException('Organization members can only purchase session credits');
        }
        const existingSubscription = (_a = user.subscriptions) === null || _a === void 0 ? void 0 : _a.find(sub => sub.status === subscription_entity_1.SubscriptionStatus.ACTIVE &&
            sub.type === type &&
            !sub.isExpired);
        if (existingSubscription && type === subscription_entity_1.SubscriptionType.MONTHLY) {
            throw new common_1.BadRequestException('User already has an active monthly subscription');
        }
    }
    generatePaymentReference() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8);
        return `PAY_${timestamp}_${random}`.toUpperCase();
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(2, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map