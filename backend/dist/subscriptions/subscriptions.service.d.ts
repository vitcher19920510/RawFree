import { PrismaService } from '../prisma/prisma.service';
import { VerifyPurchaseDto } from './dto/verify-purchase.dto';
export declare class SubscriptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    hasActive(userId: string): Promise<boolean>;
    verifyPurchase(userId: string, dto: VerifyPurchaseDto): Promise<{
        status: string;
        expiresAt: Date;
    }>;
    getStatus(userId: string): Promise<{
        isActive: boolean;
        plan?: string;
        expiresAt?: Date;
    }>;
    cancelSubscription(userId: string, reason?: string): Promise<{
        success: boolean;
        accessUntil: Date;
    }>;
}
