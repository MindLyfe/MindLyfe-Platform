"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const follow_entity_1 = require("./entities/follow.entity");
const user_entity_1 = require("../users/entities/user.entity");
const follows_controller_1 = require("./follows.controller");
const follows_service_1 = require("./follows.service");
const anonymity_service_1 = require("../common/services/anonymity.service");
const user_mapping_service_1 = require("../common/services/user-mapping.service");
const community_gateway_1 = require("../community.gateway");
let FollowsModule = class FollowsModule {
};
exports.FollowsModule = FollowsModule;
exports.FollowsModule = FollowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([follow_entity_1.Follow, user_entity_1.User])
        ],
        controllers: [follows_controller_1.FollowsController],
        providers: [
            follows_service_1.FollowsService,
            anonymity_service_1.AnonymityService,
            user_mapping_service_1.UserMappingService,
            community_gateway_1.CommunityGateway
        ],
        exports: [follows_service_1.FollowsService],
    })
], FollowsModule);
//# sourceMappingURL=follows.module.js.map