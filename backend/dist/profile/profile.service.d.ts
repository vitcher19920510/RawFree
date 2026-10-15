import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponse } from './types/profile.types';
export declare class ProfileService {
    private readonly prisma;
    private readonly storageService;
    constructor(prisma: PrismaService, storageService: StorageService);
    getProfile(userId: string, requestingUserId?: string): Promise<ProfileResponse>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        success: boolean;
    }>;
    uploadPhoto(userId: string, file: {
        buffer: Buffer;
        mimetype: string;
    }): Promise<{
        photoId: string;
        url: string;
        isMain: boolean;
    }>;
    deletePhoto(userId: string, photoId: string): Promise<{
        success: boolean;
    }>;
    hideProfile(userId: string, hidden: boolean): Promise<{
        success: boolean;
    }>;
}
