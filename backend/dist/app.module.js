"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
const common_module_1 = require("./common/common.module");
const jwt_global_module_1 = require("./common/jwt-global.module");
const auth_module_1 = require("./auth/auth.module");
const chats_module_1 = require("./chats/chats.module");
const feed_module_1 = require("./feed/feed.module");
const health_module_1 = require("./health/health.module");
const matches_module_1 = require("./matches/matches.module");
const profile_module_1 = require("./profile/profile.module");
const misc_module_1 = require("./services-misc/misc.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            common_module_1.CommonModule,
            jwt_global_module_1.JwtGlobalModule,
            auth_module_1.AuthModule,
            chats_module_1.ChatsModule,
            feed_module_1.FeedModule,
            health_module_1.HealthModule,
            matches_module_1.MatchesModule,
            profile_module_1.ProfileModule,
            misc_module_1.MiscModule,
            subscriptions_module_1.SubscriptionsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map