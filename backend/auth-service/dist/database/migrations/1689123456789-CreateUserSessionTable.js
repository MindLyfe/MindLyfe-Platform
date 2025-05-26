"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSessionTable1689123456789 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserSessionTable1689123456789 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'user_session',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'userId',
                    type: 'uuid',
                },
                {
                    name: 'refreshToken',
                    type: 'varchar',
                },
                {
                    name: 'ipAddress',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'userAgent',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'deviceInfo',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'lastUsedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'isRevoked',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'revokedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'revokedReason',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'expiresAt',
                    type: 'timestamp',
                },
            ],
        }), true);
        await queryRunner.createForeignKey('user_session', new typeorm_1.TableForeignKey({
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
            onDelete: 'CASCADE',
        }));
        await queryRunner.query('CREATE INDEX idx_user_session_refresh_token ON user_session (refreshToken);');
        await queryRunner.query('CREATE INDEX idx_user_session_user_id ON user_session (userId);');
        await queryRunner.query('CREATE INDEX idx_user_session_expires_at ON user_session (expiresAt);');
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX IF EXISTS idx_user_session_refresh_token;');
        await queryRunner.query('DROP INDEX IF EXISTS idx_user_session_user_id;');
        await queryRunner.query('DROP INDEX IF EXISTS idx_user_session_expires_at;');
        const table = await queryRunner.getTable('user_session');
        if (table) {
            const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('userId') !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey('user_session', foreignKey);
            }
            await queryRunner.dropTable('user_session');
        }
    }
}
exports.CreateUserSessionTable1689123456789 = CreateUserSessionTable1689123456789;
//# sourceMappingURL=1689123456789-CreateUserSessionTable.js.map