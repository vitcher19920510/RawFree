import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatResponse, MessageResponse } from './types/chats.types';
export declare class ChatsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private verifyChatAccess;
    getChats(userId: string): Promise<ChatResponse[]>;
    getMessages(userId: string, chatId: string, limit: number, before?: string): Promise<MessageResponse[]>;
    sendMessage(userId: string, chatId: string, dto: SendMessageDto): Promise<MessageResponse>;
    markAsRead(userId: string, chatId: string): Promise<{
        updatedCount: number;
    }>;
}
