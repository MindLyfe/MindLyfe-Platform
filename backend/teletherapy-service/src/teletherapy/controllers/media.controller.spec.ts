import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { MediaController } from './media.controller';
import { VideoService } from '../services/video.service';
import { MediaSessionRepository } from '../repositories/media-session.repository';
import { MediaSession, MediaSessionType, MediaSessionStatus } from '../entities/media-session.entity';
// User entity is managed by auth-service
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('MediaController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let mediaSessionRepository: Repository<MediaSession>;

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
    type: MediaSessionType.TELETHERAPY,
    contextId: 'context-1',
    startedBy: mockHost.id,
    status: MediaSessionStatus.ACTIVE,
    participants: [mockHost],
    metadata: {
      recording: false,
      chat: true,
      screenSharing: true,
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: VideoService,
          useValue: {
            createSession: jest.fn().mockResolvedValue(mockSession),
            joinSession: jest.fn().mockResolvedValue({ token: 'test-token' }),
            leaveSession: jest.fn().mockResolvedValue(undefined),
            startRecording: jest.fn().mockResolvedValue(undefined),
            stopRecording: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MediaSessionRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockSession),
            findActiveByContext: jest.fn().mockResolvedValue(mockSession),
            findByParticipant: jest.fn().mockResolvedValue([mockSession]),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-jwt-token'),
            verify: jest.fn().mockReturnValue({ sub: mockUser.id }),
          },
        },
        {
          provide: getRepositoryToken(MediaSession),
          useClass: Repository,
        },
        // User repository provider removed
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    mediaSessionRepository = moduleFixture.get<Repository<MediaSession>>(
      getRepositoryToken(MediaSession),
    );

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
          type: MediaSessionType.TELETHERAPY,
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
          expect(res.body.data.type).toBe(MediaSessionType.TELETHERAPY);
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
      jest.spyOn(mediaSessionRepository, 'findOne').mockResolvedValueOnce(null);

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