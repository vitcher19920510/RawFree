import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(req: any): Promise<import("./types/profile.types").ProfileResponse>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        success: boolean;
    }>;
    uploadPhoto(req: any, file: any): Promise<{
        photoId: string;
        url: string;
        isMain: boolean;
    }>;
    deletePhoto(req: any, photoId: string): Promise<{
        success: boolean;
    }>;
    hideProfile(req: any, hidden: boolean): Promise<{
        success: boolean;
    }>;
}
