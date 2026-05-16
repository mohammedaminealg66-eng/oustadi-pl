import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { studentId: string; teacherUserId: string; subjectId: string; message: string; proposedSchedule?: string }) {
    const teacherProfile = await this.prisma.teacherProfile.findUnique({ where: { userId: data.teacherUserId } });
    if (!teacherProfile) throw new NotFoundException('Teacher not found');

    return this.prisma.lessonRequest.create({
      data: {
        studentId: data.studentId,
        teacherId: data.teacherUserId,
        subjectId: data.subjectId,
        message: data.message,
        proposedSchedule: data.proposedSchedule,
      },
      include: {
        student: { select: { id: true, fullName: true } },
        teacher: { select: { id: true, fullName: true } },
        subject: true,
      },
    });
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

    return this.prisma.lessonRequest.update({
      where: { id: requestId },
      data: { status, teacherNotes },
      include: {
        student: { select: { id: true, fullName: true } },
        subject: true,
      },
    });
  }
}
