import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { nameAr: 'asc' },
    });
  }

  async create(data: { nameAr: string; nameFr: string; slug: string }) {
    return this.prisma.subject.create({ data });
  }

  async update(id: string, data: { nameAr?: string; nameFr?: string; slug?: string; isActive?: boolean }) {
    return this.prisma.subject.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.subject.delete({ where: { id } });
  }
}
