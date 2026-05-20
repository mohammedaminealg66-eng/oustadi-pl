import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DisputesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getDispute(disputeId: string, userId: string, userRole: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        teacher: { select: { id: true, fullName: true, avatarKey: true } },
        student: { select: { id: true, fullName: true, avatarKey: true } },
        booking: { include: { subject: true } },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    if (userRole !== 'ADMIN' && dispute.teacherId !== userId && dispute.studentId !== userId) {
      throw new ForbiddenException('Not part of this dispute');
    }

    const messages = await this.prisma.disputeMessage.findMany({
      where: { disputeId },
      include: { sender: { select: { id: true, fullName: true, avatarKey: true } } },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read for this user
    await this.prisma.disputeMessage.updateMany({
      where: { disputeId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    return { ...dispute, messages };
  }

  async sendMessage(disputeId: string, userId: string, userRole: string, message: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { booking: { include: { subject: true } } },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    if (userRole !== 'ADMIN' && dispute.teacherId !== userId && dispute.studentId !== userId) {
      throw new ForbiddenException('Not part of this dispute');
    }

    const disputeMessage = await this.prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId: userId,
        senderRole: userRole.toLowerCase(),
        message,
      },
      include: { sender: { select: { id: true, fullName: true, avatarKey: true } } },
    });

    // Notify the other party
    const targetUserId = userRole.toLowerCase() === 'teacher' ? dispute.studentId : dispute.teacherId;
    await this.notifications.create(
      targetUserId,
      'رسالة في النزاع',
      message.substring(0, 100),
      'dispute_message',
      `/disputes/${disputeId}`,
    );

    return disputeMessage;
  }

  async getUnreadCount(userId: string) {
    return this.prisma.disputeMessage.count({
      where: {
        dispute: {
          OR: [{ teacherId: userId }, { studentId: userId }],
        },
        senderId: { not: userId },
        isRead: false,
      },
    });
  }
}
