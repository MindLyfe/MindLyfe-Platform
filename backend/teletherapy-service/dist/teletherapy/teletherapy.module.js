"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeletherapyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const teletherapy_service_1 = require("./teletherapy.service");
const teletherapy_controller_1 = require("./teletherapy.controller");
const therapy_session_entity_1 = require("./entities/therapy-session.entity");
const recording_entity_1 = require("./entities/recording.entity");
const media_session_entity_1 = require("./entities/media-session.entity");
const calendar_service_1 = require("./services/calendar.service");
const calendar_controller_1 = require("./controllers/calendar.controller");
const video_service_1 = require("./services/video.service");
const video_controller_1 = require("./controllers/video.controller");
const media_controller_1 = require("./controllers/media.controller");
const session_booking_controller_1 = require("./session-booking.controller");
const storage_service_1 = require("./services/storage.service");
const notification_service_1 = require("./services/notification.service");
const mediasoup_service_1 = require("./services/mediasoup.service");
const signaling_service_1 = require("./services/signaling.service");
const recording_service_1 = require("./services/recording.service");
const recording_repository_1 = require("./repositories/recording.repository");
const media_session_repository_1 = require("./repositories/media-session.repository");
const redis_service_1 = require("./services/redis.service");
const session_note_entity_1 = require("./entities/session-note.entity");
const auth_client_service_1 = require("./services/auth-client.service");
const jwt_1 = require("@nestjs/jwt");
let TeletherapyModule = class TeletherapyModule {
};
TeletherapyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([therapy_session_entity_1.TherapySession, recording_entity_1.Recording, media_session_entity_1.MediaSession, session_note_entity_1.SessionNote]),
            config_1.ConfigModule,
            axios_1.HttpModule,
        ],
        controllers: [
            teletherapy_controller_1.TeletherapyController,
            calendar_controller_1.CalendarController,
            video_controller_1.VideoController,
            media_controller_1.MediaController,
            session_booking_controller_1.SessionBookingController,
        ],
        providers: [
            teletherapy_service_1.TeletherapyService,
            calendar_service_1.CalendarService,
            video_service_1.VideoService,
            storage_service_1.StorageService,
            notification_service_1.TeletherapyNotificationService,
            mediasoup_service_1.MediaSoupService,
            signaling_service_1.SignalingService,
            recording_service_1.RecordingService,
            recording_repository_1.RecordingRepository,
            media_session_repository_1.MediaSessionRepository,
            redis_service_1.RedisService,
            auth_client_service_1.AuthClientService,
            jwt_1.JwtService,
        ],
        exports: [
            teletherapy_service_1.TeletherapyService,
            calendar_service_1.CalendarService,
            video_service_1.VideoService,
            storage_service_1.StorageService,
            notification_service_1.TeletherapyNotificationService,
            mediasoup_service_1.MediaSoupService,
            signaling_service_1.SignalingService,
            recording_service_1.RecordingService,
            recording_repository_1.RecordingRepository,
            media_session_repository_1.MediaSessionRepository,
        ],
    })
], TeletherapyModule);
exports.TeletherapyModule = TeletherapyModule;
//# sourceMappingURL=teletherapy.module.js.map