import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from 'nestjs-throttler';
import { HealthController } from './controllers/health.controller';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { CognitoService } from './services/cognito.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 30,
    }),
    TerminusModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [
    HealthController,
    AuthController,
    UsersController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AuthService,
    UsersService,
    CognitoService,
    JwtStrategy,
  ],
})
export class AppModule {} 