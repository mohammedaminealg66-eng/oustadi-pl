import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async createReview(studentId: string, teacherProfileId: string, rating: number, comment?: string) {
    const profile = await this.prisma.teacherProfile.findUnique({ where: { id: teacherProfileId } });
    if (!profile) throw new NotFoundException('Teacher not found');

    const completed = await this.prisma.lessonRequest.findFirst({
      where: { studentId, teacherId: profile.userId, status: 'COMPLETED' },
    });
    if (!completed) {
      throw new ForbiddenException('يجب إكمال حصة مع هذا الأستاذ قبل التقييم');
    }

    const existing = await this.prisma.review.findUnique({
      where: { teacherId_studentId: { teacherId: teacherProfileId, studentId } },
    });
    if (existing) {
      return this.prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment },
        include: { student: { select: { id: true, fullName: true, avatarKey: true } } },
      });
    }

    return this.prisma.review.create({
      data: { teacherId: teacherProfileId, studentId, rating, comment },
      include: { student: { select: { id: true, fullName: true, avatarKey: true } } },
    });
  }

  async getMyReviews(studentId: string) {
    return this.prisma.review.findMany({
      where: { studentId },
      select: { id: true, teacherId: true, rating: true, comment: true },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, fullName: true, email: true, avatarKey: true } } },
    });
    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  async updateProfile(userId: string, data: { bio?: string; city?: string }) {
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Student profile not found');

    return this.prisma.studentProfile.update({
      where: { userId },
      data,
    });
  }

  async toggleFavorite(userId: string, teacherId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { studentId_teacherId: { studentId: userId, teacherId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: { studentId: userId, teacherId },
    });
    return { favorited: true };
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { studentId: userId },
      include: {
        teacher: {
          include: {
            user: { select: { id: true, fullName: true, avatarKey: true } },
            subjects: { include: { subject: true } },
          },
        },
      },
    });
  }
}
