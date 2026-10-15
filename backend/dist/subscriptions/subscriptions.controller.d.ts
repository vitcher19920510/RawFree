import { SubscriptionsService } from './subscriptions.service';
import { VerifyPurchaseDto } from './dto/verify-purchase.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    verifyPurchase(req: any, dto: VerifyPurchaseDto): Promise<{
        status: string;
        expiresAt: Date;
    }>;
    getStatus(req: any): Promise<{
        isActive: boolean;
        plan?: string;
        expiresAt?: Date;
    }>;
    cancelSubscription(req: any, reason?: string): Promise<{
        success: boolean;
        accessUntil: Date;
    }>;
}
