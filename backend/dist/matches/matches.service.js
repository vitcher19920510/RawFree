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
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MatchesService = class MatchesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMatches(userId) {
        const userBlocks = await this.prisma.blocked.findMany({
            where: { OR: [{ userId }, { blockedUserId: userId }] },
            select: { userId: true, blockedUserId: true },
        });
        const blockedIds = userBlocks
            .map((b) => (b.userId === userId ? b.blockedUserId : b.userId))
            .filter((id) => id !== userId);
        const matches = await this.prisma.match.findMany({
            where: {
                AND: [
                    { OR: [{ userA: userId }, { userB: userId }] },
                    ...(blockedIds.length > 0
                        ? [
                            {
                                NOT: {
                                    OR: [
                                        { userA: { in: blockedIds } },
                                        { userB: { in: blockedIds } },
                                    ],
                                },
                            },
                        ]
                        : []),
                    {
                        OR: [
                            { chat: { is: null } },
                            { chat: { messages: { none: {} } } },
                        ],
                    },
                ],
            },
            include: {
                chat: true,
            },
        });
        const peerUserIds = matches.map((m) => (m.userA === userId ? m.userB : m.userA));
        const users = await this.prisma.user.findMany({
            where: { id: { in: peerUserIds } },
            include: {
                profile: true,
                photos: { where: { isMain: true }, take: 1 },
            },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        const resultCards = matches.map((m) => {
            const peerId = m.userA === userId ? m.userB : m.userA;
            const peerUser = userMap.get(peerId);
            const updatedAt = m.chat?.lastMessageAt || m.chat?.createdAt || m.createdAt;
            return {
                matchId: m.id,
                chatId: m.chat?.id || null,
                user: {
                    userId: peerId,
                    name: peerUser?.profile?.name || 'Пользователь',
                    age: peerUser?.profile?.age ?? null,
                    photoUrl: peerUser?.photos[0]?.url || null,
                },
                lastMessage: null,
                unreadCount: 0,
                createdAt: m.createdAt,
                updatedAt,
            };
        });
        resultCards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        return resultCards;
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchesService);
//# sourceMappingURL=matches.service.js.map