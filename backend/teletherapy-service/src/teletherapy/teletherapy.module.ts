import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TeletherapyService } from './teletherapy.service';
import { TeletherapyController } from './teletherapy.controller';
import { TherapySession } from './entities/therapy-session.entity';
// User entity is managed by auth-service
import { Recording } from './entities/recording.entity';
import { MediaSession } from './entities/media-session.entity';
import { CalendarService } from './services/calendar.service';
import { CalendarController } from './controllers/calendar.controller';
import { VideoService } from './services/video.service';
import { VideoController } from './controllers/video.controller';
import { MediaController } from './controllers/media.controller';
import { SessionBookingController } from './session-booking.controller';
import { StorageService } from './services/storage.service';
import { TeletherapyNotificationService } from './services/notification.service';
import { MediaSoupService } from './services/mediasoup.service';
import { SignalingService } from './services/signaling.service';
import { RecordingService } from './services/recording.service';
import { RecordingRepository } from './repositories/recording.repository';
import { MediaSessionRepository } from './repositories/media-session.repository';
import { RedisService } from './services/redis.service';
// AuthClientModule replaced by HTTP client
import { SessionNote } from './entities/session-note.entity';
import { AuthClientService } from './services/auth-client.service';
// AuthGuard will use JwtAuthGuard instead
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([TherapySession, Recording, MediaSession, SessionNote]),
    ConfigModule,
    HttpModule,
    // AuthClientModule replaced by HTTP client
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
    TeletherapyNotificationService,
    MediaSoupService,
    SignalingService,
    RecordingService,
    RecordingRepository,
    MediaSessionRepository,
    RedisService,
    AuthClientService,
    // AuthGuard replaced by JwtAuthGuard at app level
    JwtService,
  ],
  exports: [
    TeletherapyService,
    CalendarService,
    VideoService,
    StorageService,
    TeletherapyNotificationService,
    MediaSoupService,
    SignalingService,
    RecordingService,
    RecordingRepository,
    MediaSessionRepository,
  ],
})
export class TeletherapyModule {} 