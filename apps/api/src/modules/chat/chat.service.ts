import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { MessageStatus } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string, userRole: string) {
    if (userRole === 'ADMIN') {
      return this.prisma.conversation.findMany({
        where: { adminId: userId },
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

  async getMessages(conversationId: string, userId: string, userRole: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = userRole === 'ADMIN'
      ? conversation.adminId === userId
      : conversation.studentId === userId || conversation.teacherId === userId;

    if (!isParticipant) throw new ForbiddenException('Not part of this conversation');

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, fullName: true, role: true } } },
    });
  }

  async sendMessage(conversationId: string, senderId: string, senderRole: string, content: string, type?: string, fileUrl?: string, fileName?: string, fileSize?: number, mimeType?: string, duration?: number) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = senderRole === 'ADMIN'
      ? conversation.adminId === senderId
      : conversation.studentId === senderId || conversation.teacherId === senderId;

    if (!isParticipant) throw new ForbiddenException('Not part of this conversation');

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type: (type as any) || 'TEXT',
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        duration,
      },
      include: { sender: { select: { id: true, fullName: true, role: true } } },
    });

    const preview = type === 'IMAGE' ? '🖼️ صورة' : type === 'FILE' ? `📎 ${fileName || 'ملف'}` : type === 'VOICE' ? '🎤 رسالة صوتية' : content.substring(0, 100);
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), lastMessagePreview: preview },
    });

    let recipientId: string;
    if (senderRole === 'ADMIN') {
      recipientId = conversation.studentId || conversation.teacherId!;
    } else {
      recipientId = conversation.adminId || (conversation.studentId === senderId ? conversation.teacherId! : conversation.studentId!);
    }

    await this.prisma.notification.create({
      data: {
        userId: recipientId,
        title: senderRole === 'ADMIN' ? 'رسالة من الدعم' : 'رسالة جديدة',
        body: preview,
        type: senderRole === 'ADMIN' ? 'support_message' : 'new_message',
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

  async getOrCreateAdminConversation(adminId: string, otherUserId: string, otherUserRole: string) {
    const field = otherUserRole === 'TEACHER' ? 'teacherId' : 'studentId';
    const where: any = { adminId, [field]: otherUserId };
    const existing = await this.prisma.conversation.findFirst({ where });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { adminId, [field]: otherUserId },
    });
  }
}
