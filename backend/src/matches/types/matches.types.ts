export interface MatchUser {
  userId: string;
  name: string;
  age: number | null;
  photoUrl: string | null;
}

export interface MatchLastMessage {
  text: string | null;
  mediaType: string | null;
  createdAt: Date | null;
}

export interface MatchCard {
  matchId: string;
  chatId: string | null;
  user: MatchUser;
  lastMessage: MatchLastMessage | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
