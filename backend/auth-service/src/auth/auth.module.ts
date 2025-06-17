import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MfaService } from './mfa/mfa.service';
import { MfaController } from './mfa/mfa.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles/roles.guard';
import { UserModule } from '../user/user.module';
import { SessionModule } from './session/session.module';
import { User } from '../entities/user.entity';
import { Therapist } from '../entities/therapist.entity';
import { TherapistController } from '../therapist/therapist.controller';
import { TherapistService } from '../therapist/therapist.service';
// Removed EmailService - notifications handled by notification service

@Module({
  imports: [
    UserModule,
    SessionModule,
    HttpModule,
    TypeOrmModule.forFeature([User, Therapist]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret', 'mindlyf-dev-secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController, MfaController, TherapistController],
  providers: [
    AuthService, 
    JwtStrategy, 
    MfaService,
    TherapistService,
    // EmailService removed - using notification service instead
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, MfaService],
})
export class AuthModule {}