import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validator';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { OrganizationModule } from './organization/organization.module';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './health/health.module';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { Organization } from './entities/organization.entity';
import { Subscription } from './entities/subscription.entity';
import { TherapySession } from './entities/therapy-session.entity';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    // Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    
    // Database connection
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'mindlyf_auth'),
        entities: [
          User, 
          UserSession, 
          Organization, 
          Subscription, 
          TherapySession, 
          Payment
        ],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        logging: configService.get<boolean>('DB_LOGGING', true),
        ssl: configService.get<boolean>('DB_SSL', false) ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10,
    }]),
    
    // Shared services
    SharedModule,
    
    // Application modules
    AuthModule,
    UserModule,
    SubscriptionModule,
    OrganizationModule,
    HealthModule,
    
    // Health check
    TerminusModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}