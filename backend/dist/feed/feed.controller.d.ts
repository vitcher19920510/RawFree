import { FeedService } from './feed.service';
import { FeedActionDto } from './dto/feed-action.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
export declare class FeedController {
    private readonly feedService;
    constructor(feedService: FeedService);
    getFeed(req: any, query: FeedQueryDto): Promise<import("./types/feed.types").FeedCard[]>;
    like(req: any, dto: FeedActionDto): Promise<{
        isMatch: boolean;
        matchId?: string;
    }>;
    skip(req: any, dto: FeedActionDto): Promise<{
        success: boolean;
    }>;
    superlike(req: any, dto: FeedActionDto): Promise<{
        isMatch: boolean;
        matchId?: string;
    }>;
}
