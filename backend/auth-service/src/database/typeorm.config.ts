import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { Organization } from '../entities/organization.entity';
import { Subscription } from '../entities/subscription.entity';
import { TherapySession } from '../entities/therapy-session.entity';
import { Payment } from '../entities/payment.entity';
import { CreateUserSessionTable1689123456789 } from './migrations/1689123456789-CreateUserSessionTable';

// Load environment variables from .env file
config();

const configService = new ConfigService();

export default new DataSource({
  type: configService.get<any>('database.type', 'postgres'),
  host: configService.get<string>('database.host', 'localhost'),
  port: configService.get<number>('database.port', 5432),
  username: configService.get<string>('database.username', 'postgres'),
  password: configService.get<string>('database.password', 'postgres'),
  database: configService.get<string>('database.name', 'mindlyf_auth'),
  entities: [User, UserSession, Organization, Subscription, TherapySession, Payment],
  migrations: [CreateUserSessionTable1689123456789],
  ssl: configService.get<boolean>('database.ssl', false) ? { rejectUnauthorized: false } : false,
});