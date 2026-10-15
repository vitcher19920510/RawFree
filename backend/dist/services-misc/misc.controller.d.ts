import { MiscService } from './misc.service';
import { SendReportDto } from './dto/report.dto';
import { BlockUserDto } from './dto/blocked.dto';
import { UpdateInterestsDto } from './dto/interests.dto';
import { CreateClientErrorDto } from './dto/client-error.dto';
export declare class MiscController {
    private readonly miscService;
    constructor(miscService: MiscService);
    enableIncognito(req: any): Promise<{
        enabled: boolean;
    }>;
    disableIncognito(req: any): Promise<{
        enabled: boolean;
    }>;
    getBlockedUsers(req: any): Promise<import("./types/misc.types").BlockedUserCard[]>;
    blockUser(req: any, dto: BlockUserDto): Promise<{
        success: boolean;
    }>;
    unblockUser(req: any, targetId: string): Promise<{
        success: boolean;
    }>;
    sendReport(req: any, dto: SendReportDto): Promise<{
        success: boolean;
    }>;
    getInterests(req: any): Promise<string[]>;
    updateInterests(req: any, dto: UpdateInterestsDto): Promise<{
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
