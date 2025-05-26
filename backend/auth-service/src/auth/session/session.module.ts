import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { SessionRepository } from './session.repository';
import { SessionCleanupService } from './session-cleanup.service';
import { UserSession } from '../../entities/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    SessionService,
    SessionRepository,
    SessionCleanupService,
  ],
  controllers: [SessionController],
  exports: [SessionService, SessionRepository],
})
export class SessionModule {}