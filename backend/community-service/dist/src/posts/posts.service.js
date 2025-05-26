"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const post_entity_1 = require("./entities/post.entity");
const auth_client_1 = require("@mindlyf/shared/auth-client");
const community_gateway_1 = require("../community.gateway");
let PostsService = class PostsService {
    constructor(postRepo, authClient, gateway) {
        this.postRepo = postRepo;
        this.authClient = authClient;
        this.gateway = gateway;
    }
    async create(dto, user) {
    }
    async list(query, user) {
    }
    async get(id, user) {
    }
    async update(id, dto, user) {
    }
    async delete(id, user) {
    }
    async report(id, dto, user) {
    }
    async moderate(id, dto, user) {
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof auth_client_1.AuthClientService !== "undefined" && auth_client_1.AuthClientService) === "function" ? _a : Object, community_gateway_1.CommunityGateway])
], PostsService);
//# sourceMappingURL=posts.service.js.map