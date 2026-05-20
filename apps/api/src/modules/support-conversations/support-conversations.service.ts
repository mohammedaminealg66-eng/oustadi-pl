import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupportConversationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getConversation(conversationId: string, userId: string, userRole: string) {
    const conversation = await this.prisma.supportConversation.findUnique({
      where: { id: conversationId },
      include: {
        dispute: { include: { booking: { include: { subject: true } } } },
        participant: { select: { id: true, fullName: true, avatarKey: true } },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    if (userRole !== 'ADMIN' && conversation.participantId !== userId) {
      throw new ForbiddenException('Not part of this conversation');
    }

    const messages = await this.prisma.supportMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, fullName: true, avatarKey: true } } },
      orderBy: { createdAt: 'asc' },
    });

    await this.prisma.supportMessage.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    return { ...conversation, messages };
  }

  async getParticipantConversations(userId: string, userRole: string) {
    const conversations = await this.prisma.supportConversation.findMany({
      where: { participantId: userId },
      include: {
        dispute: { select: { id: true, status: true, reason: true, booking: { select: { subject: { select: { nameAr: true, nameFr: true } } } } } },
        participant: { select: { id: true, fullName: true, avatarKey: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.prisma.supportMessage.count({
          where: { conversationId: conv.id, senderId: { not: userId }, isRead: false },
        });
        const lastMessage = await this.prisma.supportMessage.findFirst({
          where: { conversationId: conv.id },
          orderBy: { createdAt: 'desc' },
          select: { message: true, createdAt: true },
        });
        return { ...conv, unreadCount, lastMessage };
      }),
    );

    return withUnread;
  }

  async sendMessage(conversationId: string, userId: string, userRole: string, message: string) {
    const conversation = await this.prisma.supportConversation.findUnique({
      where: { id: conversationId },
      include: { dispute: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    if (userRole !== 'ADMIN' && conversation.participantId !== userId) {
      throw new ForbiddenException('Not part of this conversation');
    }

    const supportMessage = await this.prisma.supportMessage.create({
      data: {
        conversationId,
        senderId: userId,
        senderRole: userRole.toLowerCase(),
        message,
      },
      include: { sender: { select: { id: true, fullName: true, avatarKey: true } } },
    });

    await this.prisma.supportConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    if (userRole.toLowerCase() === 'admin') {
      await this.notifications.create(
        conversation.participantId,
        'رسالة من الدعم',
        message.substring(0, 100),
        'support_message',
        `/support/${conversationId}`,
      );
    } else {
      const adminUsers = await this.prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
      for (const admin of adminUsers) {
        await this.notifications.create(
          admin.id,
          'رد على نزاع',
          message.substring(0, 100),
          'support_reply',
          `/support/${conversationId}`,
        );
      }
    }

    return supportMessage;
  }

  async getUnreadCount(userId: string) {
    return this.prisma.supportMessage.count({
      where: {
        conversation: { participantId: userId },
        senderId: { not: userId },
        isRead: false,
      },
    });
  }
}
