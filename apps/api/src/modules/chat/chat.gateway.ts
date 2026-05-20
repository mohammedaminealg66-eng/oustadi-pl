import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string[]>();

  constructor(
    private jwt: JwtService,
    private chat: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwt.verify(token as string, {
        secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      });

      const userId = payload.sub;
      const userRole = payload.role;
      const existing = this.connectedUsers.get(userId) || [];
      existing.push(client.id);
      this.connectedUsers.set(userId, existing);

      client.data.userId = userId;
      client.data.userRole = userRole;
      client.join(`user:${userId}`);

      this.logger.log(`User ${userId} connected via WS`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.connectedUsers.get(userId) || [];
      const filtered = sockets.filter((s) => s !== client.id);
      if (filtered.length === 0) {
        this.connectedUsers.delete(userId);
      } else {
        this.connectedUsers.set(userId, filtered);
      }
      this.logger.log(`User ${userId} disconnected from WS`);
    }
  }

  @SubscribeMessage('chat:join')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    client.join(`conv:${conversationId}`);
  }

  @SubscribeMessage('chat:leave')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    client.leave(`conv:${conversationId}`);
  }

  @SubscribeMessage('chat:message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string; type?: string; fileUrl?: string; fileName?: string; fileSize?: number; mimeType?: string; duration?: number },
  ) {
    try {
      const { message, recipientId } = await this.chat.sendMessage(
        data.conversationId,
        client.data.userId,
        client.data.userRole,
        data.content,
        data.type,
        data.fileUrl,
        data.fileName,
        data.fileSize,
        data.mimeType,
        data.duration,
      );

      this.server.to(`conv:${data.conversationId}`).emit('chat:message', message);
      this.server.to(`conv:${data.conversationId}`).emit('chat:received', { messageId: message.id });
      this.server.to(`user:${recipientId}`).emit('notification:new', {
        type: client.data.userRole === 'ADMIN' ? 'support_message' : 'new_message',
        title: client.data.userRole === 'ADMIN' ? 'رسالة من الدعم' : 'رسالة جديدة',
        body: message.content.substring(0, 100),
        link: '/chat',
      });
    } catch (err: any) {
      client.emit('chat:error', { message: err.message });
    }
  }

  @SubscribeMessage('chat:read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    await this.chat.markAsRead(conversationId, client.data.userId);
    this.server.to(`conv:${conversationId}`).emit('chat:read', { userId: client.data.userId });
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.to(`conv:${conversationId}`).emit('typing:start', {
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.to(`conv:${conversationId}`).emit('typing:stop', {
      userId: client.data.userId,
    });
  }
}
