import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../config/database/prisma.service';
import { RedisService } from '../../config/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role,
        language: dto.language || 'ar',
        ...(dto.role === 'TEACHER' ? { teacherProfile: { create: {} } } : {}),
        ...(dto.role === 'STUDENT' ? { studentProfile: { create: {} } } : {}),
      },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.isSuspended) throw new UnauthorizedException('Account is suspended');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date(), isOnline: true },
    });

    return tokens;
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    const tokens = await this.generateTokens(session.user.id, session.user.email, session.user.role);

    await this.prisma.session.create({
      data: {
        userId: session.user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.session.updateMany({
      where: { refreshToken, isRevoked: false },
      data: { isRevoked: true },
    });

    const activeSessions = await this.prisma.session.count({
      where: { userId, isRevoked: false },
    });

    if (activeSessions === 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeen: new Date() },
      });
    }
  }

  async heartbeat(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date(), isOnline: true },
    });
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any,
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any,
      secret: process.env.JWT_SECRET + '_refresh',
    });

    return { accessToken, refreshToken };
  }
}
