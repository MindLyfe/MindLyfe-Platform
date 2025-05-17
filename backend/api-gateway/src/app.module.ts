import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from 'nestjs-throttler';
import { HealthController } from './controllers/health.controller';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { TherapyModule } from './modules/therapy.module';
import { AiModule } from './modules/ai.module';

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
    AuthModule,
    UsersModule,
    TherapyModule,
    AiModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {} 