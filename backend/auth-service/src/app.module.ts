import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validator';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SessionModule } from './auth/session/session.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { OrganizationModule } from './organization/organization.module';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './health/health.module';
import { SupportModule } from './support/support.module';
import { TherapistModule } from './therapist/therapist.module';
import { User } from './entities/user.entity';
import { Therapist } from './entities/therapist.entity';
import { UserSession } from './entities/user-session.entity';
import { Organization } from './entities/organization.entity';
import { Subscription } from './entities/subscription.entity';
import { TherapySession } from './entities/therapy-session.entity';
import { Payment } from './entities/payment.entity';
import { SupportShift } from './entities/support-shift.entity';
import { SupportRouting } from './entities/support-routing.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [
          User,
          Therapist,
          UserSession,
          Organization,
          Subscription,
          TherapySession,
          Payment,
          SupportShift,
          SupportRouting,
        ],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    SessionModule,
    SubscriptionModule,
    OrganizationModule,
    SharedModule,
    HealthModule,
    SupportModule,
    TherapistModule,
    TerminusModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}