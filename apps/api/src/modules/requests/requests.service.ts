import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { RequestStatus } from '@prisma/client';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) {}

  async create(data: { studentId: string; teacherUserId: string; subjectId: string; message: string; lessonType?: string; bookedDate?: string; bookedTime?: string }) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({ where: { userId: data.teacherUserId } });
    if (!teacherProfile) throw new NotFoundException('Teacher not found');

    const lessonRequest = await this.prisma.lessonRequest.create({
      data: {
        studentId: data.studentId,
        teacherId: data.teacherUserId,
        subjectId: data.subjectId,
        message: data.message,
        lessonType: data.lessonType,
        bookedDate: data.bookedDate,
        bookedTime: data.bookedTime,
      },
      include: {
        student: { select: { id: true, fullName: true } },
        teacher: { select: { id: true, fullName: true } },
        subject: true,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: data.teacherUserId,
        title: 'طلب تدريس جديد',
        body: `طلب من ${lessonRequest.student.fullName} تدريس ${lessonRequest.subject?.nameAr || 'المادة'}`,
        type: 'new_request',
        link: '/teacher/requests',
      },
    });

    this.chatGateway.sendToUser(data.teacherUserId, 'notification:new', {
      type: 'new_request',
      title: 'طلب تدريس جديد',
      body: `طلب من ${lessonRequest.student.fullName}`,
      link: '/teacher/requests',
    });

    return lessonRequest;
  }

  async findByUser(userId: string) {
    const sent = await this.prisma.lessonRequest.findMany({
      where: { studentId: userId },
      include: {
        teacher: { select: { id: true, fullName: true, avatarKey: true } },
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const received = await this.prisma.lessonRequest.findMany({
      where: { teacherId: userId },
      include: {
        student: { select: { id: true, fullName: true, avatarKey: true } },
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { sent, received };
  }

  async updateStatus(requestId: string, userId: string, status: RequestStatus, teacherNotes?: string) {
    const request = await this.prisma.lessonRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.teacherId !== userId) throw new ForbiddenException('Only the teacher can accept/reject');

    const updated = await this.prisma.lessonRequest.update({
      where: { id: requestId },
      data: { status, teacherNotes },
      include: {
        student: { select: { id: true, fullName: true } },
        subject: true,
      },
    });

    if (status === 'ACCEPTED') {
      await this.prisma.conversation.upsert({
        where: { studentId_teacherId: { studentId: request.studentId, teacherId: request.teacherId } },
        update: {},
        create: { studentId: request.studentId, teacherId: request.teacherId },
      });
      await this.prisma.notification.create({
        data: {
          userId: request.studentId,
          title: 'تم قبول طلبك',
          body: `قبل الأستاذ طلب درس في ${updated.subject?.nameAr || 'المادة'}`,
          type: 'request_accepted',
          link: '/chat',
        },
      });
      this.chatGateway.sendToUser(request.studentId, 'notification:new', {
        type: 'request_accepted',
        title: 'تم قبول طلبك',
        body: `قبل الأستاذ طلب درس في ${updated.subject?.nameAr || 'المادة'}`,
        link: '/chat',
      });
    } else if (status === 'REJECTED') {
      await this.prisma.notification.create({
        data: {
          userId: request.studentId,
          title: 'تم رفض طلبك',
          body: `رفض الأستاذ طلب درس في ${updated.subject?.nameAr || 'المادة'}${teacherNotes ? ': ' + teacherNotes : ''}`,
          type: 'request_rejected',
        },
      });
      this.chatGateway.sendToUser(request.studentId, 'notification:new', {
        type: 'request_rejected',
        title: 'تم رفض طلبك',
        body: `رفض الأستاذ طلب درس في ${updated.subject?.nameAr || 'المادة'}`,
        link: '#',
      });
    } else if (status === 'COMPLETED') {
      await this.prisma.notification.create({
        data: {
          userId: request.studentId,
          title: 'تم إكمال الحصة',
          body: `تم إكمال حصة في ${updated.subject?.nameAr || 'المادة'}، يمكنك الآن تقييم الأستاذ`,
          type: 'lesson_completed',
          link: `/teachers/${request.teacherId}`,
        },
      });
      this.chatGateway.sendToUser(request.studentId, 'notification:new', {
        type: 'lesson_completed',
        title: 'تم إكمال الحصة',
        body: 'يمكنك الآن تقييم الأستاذ',
        link: `/teachers/${request.teacherId}`,
      });
    } else if (status === 'CANCELLED') {
      const notifyUser = userId === request.teacherId ? request.studentId : request.teacherId;
      await this.prisma.notification.create({
        data: {
          userId: notifyUser,
          title: 'تم إلغاء الحصة',
          body: 'تم إلغاء الحصة المبرمجة',
          type: 'lesson_cancelled',
        },
      });
      this.chatGateway.sendToUser(notifyUser, 'notification:new', {
        type: 'lesson_cancelled',
        title: 'تم إلغاء الحصة',
        body: 'تم إلغاء الحصة المبرمجة',
      });
    }

    return updated;
  }
}
