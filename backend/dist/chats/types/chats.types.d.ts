export interface MessageSender {
    userId: string;
    name: string;
    photoUrl: string | null;
}
export interface MessageResponse {
    id: string;
    chatId: string;
    senderId: string;
    text: string | null;
    mediaType: string | null;
    mediaUrl: string | null;
    posterUrl: string | null;
    durationMs: number | null;
    width: number | null;
    height: number | null;
    sizeBytes: number | null;
    status: string;
    createdAt: Date;
    readAt: Date | null;
    sender: MessageSender;
}
export interface ChatResponse {
    chatId: string | null;
    matchId: string;
    peerUser: {
        userId: string;
        name: string;
        photoUrl: string | null;
    };
    lastMessage: {
        text: string | null;
        mediaType: string | null;
        createdAt: Date | null;
    } | null;
    unreadCount: number;
    updatedAt: Date;
}
