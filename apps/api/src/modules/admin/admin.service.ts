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
      include: { reporter: { select: { id: true, fullName: true } } },
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
}
