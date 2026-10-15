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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MiscService = class MiscService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async enableIncognito(userId) {
        const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await this.prisma.incognito.upsert({
            where: { userId },
            create: {
                userId,
                until,
                mode: 'FULL',
            },
            update: {
                until,
                mode: 'FULL',
            },
        });
        return { enabled: true };
    }
    async disableIncognito(userId) {
        await this.prisma.incognito.deleteMany({
            where: { userId },
        });
        return { enabled: false };
    }
    async getBlockedUsers(userId) {
        const blockedRecords = await this.prisma.blocked.findMany({
            where: { userId },
            include: {
                blockedUser: {
                    include: {
                        profile: true,
                        photos: { where: { isMain: true }, take: 1 },
                    },
                },
            },
        });
        return blockedRecords.map((r) => ({
            userId: r.blockedUserId,
            name: r.blockedUser.profile?.name ?? 'Пользователь',
            age: r.blockedUser.profile?.age ?? null,
            photoUrl: r.blockedUser.photos[0]?.url ?? null,
        }));
    }
    async blockUser(userId, dto) {
        if (dto.blockedUserId === userId) {
            throw new common_1.BadRequestException('Нельзя заблокировать самого себя');
        }
        await this.prisma.blocked.upsert({
            where: {
                userId_blockedUserId: {
                    userId,
                    blockedUserId: dto.blockedUserId,
                },
            },
            create: {
                userId,
                blockedUserId: dto.blockedUserId,
            },
            update: {},
        });
        return { success: true };
    }
    async unblockUser(userId, targetId) {
        await this.prisma.blocked.deleteMany({
            where: {
                userId,
                blockedUserId: targetId,
            },
        });
        return { success: true };
    }
    async sendReport(userId, dto) {
        if (dto.toUser === userId) {
            throw new common_1.BadRequestException('Нельзя пожаловаться на самого себя');
        }
        await this.prisma.report.create({
            data: {
                fromUser: userId,
                toUser: dto.toUser,
                reason: dto.reason,
                comment: dto.comment ?? '',
            },
        });
        return { success: true };
    }
    async getInterests(userId) {
        const interests = await this.prisma.interest.findMany({
            where: { userId },
            select: { tag: true },
        });
        return interests.map((i) => i.tag);
    }
    async updateInterests(userId, dto) {
        await this.prisma.$transaction(async (tx) => {
            await tx.interest.deleteMany({ where: { userId } });
            if (dto.tags && dto.tags.length > 0) {
                await tx.interest.createMany({
                    data: dto.tags.map((tag) => ({
                        userId,
                        tag,
                        type: 'MANUAL',
                    })),
                });
            }
        });
        return { success: true };
    }
    async getLegalDoc(code) {
        const doc = await this.prisma.legalDoc.findUnique({ where: { code } });
        if (!doc) {
            throw new common_1.NotFoundException('Документ не найден');
        }
        return {
            code: doc.code,
            title: doc.title,
            body: doc.body,
            version: doc.version,
        };
    }
    async logClientError(dto) {
        await this.prisma.clientError.create({
            data: {
                userId: dto.userId ?? null,
                screen: dto.screen,
                description: dto.description,
                appVersion: dto.appVersion,
                device: dto.device,
                osVersion: dto.osVersion,
                repeats: dto.repeats ?? 1,
            },
        });
        return { logged: true };
    }
};
exports.MiscService = MiscService;
exports.MiscService = MiscService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MiscService);
//# sourceMappingURL=misc.service.js.map