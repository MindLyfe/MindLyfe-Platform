import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserStatus } from '../src/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../src/shared/services/email.service';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';
import { createTestDataSource } from './utils/test-db.utils';

// Mock services
const mockEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
};

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let verificationToken: string;
  let userId: string;
  let accessToken: string;
  let refreshToken: string;
  let mfaSecret: string;

  beforeAll(async () => {
    dataSource = await createTestDataSource();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
      ],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    userRepository = moduleFixture.get(getRepositoryToken(User));
    jwtService = moduleFixture.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  it('should register a new user', async () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Registration successful');
    
    userId = response.body.userId;
    
    // Verify the EmailService was called with the correct parameters
    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
      registerDto.email,
      expect.any(String)
    );
    
    // Capture the verification token for the next test
    const user = await userRepository.findOne({ where: { id: userId } });
    verificationToken = user.verificationToken;
  });

  it('should verify the email address', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: verificationToken })
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Email verification successful');
    
    // Verify the user status was updated
    const user = await userRepository.findOne({ where: { id: userId } });
    expect(user.emailVerified).toBe(true);
    expect(user.status).toBe(UserStatus.ACTIVE);
    expect(user.verificationToken).toBeNull();
  });

  it('should login the verified user', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('userId');
    expect(response.body.userId).toBe(userId);
    
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('should refresh the token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    
    // Update tokens for future tests
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('should generate MFA secret', async () => {
    const response = await request(app.getHttpServer())
      .post('/mfa/generate')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(response.body).toHaveProperty('secret');
    expect(response.body).toHaveProperty('qrCode');
    
    mfaSecret = response.body.secret;
  });

  it('should enable MFA with valid token', async () => {
    // Generate a valid TOTP token
    const token = speakeasy.totp({
      secret: mfaSecret,
      encoding: 'base32',
    });

    const response = await request(app.getHttpServer())
      .post('/mfa/enable')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ token })
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Two-factor authentication has been enabled');
    
    // Verify MFA was enabled in the database
    const user = await userRepository.findOne({ where: { id: userId } });
    expect(user.twoFactorEnabled).toBe(true);
    expect(user.twoFactorSecret).toBe(mfaSecret);
  });

  it('should require MFA verification on login when MFA is enabled', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200);

    expect(response.body).toHaveProperty('requiresMfa');
    expect(response.body.requiresMfa).toBe(true);
    expect(response.body).toHaveProperty('tempToken');
    expect(response.body).toHaveProperty('userId');
  });

  it('should verify MFA token and complete login', async () => {
    // Generate a valid TOTP token
    const token = speakeasy.totp({
      secret: mfaSecret,
      encoding: 'base32',
    });

    const response = await request(app.getHttpServer())
      .post('/mfa/verify')
      .send({ userId, token })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('userId');
    expect(response.body.userId).toBe(userId);
    
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('should logout the user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-session-id', 'session-id') // This would be the real session ID in practice
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Logged out successfully');
  });
}); 