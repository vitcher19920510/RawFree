import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatsService } from './chats.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true,
  },
  namespace: 'ws/chats',
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatsGateway.name);
  // Храним map userId → SocketId для online-статуса
  private userSockets: Map<string, string> = new Map();

  constructor(
    private readonly chatsService: ChatsService,
    private readonly jwtService: JwtService,
  ) {}

  // ==================== CONNECTION ====================

  async handleConnection(client: Socket) {
    try {
      // JWT-аутентификация при подключении
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Подключение без токена от ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.type !== 'user') {
        this.logger.warn(`Не пользователь подключился: ${client.id}`);
        client.disconnect();
        return;
      }

      const userId = payload.sub;
      this.userSockets.set(userId, client.id);

      this.logger.log(`Пользователь ${userId} подключился: ${client.id}`);

      // Отправляем подтверждение подключения
      client.emit('connected', { userId });
    } catch (error) {
      this.logger.error(`Ошибка аутентификации WebSocket: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Находим userId по socketId и удаляем
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(`Пользователь ${userId} отключился`);
        // TODO: обновить online-статус в Redis
        break;
      }
    }
  }

  // ==================== EVENTS ====================

  /**
   * Присоединиться к чату (для получения сообщений)
   */
  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
    const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    const userId = payload.sub;

    // Проверяем доступ к чату
    try {
      await this.chatsService.verifyChatAccess?.(userId, data.chatId);
    } catch {
      client.emit('error', { message: 'Нет доступа к этому чату' });
      return;
    }

    client.join(data.chatId);
    this.logger.log(`Пользователь ${userId} вошёл в чат ${data.chatId}`);

    client.emit('chat_joined', { chatId: data.chatId });
  }

  /**
   * Отправить сообщение
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { chatId: string } & SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
    const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    const userId = payload.sub;

    try {
      const message = await this.chatsService.sendMessage(userId, data.chatId, {
        text: data.text,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        posterUrl: data.posterUrl,
        durationMs: data.durationMs,
        width: data.width,
        height: data.height,
        sizeBytes: data.sizeBytes,
      });

      // Отправляем сообщение получателю (peer)
      const peerId = await this.getPeerId(userId, data.chatId);
      if (peerId) {
        const peerSocketId = this.userSockets.get(peerId);
        if (peerSocketId) {
          this.server.to(peerSocketId).emit('message_received', {
            chatId: data.chatId,
            message,
          });
        }
      }

      // Отправляем отправителю подтверждение
      client.emit('message_sent', { message });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  /**
   * Отметить как прочитанное
   */
  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
    const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    const userId = payload.sub;

    try {
      const result = await this.chatsService.markAsRead(userId, data.chatId);
      client.emit('messages_read', { chatId: data.chatId, updatedCount: result.updatedCount });

      // Уведомляем собеседника
      const peerId = await this.getPeerId(userId, data.chatId);
      if (peerId) {
        const peerSocketId = this.userSockets.get(peerId);
        if (peerSocketId) {
          this.server.to(peerSocketId).emit('messages_read_by', { chatId: data.chatId, userId });
        }
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  /**
   * Индикатор набора текста
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
    const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    const userId = payload.sub;

    const peerId = await this.getPeerId(userId, data.chatId);
    if (peerId) {
      const peerSocketId = this.userSockets.get(peerId);
      if (peerSocketId) {
        this.server.to(peerSocketId).emit('user_typing', {
          chatId: data.chatId,
          userId,
          isTyping: true,
        });
      }
    }
  }

  @SubscribeMessage('stop_typing')
  async handleStopTyping(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
    const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    const userId = payload.sub;

    const peerId = await this.getPeerId(userId, data.chatId);
    if (peerId) {
      const peerSocketId = this.userSockets.get(peerId);
      if (peerSocketId) {
        this.server.to(peerSocketId).emit('user_typing', {
          chatId: data.chatId,
          userId,
          isTyping: false,
        });
      }
    }
  }

  // ==================== HELPERS ====================

  private async getPeerId(userId: string, chatId: string): Promise<string | null> {
    try {
      const chat = await this.chatsService['prisma'].chat.findUnique({
        where: { id: chatId },
        select: { match: { select: { userA: true, userB: true } } },
      });

      if (!chat?.match) return null;
      return chat.match.userA === userId ? chat.match.userB : chat.match.userA;
    } catch {
      return null;
    }
  }
}
