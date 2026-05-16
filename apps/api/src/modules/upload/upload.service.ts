import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import { PrismaService } from '../../config/database/prisma.service';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  constructor(private prisma: PrismaService) {}

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP images allowed');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Avatar must be under 2MB');
    }

    const ext = 'webp';
    const fileName = `avatar_${userId}_${Date.now()}.${ext}`;
    const dir = path.join(this.uploadDir, 'avatars');
    await fs.mkdir(dir, { recursive: true });

    const resized = await sharp(file.buffer).resize(400, 400, { fit: 'cover' }).webp({ quality: 80 }).toBuffer();
    await fs.writeFile(path.join(dir, fileName), resized);

    await this.prisma.user.update({ where: { id: userId }, data: { avatarKey: `uploads/avatars/${fileName}` } });

    if (file.size > 0) {
      const teacherProfile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
      if (teacherProfile) {
        await this.prisma.uploadedDocument.create({
          data: {
            teacherId: teacherProfile.id,
            fileName,
            originalName: file.originalname,
            mimeType: 'image/webp',
            size: resized.length,
            type: 'avatar',
            isVerified: true,
          },
        });
      }
    }

    return { url: `uploads/avatars/${fileName}` };
  }

  async uploadDocument(userId: string, file: Express.Multer.File) {
    if (!ALLOWED_DOC_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, PDF, DOC, DOCX');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Document must be under 10MB');
    }

    const teacherProfile = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!teacherProfile) throw new BadRequestException('Only teachers can upload documents');

    const ext = file.originalname.split('.').pop() || 'bin';
    const fileName = `${uuid()}.${ext}`;
    const dir = path.join(this.uploadDir, 'documents');
    await fs.mkdir(dir, { recursive: true });

    const buffer = file.mimetype.startsWith('image/')
      ? await sharp(file.buffer).webp({ quality: 85 }).toBuffer()
      : file.buffer;

    await fs.writeFile(path.join(dir, fileName), buffer);

    const doc = await this.prisma.uploadedDocument.create({
      data: {
        teacherId: teacherProfile.id,
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: buffer.length,
        type: 'certificate',
      },
    });

    return doc;
  }

  async deleteUpload(uploadId: string) {
    const doc = await this.prisma.uploadedDocument.findUnique({ where: { id: uploadId } });
    if (!doc) throw new BadRequestException('Document not found');

    const filePath = path.join(this.uploadDir, doc.type === 'avatar' ? 'avatars' : 'documents', doc.fileName);
    await fs.unlink(filePath).catch(() => {});

    await this.prisma.uploadedDocument.delete({ where: { id: uploadId } });
  }
}
