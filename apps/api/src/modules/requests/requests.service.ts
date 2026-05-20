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

    const data: any = { status, teacherNotes };
    if (status === 'ACCEPTED') data.bookingStatus = 'accepted';
    else if (status === 'REJECTED') data.bookingStatus = 'rejected';
    else if (status === 'COMPLETED') data.bookingStatus = 'waiting_confirmation';
    else if (status === 'CANCELLED') data.bookingStatus = 'cancelled';

    const updated = await this.prisma.lessonRequest.update({
      where: { id: requestId },
      data,
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
      const teacherProfile = await this.prisma.teacherProfile.findUnique({ where: { userId: request.teacherId } });
      const profileLink = teacherProfile ? `/teachers/${teacherProfile.id}` : '/teachers';
      await this.prisma.notification.create({
        data: {
          userId: request.studentId,
          title: 'تم إكمال الحصة',
          body: `تم إكمال حصة في ${updated.subject?.nameAr || 'المادة'}، يمكنك الآن تقييم الأستاذ`,
          type: 'lesson_completed',
          link: profileLink,
        },
      });
      this.chatGateway.sendToUser(request.studentId, 'notification:new', {
        type: 'lesson_completed',
        title: 'تم إكمال الحصة',
        body: 'يمكنك الآن تقييم الأستاذ',
        link: profileLink,
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

  async proposeTime(requestId: string, userId: string, proposedDate: string, proposedTime: string) {
    const request = await this.prisma.lessonRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.teacherId !== userId) throw new ForbiddenException('Only the teacher can propose a new time');

    const updated = await this.prisma.lessonRequest.update({
      where: { id: requestId },
      data: {
        proposedDate,
        proposedTime,
        bookingStatus: 'waiting_student_confirmation',
      },
      include: {
        student: { select: { id: true, fullName: true } },
        subject: true,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.studentId,
        title: 'اقتراح وقت جديد',
        body: `اقترح الأستاذ وقتاً جديداً للحصة: ${proposedDate} ${proposedTime}`,
        type: 'proposal_received',
        link: '/student/requests',
      },
    });

    this.chatGateway.sendToUser(request.studentId, 'notification:new', {
      type: 'proposal_received',
      title: 'اقتراح وقت جديد',
      body: `اقترح الأستاذ وقتاً جديداً للحصة: ${proposedDate} ${proposedTime}`,
      link: '/student/requests',
    });

    return updated;
  }

  async acceptProposal(requestId: string, userId: string) {
    const request = await this.prisma.lessonRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.studentId !== userId) throw new ForbiddenException('Only the student can accept a proposal');
    if (request.bookingStatus !== 'waiting_student_confirmation') {
      throw new ForbiddenException('No pending proposal to accept');
    }

    const updated = await this.prisma.lessonRequest.update({
      where: { id: requestId },
      data: {
        bookedDate: request.proposedDate,
        bookedTime: request.proposedTime,
        proposedDate: null,
        proposedTime: null,
        status: RequestStatus.ACCEPTED,
        bookingStatus: 'accepted',
      },
      include: {
        student: { select: { id: true, fullName: true } },
        teacher: { select: { id: true, fullName: true } },
        subject: true,
      },
    });

    await this.prisma.conversation.upsert({
      where: { studentId_teacherId: { studentId: request.studentId, teacherId: request.teacherId } },
      update: {},
      create: { studentId: request.studentId, teacherId: request.teacherId },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.teacherId,
        title: 'تم قبول الاقتراح',
        body: `قبل التلميذ ${updated.student.fullName} الوقت المقترح للحصة`,
        type: 'proposal_accepted',
        link: '/teacher/requests',
      },
    });

    this.chatGateway.sendToUser(request.teacherId, 'notification:new', {
      type: 'proposal_accepted',
      title: 'تم قبول الاقتراح',
      body: `قبل التلميذ ${updated.student.fullName} الوقت المقترح للحصة`,
      link: '/teacher/requests',
    });

    return updated;
  }

  async rejectProposal(requestId: string, userId: string) {
    const request = await this.prisma.lessonRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.studentId !== userId) throw new ForbiddenException('Only the student can reject a proposal');
    if (request.bookingStatus !== 'waiting_student_confirmation') {
      throw new ForbiddenException('No pending proposal to reject');
    }

    const updated = await this.prisma.lessonRequest.update({
      where: { id: requestId },
      data: {
        proposedDate: null,
        proposedTime: null,
        bookingStatus: 'rejected',
        status: RequestStatus.REJECTED,
      },
      include: {
        teacher: { select: { id: true, fullName: true } },
        subject: true,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.teacherId,
        title: 'تم رفض الاقتراح',
        body: `رفض التلميذ الوقت المقترح للحصة`,
        type: 'proposal_rejected',
        link: '/teacher/requests',
      },
    });

    this.chatGateway.sendToUser(request.teacherId, 'notification:new', {
      type: 'proposal_rejected',
      title: 'تم رفض الاقتراح',
      body: 'رفض التلميذ الوقت المقترح للحصة',
      link: '/teacher/requests',
    });

    return updated;
  }

  async confirmCompletion(requestId: string, userId: string, confirmed: boolean, reason?: string) {
    const request = await this.prisma.lessonRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.studentId !== userId) throw new ForbiddenException('Only the student can confirm completion');
    if (request.status !== 'COMPLETED') throw new ForbiddenException('Lesson must be marked as completed by teacher first');

    if (confirmed) {
      const updated = await this.prisma.lessonRequest.update({
        where: { id: requestId },
        data: { bookingStatus: 'completed' },
        include: {
          teacher: { select: { id: true, fullName: true } },
          subject: true,
        },
      });

      await this.prisma.notification.create({
        data: {
          userId: request.teacherId,
          title: 'تم تأكيد الحصة',
          body: `أكد التلميذ إكمال الحصة في ${updated.subject?.nameAr || 'المادة'}`,
          type: 'lesson_confirmed',
          link: '/teacher/requests',
        },
      });

      this.chatGateway.sendToUser(request.teacherId, 'notification:new', {
        type: 'lesson_confirmed',
        title: 'تم تأكيد الحصة',
        body: `أكد التلميذ إكمال الحصة`,
        link: '/teacher/requests',
      });

      return updated;
    } else {
      const disputeReason = reason || 'التلميذ لم يؤكد إكمال الحصة';
      const updated = await this.prisma.lessonRequest.update({
        where: { id: requestId },
        data: {
          bookingStatus: 'disputed',
          disputeReason,
        },
        include: {
          teacher: { select: { id: true, fullName: true } },
          student: { select: { id: true, fullName: true } },
          subject: true,
        },
      });

      await this.prisma.dispute.create({
        data: {
          bookingId: requestId,
          teacherId: request.teacherId,
          studentId: request.studentId,
          reason: disputeReason,
          status: 'open',
        },
      });

      await this.prisma.notification.create({
        data: {
          userId: request.teacherId,
          title: 'نزاع في الحصة',
          body: `التلميذ لم يؤكد إكمال الحصة في ${updated.subject?.nameAr || 'المادة'}`,
          type: 'lesson_disputed',
          link: '/teacher/requests',
        },
      });

      this.chatGateway.sendToUser(request.teacherId, 'notification:new', {
        type: 'lesson_disputed',
        title: 'نزاع في الحصة',
        body: 'التلميذ لم يؤكد إكمال الحصة',
        link: '/teacher/requests',
      });

      return updated;
    }
  }

  async disputeLesson(requestId: string, userId: string, reason: string) {
    const request = await this.prisma.lessonRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.studentId !== userId && request.teacherId !== userId) {
      throw new ForbiddenException('Only student or teacher can dispute');
    }

    const updated = await this.prisma.lessonRequest.update({
      where: { id: requestId },
      data: { bookingStatus: 'disputed', disputeReason: reason },
      include: {
        student: { select: { id: true, fullName: true } },
        teacher: { select: { id: true, fullName: true } },
        subject: true,
      },
    });

    await this.prisma.dispute.create({
      data: {
        bookingId: requestId,
        teacherId: request.teacherId,
        studentId: request.studentId,
        reason,
        status: 'open',
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.studentId,
        title: 'نزاع في الحصة',
        body: `تم إنشاء نزاع للحصة في ${updated.subject?.nameAr || 'المادة'}`,
        type: 'lesson_disputed',
        link: '/student/requests',
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.teacherId,
        title: 'نزاع في الحصة',
        body: `تم إنشاء نزاع للحصة في ${updated.subject?.nameAr || 'المادة'}`,
        type: 'lesson_disputed',
        link: '/teacher/requests',
      },
    });

    return updated;
  }
}
