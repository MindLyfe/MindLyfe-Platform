import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TerminusModule } from '@nestjs/terminus';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Configuration
import configuration from './config/configuration';

// Controllers
import { HealthController } from './health/health.controller';
import { ProxyController } from './controllers/proxy.controller';

// Services
import { ProxyService } from './services/proxy.service';

// Auth
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

// Service Modules
import { UserModule } from './user/user.module';
import { AiModule } from './modules/ai.module';
import { CommunityModule } from './modules/community.module';
import { NotificationModule } from './modules/notification.module';
import { LyfbotModule } from './modules/lyfbot.module';
import { TherapyModule } from './modules/therapy.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    
    // Health checks
    TerminusModule,
    
    // Auth Module
    AuthModule,
    
    // Service modules
    UserModule,
    AiModule,
    CommunityModule,
    NotificationModule,
    LyfbotModule,
    TherapyModule,
  ],
  controllers: [
    HealthController,
    ProxyController,
  ],
  providers: [
    ProxyService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}