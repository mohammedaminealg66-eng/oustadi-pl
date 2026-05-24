import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarKey: true,
        language: true,
        emailVerified: true,
        authProvider: true,
        studentProfile: true,
        teacherProfile: {
          include: {
            subjects: { include: { subject: true } },
            availability: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
            documents: { where: { type: 'certificate' }, orderBy: { createdAt: 'desc' } },
            workExperiences: { orderBy: { createdAt: 'desc' } },
            reviews: { include: { student: { select: { id: true, fullName: true, avatarKey: true } } }, orderBy: { createdAt: 'desc' } },
            _count: { select: { reviews: true } },
          },
        },
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { fullName?: string; phone?: string; language?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, fullName: true, phone: true, language: true },
    });
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
