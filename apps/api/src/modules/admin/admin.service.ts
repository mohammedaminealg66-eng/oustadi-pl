import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [users, teachers, students, requests, pendingDocs, reports] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.teacherProfile.count(),
      this.prisma.studentProfile.count(),
      this.prisma.lessonRequest.count(),
      this.prisma.uploadedDocument.count({ where: { isVerified: false, type: 'certificate' } }),
      this.prisma.report.count({ where: { isResolved: false } }),
    ]);

    return { users, teachers, students, requests, pendingDocuments: pendingDocs, pendingReports: reports };
  }

  async listUsers(page = 1, limit = 20) {
    return this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, fullName: true, role: true,
        isActive: true, isSuspended: true, emailVerified: true,
        createdAt: true,
      },
    });
  }

  async suspendUser(userId: string, reason: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true, suspensionReason: reason },
    });
  }

  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: false, suspensionReason: null },
    });
  }

  async listReports() {
    return this.prisma.report.findMany({
      where: { isResolved: false },
      include: {
        reporter: { select: { id: true, fullName: true } },
        target: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(reportId: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { isResolved: true },
    });
  }

  async listPendingDocuments() {
    return this.prisma.uploadedDocument.findMany({
      where: { isVerified: false, type: { not: 'avatar' } },
      include: {
        teacher: { include: { user: { select: { id: true, fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyDocument(docId: string) {
    return this.prisma.uploadedDocument.update({
      where: { id: docId },
      data: { isVerified: true },
    });
  }

  async deleteReview(reviewId: string) {
    return this.prisma.review.delete({ where: { id: reviewId } });
  }

  async rejectDocument(docId: string) {
    return this.prisma.uploadedDocument.delete({
      where: { id: docId },
    });
  }

  async toggleVerify(teacherProfileId: string) {
    const profile = await this.prisma.teacherProfile.findUnique({ where: { id: teacherProfileId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');
    return this.prisma.teacherProfile.update({
      where: { id: teacherProfileId },
      data: { isVerified: !profile.isVerified },
    });
  }

  async toggleOfficial(teacherProfileId: string) {
    const profile = await this.prisma.teacherProfile.findUnique({ where: { id: teacherProfileId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');
    return this.prisma.teacherProfile.update({
      where: { id: teacherProfileId },
      data: { isOfficial: !profile.isOfficial },
    });
  }

  async listTeachers(page = 1, limit = 20) {
    return this.prisma.teacherProfile.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        _count: { select: { documents: true, favorites: true } },
      },
    });
  }

  async listDisputes() {
    return this.prisma.dispute.findMany({
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        student: { select: { id: true, fullName: true, email: true } },
        booking: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDispute(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        teacher: { select: { id: true, fullName: true, email: true, phone: true, avatarKey: true, isOnline: true } },
        student: { select: { id: true, fullName: true, email: true, phone: true, avatarKey: true, isOnline: true } },
        booking: {
          include: {
            subject: true,
          },
        },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const messages = await this.prisma.message.findMany({
      where: { conversationId: dispute.booking.id },
      include: { sender: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return { ...dispute, messages };
  }

  async resolveDispute(disputeId: string, adminId: string, action: string, note?: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: action === 'resolved' ? 'resolved' : action === 'rejected' ? 'rejected' : 'reviewing',
        adminAction: action,
        adminNote: note,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      },
      include: {
        teacher: { select: { id: true, fullName: true } },
        student: { select: { id: true, fullName: true } },
        booking: { include: { subject: true } },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: dispute.studentId,
        title: 'تم حل النزاع',
        body: `تم حل النزاع الخاص بالحصة في ${updated.booking.subject?.nameAr || 'المادة'}`,
        type: 'dispute_resolved',
        link: '/student/requests',
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: dispute.teacherId,
        title: 'تم حل النزاع',
        body: `تم حل النزاع الخاص بالحصة في ${updated.booking.subject?.nameAr || 'المادة'}`,
        type: 'dispute_resolved',
        link: '/teacher/requests',
      },
    });

    return updated;
  }

  async suspendUserFromDispute(userId: string, reason: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true, suspensionReason: reason },
    });
  }

  async sendMessageToDispute(disputeId: string, receiverType: string, message: string, adminId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { booking: { include: { subject: true } } },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const disputeMessage = await this.prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId: adminId,
        senderRole: 'admin',
        message,
      },
    });

    const targetUserId = receiverType === 'teacher' ? dispute.teacherId : dispute.studentId;
    await this.prisma.notification.create({
      data: {
        userId: targetUserId,
        title: 'رسالة من الإدارة',
        body: message.substring(0, 100),
        type: 'admin_dispute_message',
        link: `/disputes/${disputeId}`,
      },
    });

    return disputeMessage;
  }

  async getDisputeMessages(disputeId: string) {
    return this.prisma.disputeMessage.findMany({
      where: { disputeId },
      include: { sender: { select: { id: true, fullName: true, avatarKey: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async startReview(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'under_review' },
      include: {
        teacher: { select: { id: true, fullName: true } },
        student: { select: { id: true, fullName: true } },
        booking: { include: { subject: true } },
      },
    });
  }

  async resolveDisputeAction(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'resolved', resolvedAt: new Date() },
      include: {
        teacher: { select: { id: true, fullName: true } },
        student: { select: { id: true, fullName: true } },
        booking: { include: { subject: true } },
      },
    });
  }

  async closeDispute(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'closed' },
      include: {
        teacher: { select: { id: true, fullName: true } },
        student: { select: { id: true, fullName: true } },
        booking: { include: { subject: true } },
      },
    });
  }

  async getDisputeWithConversations(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        teacher: { select: { id: true, fullName: true, email: true, phone: true, avatarKey: true, isOnline: true } },
        student: { select: { id: true, fullName: true, email: true, phone: true, avatarKey: true, isOnline: true } },
        booking: { include: { subject: true } },
        supportConversations: {
          include: {
            participant: { select: { id: true, fullName: true, avatarKey: true } },
            messages: {
              include: { sender: { select: { id: true, fullName: true, avatarKey: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }
}
