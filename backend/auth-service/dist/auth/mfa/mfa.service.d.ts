import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { SessionService } from '../session/session.service';
import { EventService } from '../../shared/events/event.service';
export declare class MfaService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly sessionService;
    private readonly eventService;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService, sessionService: SessionService, eventService: EventService);
    generateMfaSecret(userId: string, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        secret: string;
        qrCode: string;
    }>;
    verifyAndEnableMfa(userId: string, token: string, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        message: string;
    }>;
    disableMfa(userId: string, password: string, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        message: string;
    }>;
    verifyMfaToken(userId: string, token: string, metadata?: {
        ipAddress?: string;
        userAgent?: string;
        deviceInfo?: string;
    }): Promise<{
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("../../entities/user.entity").UserRole;
        accessToken: string;
        refreshToken: string;
        sessionId: string;
    }>;
    private parseTimeToMs;
    generateTotpSecret(email: string): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    verifyTotpToken(userSecret: string, token: string): Promise<boolean>;
}
