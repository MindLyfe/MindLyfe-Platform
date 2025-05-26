import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ReactionType } from '../src/reactions/entities/reaction.entity';

describe('ReactionsController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let postId: string;
  let commentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    // TODO: Obtain a valid JWT token for test user
    jwtToken = 'test-jwt-token';

    // Create a test post to react to
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ title: 'Test Post', content: 'Testing reactions' });
    postId = postRes.body.id;

    // Create a test comment to react to
    const commentRes = await request(app.getHttpServer())
      .post('/comments')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ postId, content: 'Test comment' });
    commentId = commentRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should add a reaction to a post', async () => {
    const res = await request(app.getHttpServer())
      .post('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ 
        postId, 
        type: ReactionType.LIKE,
        isAnonymous: false
      });
    expect(res.status).toBe(201);
    expect(res.body.postId).toBe(postId);
    expect(res.body.type).toBe(ReactionType.LIKE);
  });

  it('should add a reaction to a comment', async () => {
    const res = await request(app.getHttpServer())
      .post('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ 
        commentId, 
        type: ReactionType.HEART,
        isAnonymous: true
      });
    expect(res.status).toBe(201);
    expect(res.body.commentId).toBe(commentId);
    expect(res.body.type).toBe(ReactionType.HEART);
    expect(res.body.isAnonymous).toBe(true);
  });

  it('should not allow duplicate reactions of the same type', async () => {
    // Add a reaction first
    await request(app.getHttpServer())
      .post('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ 
        postId, 
        type: ReactionType.SUPPORT,
        isAnonymous: false
      });
    
    // Try to add the same reaction again
    const res = await request(app.getHttpServer())
      .post('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ 
        postId, 
        type: ReactionType.SUPPORT,
        isAnonymous: false
      });
    
    expect(res.status).toBe(400);
  });

  it('should remove a reaction from a post', async () => {
    // Add a reaction first
    await request(app.getHttpServer())
      .post('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ 
        postId, 
        type: ReactionType.CURIOUS,
        isAnonymous: false
      });
    
    // Remove the reaction
    const res = await request(app.getHttpServer())
      .delete('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ 
        postId, 
        type: ReactionType.CURIOUS 
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should list reactions for a post', async () => {
    const res = await request(app.getHttpServer())
      .get('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ postId });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('should list reactions for a comment', async () => {
    const res = await request(app.getHttpServer())
      .get('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ commentId });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('should get aggregated reaction counts', async () => {
    const res = await request(app.getHttpServer())
      .get('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ postId, aggregate: 'true' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('counts');
    expect(res.body).toHaveProperty('userReactions');
  });

  it('should validate both postId and commentId are not provided simultaneously', async () => {
    const res = await request(app.getHttpServer())
      .post('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ 
        postId,
        commentId, 
        type: ReactionType.LIKE
      });
    
    expect(res.status).toBe(400);
  });

  it('should validate either postId or commentId is provided', async () => {
    const res = await request(app.getHttpServer())
      .post('/reactions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ 
        type: ReactionType.LIKE
      });
    
    expect(res.status).toBe(400);
  });
}); 