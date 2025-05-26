import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TeletherapyService } from './teletherapy.service';
import { TeletherapyController } from './teletherapy.controller';
import { TherapySession } from './entities/therapy-session.entity';
import { User } from '../auth/entities/user.entity';
import { Recording } from './entities/recording.entity';
import { MediaSession } from './entities/media-session.entity';
import { CalendarService } from './services/calendar.service';
import { CalendarController } from './controllers/calendar.controller';
import { VideoService } from './services/video.service';
import { VideoController } from './controllers/video.controller';
import { MediaController } from './controllers/media.controller';
import { SessionBookingController } from './session-booking.controller';
import { StorageService } from './services/storage.service';
import { NotificationService } from './services/notification.service';
import { MediaSoupService } from './services/mediasoup.service';
import { SignalingService } from './services/signaling.service';
import { RecordingService } from './services/recording.service';
import { RecordingRepository } from './repositories/recording.repository';
import { MediaSessionRepository } from './repositories/media-session.repository';
import { AuthClientModule } from '@mindlyf/shared/auth-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([TherapySession, User, Recording, MediaSession]),
    ConfigModule,
    HttpModule,
    AuthClientModule,
  ],
  controllers: [
    TeletherapyController,
    CalendarController,
    VideoController,
    MediaController,
    SessionBookingController,
  ],
  providers: [
    TeletherapyService,
    CalendarService,
    VideoService,
    StorageService,
    NotificationService,
    MediaSoupService,
    SignalingService,
    RecordingService,
    RecordingRepository,
    MediaSessionRepository,
  ],
  exports: [
    TeletherapyService,
    CalendarService,
    VideoService,
    StorageService,
    NotificationService,
    MediaSoupService,
    SignalingService,
    RecordingService,
    RecordingRepository,
    MediaSessionRepository,
  ],
})
export class TeletherapyModule {} 