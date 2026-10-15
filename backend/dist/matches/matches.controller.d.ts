import { MatchesService } from './matches.service';
export declare class MatchesController {
    private readonly matchesService;
    constructor(matchesService: MatchesService);
    getMatches(req: any): Promise<import("./types/matches.types").MatchCard[]>;
}
