"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const jwt_1 = require("@nestjs/jwt");
const media_controller_1 = require("./media.controller");
const video_service_1 = require("../services/video.service");
const media_session_repository_1 = require("../repositories/media-session.repository");
const media_session_entity_1 = require("../entities/media-session.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
describe('MediaController Features (e2e)', () => {
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
            breakoutRooms: true,
            waitingRoom: true,
        },
    };
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            controllers: [media_controller_1.MediaController],
            providers: [
                {
                    provide: video_service_1.VideoService,
                    useValue: {
                        createBreakoutRooms: jest.fn().mockResolvedValue([
                            { id: 'room-1', name: 'Breakout Room 1', participants: [] },
                        ]),
                        joinBreakoutRoom: jest.fn().mockResolvedValue({ token: 'breakout-token' }),
                        endBreakoutRooms: jest.fn().mockResolvedValue(undefined),
                        getWaitingRoomParticipants: jest.fn().mockResolvedValue([
                            { id: mockUser.id, name: `${mockUser.firstName} ${mockUser.lastName}` },
                        ]),
                        admitFromWaitingRoom: jest.fn().mockResolvedValue({ token: 'admitted-token' }),
                        rejectFromWaitingRoom: jest.fn().mockResolvedValue(undefined),
                        updateSessionSettings: jest.fn().mockResolvedValue(undefined),
                        getSessionStats: jest.fn().mockResolvedValue({
                            participantCount: 1,
                            recordingStatus: 'stopped',
                            chatMessageCount: 0,
                            averageConnectionQuality: 'good',
                        }),
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
    describe('Breakout Rooms', () => {
        describe('POST /media-sessions/:sessionId/breakout-rooms', () => {
            it('should allow host to create breakout rooms', () => {
                return request(app.getHttpServer())
                    .post(`/media-sessions/${mockSession.id}/breakout-rooms`)
                    .set('Authorization', `Bearer ${generateAuthToken(mockHost)}`)
                    .send([
                    {
                        name: 'Breakout Room 1',
                        hostId: mockHost.id,
                    },
                ])
                    .expect(201)
                    .expect((res) => {
                    expect(res.body.status).toBe('success');
                    expect(Array.isArray(res.body.data)).toBe(true);
                    expect(res.body.data[0]).toHaveProperty('id');
                    expect(res.body.data[0]).toHaveProperty('name', 'Breakout Room 1');
                });
            });
            it('should prevent non-hosts from creating breakout rooms', () => {
                return request(app.getHttpServer())
                    .post(`/media-sessions/${mockSession.id}/breakout-rooms`)
                    .set('Authorization', `Bearer ${generateAuthToken()}`)
                    .send([
                    {
                        name: 'Breakout Room 1',
                        hostId: mockHost.id,
                    },
                ])
                    .expect(403);
            });
        });
        describe('POST /media-sessions/:sessionId/breakout-rooms/:roomId/join', () => {
            it('should allow participants to join breakout rooms', () => {
                return request(app.getHttpServer())
                    .post(`/media-sessions/${mockSession.id}/breakout-rooms/room-1/join`)
                    .set('Authorization', `Bearer ${generateAuthToken()}`)
                    .expect(200)
                    .expect((res) => {
                    expect(res.body.status).toBe('success');
                    expect(res.body.data).toHaveProperty('token');
                });
            });
        });
        describe('POST /media-sessions/:sessionId/breakout-rooms/end', () => {
            it('should allow host to end breakout rooms', () => {
                return request(app.getHttpServer())
                    .post(`/media-sessions/${mockSession.id}/breakout-rooms/end`)
                    .set('Authorization', `Bearer ${generateAuthToken(mockHost)}`)
                    .expect(200)
                    .expect((res) => {
                    expect(res.body.status).toBe('success');
                    expect(res.body.message).toBe('Breakout rooms ended successfully');
                });
            });
            it('should prevent non-hosts from ending breakout rooms', () => {
                return request(app.getHttpServer())
                    .post(`/media-sessions/${mockSession.id}/breakout-rooms/end`)
                    .set('Authorization', `Bearer ${generateAuthToken()}`)
                    .expect(403);
            });
        });
    });
    describe('Waiting Room', () => {
        describe('GET /media-sessions/:sessionId/waiting-room', () => {
            it('should allow host to view waiting room', () => {
                return request(app.getHttpServer())
                    .get(`/media-sessions/${mockSession.id}/waiting-room`)
                    .set('Authorization', `Bearer ${generateAuthToken(mockHost)}`)
                    .expect(200)
                    .expect((res) => {
                    expect(res.body.status).toBe('success');
                    expect(Array.isArray(res.body.data)).toBe(true);
                    expect(res.body.data[0]).toHaveProperty('id', mockUser.id);
                });
            });
            it('should prevent non-hosts from viewing waiting room', () => {
                return request(app.getHttpServer())
                    .get(`/media-sessions/${mockSession.id}/waiting-room`)
                    .set('Authorization', `Bearer ${generateAuthToken()}`)
                    .expect(403);
            });
        });
        describe('POST /media-sessions/:sessionId/waiting-room/admit', () => {
            it('should allow host to admit participants', () => {
                return request(app.getHttpServer())
                    .post(`/media-sessions/${mockSession.id}/waiting-room/admit`)
                    .set('Authorization', `Bearer ${generateAuthToken(mockHost)}`)
                    .send({ participantId: mockUser.id })
                    .expect(200)
                    .expect((res) => {
                    expect(res.body.status).toBe('success');
                    expect(res.body.data).toHaveProperty('token');
                });
            });
            it('should prevent non-hosts from admitting participants', () => {
                return request(app.getHttpServer())
                    .post(`/media-sessions/${mockSession.id}/waiting-room/admit`)
                    .set('Authorization', `Bearer ${generateAuthToken()}`)
                    .send({ participantId: mockUser.id })
                    .expect(403);
            });
        });
        describe('POST /media-sessions/:sessionId/waiting-room/reject', () => {
            it('should allow host to reject participants', () => {
                return request(app.getHttpServer())
                    .post(`/media-sessions/${mockSession.id}/waiting-room/reject`)
                    .set('Authorization', `Bearer ${generateAuthToken(mockHost)}`)
                    .send({ participantId: mockUser.id })
                    .expect(200)
                    .expect((res) => {
                    expect(res.body.status).toBe('success');
                    expect(res.body.message).toBe('Participant rejected successfully');
                });
            });
            it('should prevent non-hosts from rejecting participants', () => {
                return request(app.getHttpServer())
                    .post(`/media-sessions/${mockSession.id}/waiting-room/reject`)
                    .set('Authorization', `Bearer ${generateAuthToken()}`)
                    .send({ participantId: mockUser.id })
                    .expect(403);
            });
        });
    });
    describe('Session Settings and Stats', () => {
        describe('PATCH /media-sessions/:sessionId/settings', () => {
            it('should allow host to update session settings', () => {
                return request(app.getHttpServer())
                    .patch(`/media-sessions/${mockSession.id}/settings`)
                    .set('Authorization', `Bearer ${generateAuthToken(mockHost)}`)
                    .send({
                    recording: true,
                    chat: true,
                    screenSharing: true,
                })
                    .expect(200)
                    .expect((res) => {
                    expect(res.body.status).toBe('success');
                    expect(res.body.message).toBe('Session settings updated successfully');
                });
            });
            it('should prevent non-hosts from updating settings', () => {
                return request(app.getHttpServer())
                    .patch(`/media-sessions/${mockSession.id}/settings`)
                    .set('Authorization', `Bearer ${generateAuthToken()}`)
                    .send({
                    recording: true,
                })
                    .expect(403);
            });
        });
        describe('GET /media-sessions/:sessionId/stats', () => {
            it('should allow participants to view session stats', () => {
                return request(app.getHttpServer())
                    .get(`/media-sessions/${mockSession.id}/stats`)
                    .set('Authorization', `Bearer ${generateAuthToken()}`)
                    .expect(200)
                    .expect((res) => {
                    expect(res.body.status).toBe('success');
                    expect(res.body.data).toHaveProperty('participantCount');
                    expect(res.body.data).toHaveProperty('recordingStatus');
                    expect(res.body.data).toHaveProperty('chatMessageCount');
                    expect(res.body.data).toHaveProperty('averageConnectionQuality');
                });
            });
            it('should prevent non-participants from viewing stats', async () => {
                jest.spyOn(mediaSessionRepository, 'findOne').mockResolvedValueOnce({
                    ...mockSession,
                    participants: [mockHost.id],
                    startedAt: new Date(),
                    endedAt: null,
                    updatedAt: new Date(),
                });
                return request(app.getHttpServer())
                    .get(`/media-sessions/${mockSession.id}/stats`)
                    .set('Authorization', `Bearer ${generateAuthToken()}`)
                    .expect(403);
            });
        });
    });
});
//# sourceMappingURL=media.controller.features.spec.js.map