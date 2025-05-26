"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const user_entity_1 = require("../entities/user.entity");
const user_session_entity_1 = require("../entities/user-session.entity");
const organization_entity_1 = require("../entities/organization.entity");
const subscription_entity_1 = require("../entities/subscription.entity");
const therapy_session_entity_1 = require("../entities/therapy-session.entity");
const payment_entity_1 = require("../entities/payment.entity");
const _1689123456789_CreateUserSessionTable_1 = require("./migrations/1689123456789-CreateUserSessionTable");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
exports.default = new typeorm_1.DataSource({
    type: configService.get('database.type', 'postgres'),
    host: configService.get('database.host', 'localhost'),
    port: configService.get('database.port', 5432),
    username: configService.get('database.username', 'postgres'),
    password: configService.get('database.password', 'postgres'),
    database: configService.get('database.name', 'mindlyf_auth'),
    entities: [user_entity_1.User, user_session_entity_1.UserSession, organization_entity_1.Organization, subscription_entity_1.Subscription, therapy_session_entity_1.TherapySession, payment_entity_1.Payment],
    migrations: [_1689123456789_CreateUserSessionTable_1.CreateUserSessionTable1689123456789],
    ssl: configService.get('database.ssl', false) ? { rejectUnauthorized: false } : false,
});
//# sourceMappingURL=typeorm.config.js.map