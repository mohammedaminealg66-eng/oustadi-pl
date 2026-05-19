import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);

  constructor(private prisma: PrismaService) {}

  async search(params: {
    query?: string;
    subjectId?: string;
    city?: string;
    maxPrice?: number;
    minExperience?: number;
    teachingMode?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = params.limit || 20;
    const where: any = { isVerified: false, deletedAt: null };

    where.user = { role: 'TEACHER', isActive: true, isSuspended: false };

    if (params.query) {
      where.OR = [
        { bio: { contains: params.query, mode: 'insensitive' } },
        { city: { contains: params.query, mode: 'insensitive' } },
        { user: { fullName: { contains: params.query, mode: 'insensitive' } } },
      ];
    }

    if (params.city) where.city = params.city;
    if (params.maxPrice) where.price = { lte: params.maxPrice };
    if (params.minExperience) where.experience = { gte: params.minExperience };
    if (params.teachingMode) where.teachingMode = params.teachingMode;
    if (params.subjectId) {
      where.subjects = { some: { subjectId: params.subjectId } };
    }

    const teachers = await this.prisma.teacherProfile.findMany({
      where,
      take: limit + 1,
      ...(params.cursor ? { skip: 1, cursor: { id: params.cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, avatarKey: true } },
        subjects: { include: { subject: true } },
        _count: { select: { favorites: true } },
      },
    });

    const hasMore = teachers.length > limit;
    const data = hasMore ? teachers.slice(0, limit) : teachers;

    return {
      data: data.map((t) => ({
        id: t.id,
        userId: t.userId,
        fullName: t.user.fullName,
        avatarKey: t.user.avatarKey,
        bio: t.bio,
        experience: t.experience,
        price: t.price,
        teachingMode: t.teachingMode,
        city: t.city,
        subjects: t.subjects.map((s) => ({
          id: s.subject.id,
          nameAr: s.subject.nameAr,
          nameFr: s.subject.nameFr,
          levels: s.levels,
          price: s.price,
        })),
        favoriteCount: t._count.favorites,
      })),
      hasMore,
      cursor: data.length > 0 ? data[data.length - 1].id : null,
    };
  }

  async getProfile(teacherId: string) {
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: {
        user: { select: { id: true, fullName: true, avatarKey: true, phone: true, createdAt: true } },
        subjects: { include: { subject: true } },
        availability: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
        documents: { select: { id: true, type: true, fileName: true, originalName: true, createdAt: true, isVerified: true } },
        reviews: { include: { student: { select: { id: true, fullName: true, avatarKey: true } } }, orderBy: { createdAt: 'desc' } },
        _count: { select: { favorites: true, reviews: true } },
      },
    });

    if (!profile) throw new NotFoundException('Teacher not found');

    const studentCount = await this.prisma.lessonRequest.count({
      where: { teacherId: profile.userId, status: 'ACCEPTED' },
    });

    const avgRating = profile.reviews.length > 0
      ? profile.reviews.reduce((sum, r) => sum + r.rating, 0) / profile.reviews.length
      : null;

    return { ...profile, studentCount, avgRating };
  }

  async updateProfile(userId: string, data: any) {
    const profile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');

    return this.prisma.teacherProfile.update({
      where: { userId },
      data: {
        bio: data.bio,
        experience: data.experience,
        price: data.price,
        teachingMode: data.teachingMode,
        city: data.city,
        showContact: data.showContact,
      },
    });
  }

  async addSubject(userId: string, data: { subjectId: string; levels: string[]; price?: number }) {
    const profile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');

    return this.prisma.teacherSubject.create({
      data: {
        teacherId: profile.id,
        subjectId: data.subjectId,
        levels: data.levels,
        price: data.price,
      },
      include: { subject: true },
    });
  }

  async removeSubject(userId: string, subjectId: string) {
    const profile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');

    await this.prisma.teacherSubject.deleteMany({
      where: { teacherId: profile.id, id: subjectId },
    });
  }

  async addAvailability(userId: string, data: { dayOfWeek: number; startTime: string; endTime: string }) {
    const profile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');

    return this.prisma.availabilitySlot.create({
      data: {
        teacherId: profile.id,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });
  }

  async removeAvailability(userId: string, slotId: string) {
    const profile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Teacher profile not found');

    await this.prisma.availabilitySlot.deleteMany({
      where: { teacherId: profile.id, id: slotId },
    });
  }
}
