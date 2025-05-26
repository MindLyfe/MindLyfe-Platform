import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let postId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    // TODO: Obtain a valid JWT token for test user
    jwtToken = 'test-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a post (public)', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ title: 'Test Post', content: 'Hello world!' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    postId = res.body.id;
  });

  it('should list posts (privacy filter)', async () => {
    const res = await request(app.getHttpServer())
      .get('/posts')
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a post by ID (privacy check)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(postId);
  });

  it('should update a post (owner only)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/posts/${postId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('should delete a post (owner only)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should report a post', async () => {
    // Create a new post to report
    const createRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ title: 'Report Me', content: 'Please report me!' });
    const reportId = createRes.body.id;
    const res = await request(app.getHttpServer())
      .post(`/posts/${reportId}/report`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ reason: 'Inappropriate content' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should moderate a post (moderator only)', async () => {
    // TODO: Use a moderator/admin JWT token
    const moderatorToken = 'moderator-jwt-token';
    const createRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ title: 'Moderate Me', content: 'Needs review.' });
    const modId = createRes.body.id;
    const res = await request(app.getHttpServer())
      .patch(`/posts/${modId}/moderate`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ status: 'approved' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBeDefined();
  });
}); 