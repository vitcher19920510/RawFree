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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const feed_service_1 = require("./feed.service");
const feed_action_dto_1 = require("./dto/feed-action.dto");
const feed_query_dto_1 = require("./dto/feed-query.dto");
let FeedController = class FeedController {
    constructor(feedService) {
        this.feedService = feedService;
    }
    async getFeed(req, query) {
        return this.feedService.getFeed(req.user.sub, query.page, query.limit);
    }
    async like(req, dto) {
        return this.feedService.like(req.user.sub, dto);
    }
    async skip(req, dto) {
        return this.feedService.skip(req.user.sub, dto);
    }
    async superlike(req, dto) {
        return this.feedService.superlike(req.user.sub, dto);
    }
};
exports.FeedController = FeedController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, feed_query_dto_1.FeedQueryDto]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Post)('like'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, feed_action_dto_1.FeedActionDto]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "like", null);
__decorate([
    (0, common_1.Post)('skip'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, feed_action_dto_1.FeedActionDto]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "skip", null);
__decorate([
    (0, common_1.Post)('superlike'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, feed_action_dto_1.FeedActionDto]),
    __metadata("design:returntype", Promise)
], FeedController.prototype, "superlike", null);
exports.FeedController = FeedController = __decorate([
    (0, common_1.Controller)('api/v1/feed'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [feed_service_1.FeedService])
], FeedController);
//# sourceMappingURL=feed.controller.js.map