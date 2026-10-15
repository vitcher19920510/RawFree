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
exports.MiscController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../common/decorators/public.decorator");
const misc_service_1 = require("./misc.service");
const report_dto_1 = require("./dto/report.dto");
const blocked_dto_1 = require("./dto/blocked.dto");
const interests_dto_1 = require("./dto/interests.dto");
const client_error_dto_1 = require("./dto/client-error.dto");
let MiscController = class MiscController {
    constructor(miscService) {
        this.miscService = miscService;
    }
    async enableIncognito(req) {
        return this.miscService.enableIncognito(req.user.sub);
    }
    async disableIncognito(req) {
        return this.miscService.disableIncognito(req.user.sub);
    }
    async getBlockedUsers(req) {
        return this.miscService.getBlockedUsers(req.user.sub);
    }
    async blockUser(req, dto) {
        return this.miscService.blockUser(req.user.sub, dto);
    }
    async unblockUser(req, targetId) {
        return this.miscService.unblockUser(req.user.sub, targetId);
    }
    async sendReport(req, dto) {
        return this.miscService.sendReport(req.user.sub, dto);
    }
    async getInterests(req) {
        return this.miscService.getInterests(req.user.sub);
    }
    async updateInterests(req, dto) {
        return this.miscService.updateInterests(req.user.sub, dto);
    }
    async getLegalDoc(code) {
        return this.miscService.getLegalDoc(code);
    }
    async logClientError(dto) {
        return this.miscService.logClientError(dto);
    }
};
exports.MiscController = MiscController;
__decorate([
    (0, common_1.Post)('incognito'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "enableIncognito", null);
__decorate([
    (0, common_1.Delete)('incognito'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "disableIncognito", null);
__decorate([
    (0, common_1.Get)('blocked'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "getBlockedUsers", null);
__decorate([
    (0, common_1.Post)('blocked'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, blocked_dto_1.BlockUserDto]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Delete)('blocked/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.Post)('reports'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_dto_1.SendReportDto]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "sendReport", null);
__decorate([
    (0, common_1.Get)('interests'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "getInterests", null);
__decorate([
    (0, common_1.Put)('interests'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, interests_dto_1.UpdateInterestsDto]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "updateInterests", null);
__decorate([
    (0, common_1.Get)('legal/:code'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "getLegalDoc", null);
__decorate([
    (0, common_1.Post)('client-errors'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [client_error_dto_1.CreateClientErrorDto]),
    __metadata("design:returntype", Promise)
], MiscController.prototype, "logClientError", null);
exports.MiscController = MiscController = __decorate([
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [misc_service_1.MiscService])
], MiscController);
//# sourceMappingURL=misc.controller.js.map