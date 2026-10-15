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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PLAN_CATALOG = {
    premium_7: { days: 7, priceCents: 39900 },
    premium_30: { days: 30, priceCents: 99900 },
    premium_365: { days: 365, priceCents: 499900 },
};
let SubscriptionsService = class SubscriptionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async hasActive(userId) {
        const sub = await this.prisma.subscription.findFirst({
            where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
            select: { id: true },
        });
        return sub !== null;
    }
    async verifyPurchase(userId, dto) {
        const plan = PLAN_CATALOG[dto.plan];
        if (!plan) {
            throw new common_1.BadRequestException('Неизвестный тариф подписки');
        }
        const existingSub = await this.prisma.subscription.findFirst({
            where: {
                userId,
                purchaseToken: dto.purchaseToken,
                status: 'ACTIVE',
            },
            select: { status: true, expiresAt: true },
        });
        if (existingSub) {
            return { status: existingSub.status, expiresAt: existingSub.expiresAt };
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.subscription.updateMany({
                where: { userId, status: 'ACTIVE' },
                data: { status: 'CANCELLED' },
            });
            const expiresAt = new Date(Date.now() + plan.days * 86400000);
            const newSub = await tx.subscription.create({
                data: {
                    userId,
                    plan: dto.plan,
                    priceCents: plan.priceCents,
                    currency: 'RUB',
                    platform: dto.platform || 'RUSTORE',
                    purchaseToken: dto.purchaseToken,
                    status: 'ACTIVE',
                    autoRenew: true,
                    expiresAt,
                },
                select: { status: true, expiresAt: true },
            });
            return newSub;
        });
    }
    async getStatus(userId) {
        const sub = await this.prisma.subscription.findFirst({
            where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
            select: { plan: true, expiresAt: true },
        });
        if (!sub) {
            return { isActive: false };
        }
        return {
            isActive: true,
            plan: sub.plan,
            expiresAt: sub.expiresAt,
        };
    }
    async cancelSubscription(userId, reason) {
        const sub = await this.prisma.subscription.findFirst({
            where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
        });
        if (!sub) {
            throw new common_1.NotFoundException('Активная подписка не найдена');
        }
        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { autoRenew: false },
        });
        return { success: true, accessUntil: sub.expiresAt };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map