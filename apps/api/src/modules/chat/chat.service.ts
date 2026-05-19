import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { MessageStatus } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ studentId: userId }, { teacherId: userId }],
      },
      include: {
        student: { select: { id: true, fullName: true, avatarKey: true, isOnline: true, lastSeen: true } },
        teacher: { select: { id: true, fullName: true, avatarKey: true, isOnline: true, lastSeen: true } },
        _count: {
          select: {
            messages: { where: { senderId: { not: userId }, status: { not: MessageStatus.READ } } },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.studentId !== userId && conversation.teacherId !== userId) {
      throw new ForbiddenException('Not part of this conversation');
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, fullName: true } } },
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.studentId !== senderId && conversation.teacherId !== senderId) {
      throw new ForbiddenException('Not part of this conversation');
    }

    const message = await this.prisma.message.create({
      data: { conversationId, senderId, content },
      include: { sender: { select: { id: true, fullName: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), lastMessagePreview: content.substring(0, 100) },
    });

    const recipientId = conversation.studentId === senderId ? conversation.teacherId : conversation.studentId;
    await this.prisma.notification.create({
      data: {
        userId: recipientId,
        title: 'رسالة جديدة',
        body: content.substring(0, 100),
        type: 'new_message',
        link: '/chat',
      },
    });

    return { message, recipientId };
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, status: { not: MessageStatus.READ } },
      data: { status: MessageStatus.READ },
    });
  }

  async getOrCreateConversation(studentId: string, teacherUserId: string) {
    const existing = await this.prisma.conversation.findUnique({
      where: { studentId_teacherId: { studentId, teacherId: teacherUserId } },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { studentId, teacherId: teacherUserId },
    });
  }
}
