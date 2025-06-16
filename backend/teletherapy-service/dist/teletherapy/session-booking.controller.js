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
exports.SessionBookingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const teletherapy_service_1 = require("./teletherapy.service");
const book_session_dto_1 = require("./dto/book-session.dto");
const axios_1 = require("axios");
let SessionBookingController = class SessionBookingController {
    constructor(teletherapyService) {
        this.teletherapyService = teletherapyService;
    }
    async bookSession(req, bookSessionDto) {
        try {
            const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
            const serviceToken = process.env.JWT_SERVICE_SECRET || 'mindlyfe-service-secret-key-dev';
            const validationResponse = await axios_1.default.get(`${authServiceUrl}/api/subscriptions/validate-booking/${req.user.id}`, {
                headers: {
                    'Authorization': `Bearer ${serviceToken}`,
                    'X-Service-Name': 'teletherapy-service'
                }
            });
            const validation = validationResponse.data;
            if (!validation.canBook) {
                throw new common_1.HttpException(validation.reason || 'Cannot book session', common_1.HttpStatus.FORBIDDEN);
            }
            const createSessionData = {
                clientId: req.user.id,
                therapistId: bookSessionDto.therapistId,
                startTime: bookSessionDto.sessionDate,
                endTime: new Date(new Date(bookSessionDto.sessionDate).getTime() + (bookSessionDto.duration || 60) * 60000),
                type: bookSessionDto.sessionType,
                category: 'individual',
                focus: [],
                title: `Therapy Session with ${bookSessionDto.therapistId}`,
                metadata: {
                    notes: bookSessionDto.notes,
                    isEmergency: bookSessionDto.isEmergency || false
                }
            };
            const session = await this.teletherapyService.createSession(createSessionData, req.user);
            try {
                const consumeResponse = await axios_1.default.post(`${authServiceUrl}/api/subscriptions/consume-session/${req.user.id}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${serviceToken}`,
                        'X-Service-Name': 'teletherapy-service'
                    }
                });
                const sessionPayment = consumeResponse.data;
                await this.teletherapyService.updateSessionPayment(session.id, sessionPayment);
                return {
                    ...session,
                    paymentInfo: sessionPayment,
                    availableSessions: validation.availableSessions - 1
                };
            }
            catch (consumeError) {
                await this.teletherapyService.cancelSession(session.id, req.user, 'Payment processing failed');
                throw new common_1.HttpException('Failed to process session payment. Session cancelled.', common_1.HttpStatus.PAYMENT_REQUIRED);
            }
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            if (error.response) {
                throw new common_1.HttpException(error.response.data.message || 'Subscription validation failed', error.response.status || common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Failed to book session', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMySessions(req) {
        return await this.teletherapyService.getSessionsByUser(req.user.id);
    }
    async getAvailableTherapists() {
        return await this.teletherapyService.getAvailableTherapists();
    }
    async getAvailableSlots(therapistId, req) {
        const date = req.query.date;
        const endDate = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return await this.teletherapyService.getAvailableSlots(therapistId, date, endDate, 60);
    }
    async getSubscriptionStatus(req) {
        try {
            const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
            const response = await axios_1.default.get(`${authServiceUrl}/api/subscriptions/status`, {
                headers: {
                    'Authorization': req.headers.authorization
                }
            });
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.HttpException(error.response.data.message || 'Failed to get subscription status', error.response.status || common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Failed to connect to auth service', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
};
__decorate([
    (0, common_1.Post)('book'),
    (0, swagger_1.ApiOperation)({ summary: 'Book a new therapy session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Session booked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot book session - no available sessions or weekly limit reached' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid booking data' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, book_session_dto_1.BookSessionDto]),
    __metadata("design:returntype", Promise)
], SessionBookingController.prototype, "bookSession", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user sessions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User sessions retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionBookingController.prototype, "getMySessions", null);
__decorate([
    (0, common_1.Get)('available-therapists'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of available therapists' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available therapists retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionBookingController.prototype, "getAvailableTherapists", null);
__decorate([
    (0, common_1.Get)('available-slots/:therapistId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available time slots for a therapist' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available slots retrieved successfully' }),
    __param(0, (0, common_1.Param)('therapistId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SessionBookingController.prototype, "getAvailableSlots", null);
__decorate([
    (0, common_1.Get)('subscription-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user subscription status from auth service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription status retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionBookingController.prototype, "getSubscriptionStatus", null);
SessionBookingController = __decorate([
    (0, swagger_1.ApiTags)('Session Booking'),
    (0, common_1.Controller)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [teletherapy_service_1.TeletherapyService])
], SessionBookingController);
exports.SessionBookingController = SessionBookingController;
//# sourceMappingURL=session-booking.controller.js.map