import { PrismaService } from '../prisma/prisma.service';
import { SendReportDto } from './dto/report.dto';
import { BlockUserDto } from './dto/blocked.dto';
import { UpdateInterestsDto } from './dto/interests.dto';
import { CreateClientErrorDto } from './dto/client-error.dto';
import { BlockedUserCard } from './types/misc.types';
export declare class MiscService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    enableIncognito(userId: string): Promise<{
        enabled: boolean;
    }>;
    disableIncognito(userId: string): Promise<{
        enabled: boolean;
    }>;
    getBlockedUsers(userId: string): Promise<BlockedUserCard[]>;
    blockUser(userId: string, dto: BlockUserDto): Promise<{
        success: boolean;
    }>;
    unblockUser(userId: string, targetId: string): Promise<{
        success: boolean;
    }>;
    sendReport(userId: string, dto: SendReportDto): Promise<{
        success: boolean;
    }>;
    getInterests(userId: string): Promise<string[]>;
    updateInterests(userId: string, dto: UpdateInterestsDto): Promise<{
        success: boolean;
    }>;
    getLegalDoc(code: string): Promise<{
        code: string;
        title: string;
        body: string;
        version: string;
    }>;
    logClientError(dto: CreateClientErrorDto): Promise<{
        logged: boolean;
    }>;
}
