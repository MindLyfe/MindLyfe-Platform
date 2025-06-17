"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LyfbotModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const lyfbot_controller_1 = require("../controllers/lyfbot.controller");
const lyfbot_service_1 = require("../services/lyfbot.service");
let LyfbotModule = class LyfbotModule {
};
LyfbotModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, config_1.ConfigModule],
        controllers: [lyfbot_controller_1.LyfbotController],
        providers: [lyfbot_service_1.LyfbotService],
        exports: [lyfbot_service_1.LyfbotService],
    })
], LyfbotModule);
exports.LyfbotModule = LyfbotModule;
//# sourceMappingURL=lyfbot.module.js.map