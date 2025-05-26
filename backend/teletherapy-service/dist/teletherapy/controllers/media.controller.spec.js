"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const jwt_1 = require("@nestjs/jwt");
const media_controller_1 = require("./media.controller");
const video_service_1 = require("../services/video.service");
const media_session_repository_1 = require("../repositories/media-session.repository");
const media_session_entity_1 = require("../entities/media-session.entity");
const user_entity_1 = require("../../auth/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
describe('MediaController (e2e)', () => {
    let app;
    let jwtService;
    let mediaSessionRepository;
    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
    };
    const mockHost = {
        id: 'host-1',
        email: 'host@example.com',
        firstName: 'Host',
        lastName: 'User',
    };
    const mockSession = {
        id: 'session-1',
        type: media_session_entity_1.MediaSessionType.TELETHERAPY,
        contextId: 'context-1',
        startedBy: mockHost.id,
        status: media_session_entity_1.MediaSessionStatus.ACTIVE,
        participants: [mockHost],
        metadata: {
            recording: false,
            chat: true,
            screenSharing: true,
        },
    };
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            controllers: [media_controller_1.MediaController],
            providers: [
                {
                    provide: video_service_1.VideoService,
                    useValue: {
                        createSession: jest.fn().mockResolvedValue(mockSession),
                        joinSession: jest.fn().mockResolvedValue({ token: 'test-token' }),
                        leaveSession: jest.fn().mockResolvedValue(undefined),
                        startRecording: jest.fn().mockResolvedValue(undefined),
                        stopRecording: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: media_session_repository_1.MediaSessionRepository,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockSession),
                        findActiveByContext: jest.fn().mockResolvedValue(mockSession),
                        findByParticipant: jest.fn().mockResolvedValue([mockSession]),
                    },
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('test-jwt-token'),
                        verify: jest.fn().mockReturnValue({ sub: mockUser.id }),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(media_session_entity_1.MediaSession),
                    useClass: typeorm_2.Repository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useClass: typeorm_2.Repository,
                },
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        jwtService = moduleFixture.get(jwt_1.JwtService);
        mediaSessionRepository = moduleFixture.get((0, typeorm_1.getRepositoryToken)(media_session_entity_1.MediaSession));
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    const generateAuthToken = (user = mockUser) => {
        return jwtService.sign({ sub: user.id });
    };
    describe('POST /media-sessions', () => {
        it('should create a new media session', () => {
            return request(app.getHttpServer())
                .post('/media-sessions')
                .set('Authorization', `Bearer ${generateAuthToken(mockHost)}`)
                .send({
                type: media_session_entity_1.MediaSessionType.TELETHERAPY,
                contextId: 'context-1',
                options: {
                    recording: true,
                    chat: true,
                    screenSharing: true,
                },
            })
                .expect(201)
                .expect((res) => {
                expect(res.body.status).toBe('success');
                expect(res.body.data).toHaveProperty('id');
                expect(res.body.data.type).toBe(media_session_entity_1.MediaSessionType.TELETHERAPY);
            });
        });
        it('should validate required fields', () => {
            return request(app.getHttpServer())
                .post('/media-sessions')
                .set('Authorization', `Bearer ${generateAuthToken()}`)
                .send({})
                .expect(400);
        });
    });
    describe('POST /media-sessions/:sessionId/join', () => {
        it('should allow a user to join a session', () => {
            return request(app.getHttpServer())
                .post(`/media-sessions/${mockSession.id}/join`)
                .set('Authorization', `Bearer ${generateAuthToken()}`)
                .send({ role: 'participant' })
                .expect(200)
                .expect((res) => {
                expect(res.body.status).toBe('success');
                expect(res.body.data).toHaveProperty('token');
            });
        });
        it('should validate role parameter', () => {
            return request(app.getHttpServer())
                .post(`/media-sessions/${mockSession.id}/join`)
                .set('Authorization', `Bearer ${generateAuthToken()}`)
                .send({ role: 'invalid-role' })
                .expect(400);
        });
    });
    describe('GET /media-sessions/:sessionId', () => {
        it('should get session details', () => {
            return request(app.getHttpServer())
                .get(`/media-sessions/${mockSession.id}`)
                .set('Authorization', `Bearer ${generateAuthToken()}`)
                .expect(200)
                .expect((res) => {
                expect(res.body.status).toBe('success');
                expect(res.body.data).toHaveProperty('id', mockSession.id);
            });
        });
        it('should return 404 for non-existent session', async () => {
            jest.spyOn(mediaSessionRepository, 'findById').mockResolvedValueOnce(null);
            return request(app.getHttpServer())
                .get('/media-sessions/non-existent')
                .set('Authorization', `Bearer ${generateAuthToken()}`)
                .expect(404);
        });
    });
    describe('DELETE /media-sessions/:sessionId/leave', () => {
        it('should allow a user to leave a session', () => {
            return request(app.getHttpServer())
                .delete(`/media-sessions/${mockSession.id}/leave`)
                .set('Authorization', `Bearer ${generateAuthToken()}`)
                .expect(200)
                .expect((res) => {
                expect(res.body.status).toBe('success');
                expect(res.body.message).toBe('Successfully left the session');
            });
        });
    });
});
//# sourceMappingURL=media.controller.spec.js.map