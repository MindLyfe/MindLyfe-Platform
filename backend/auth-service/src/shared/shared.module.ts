import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { RedisService } from './services/redis.service';
import { AuthLoggingMiddleware } from './middleware/auth-logging.middleware';
import { EventModule } from './events/event.module';
import { EventService } from './events/event.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    EventModule,
  ],
  providers: [EmailService, RedisService, AuthLoggingMiddleware, EventService],
  exports: [
    EmailService,
    RedisService,
    AuthLoggingMiddleware,
    EventModule,
    EventService,
  ],
})
export class SharedModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthLoggingMiddleware)
      .forRoutes('auth', 'mfa', 'sessions'); // Apply to all auth-related routes
  }
} 