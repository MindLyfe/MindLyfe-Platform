import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { configuration } from './config/configuration';
import { validate } from './config/env.validator';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { HealthModule } from './health/health.module';
import { AuthClientModule } from './shared/auth-client/auth-client.module';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { CustomLoggerService } from './common/services/logger.service';
import { WebSocketDocsController } from './websocket/websocket-docs.controller';
import { NotificationDocsController } from './notifications/notification-docs.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
      }),
    }),
    
    // Authentication
    AuthModule,
    AuthClientModule,
    
    // Core modules
    ChatModule,
    HealthModule,
  ],
  controllers: [WebSocketDocsController, NotificationDocsController],
  providers: [
    CustomLoggerService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes('*');
  }
}