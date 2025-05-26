import { DataSource } from 'typeorm';
import { User } from '../../src/entities/user.entity';
import { UserSession } from '../../src/entities/user-session.entity';

/**
 * Creates a test database connection for integration tests
 * Uses SQLite in-memory database for speed and isolation
 */
export async function createTestDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [User, UserSession],
    synchronize: true,
    dropSchema: true,
    logging: false,
  });

  return dataSource.initialize();
}

/**
 * Cleans up the test database by dropping all tables and data
 */
export async function cleanupTestDatabase(dataSource: DataSource): Promise<void> {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  }
} 