import { ChatsService } from './chats.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesQueryDto } from './dto/messages-query.dto';
export declare class ChatsController {
    private readonly chatsService;
    constructor(chatsService: ChatsService);
    getChats(req: any): Promise<import("./types/chats.types").ChatResponse[]>;
    getMessages(req: any, chatId: string, query: MessagesQueryDto): Promise<import("./types/chats.types").MessageResponse[]>;
    sendMessage(req: any, chatId: string, dto: SendMessageDto): Promise<import("./types/chats.types").MessageResponse>;
}
