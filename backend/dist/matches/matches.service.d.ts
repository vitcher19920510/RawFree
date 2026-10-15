import { PrismaService } from '../prisma/prisma.service';
import { MatchCard } from './types/matches.types';
export declare class MatchesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMatches(userId: string): Promise<MatchCard[]>;
}
