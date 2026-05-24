import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../config/database/prisma.service';
import { RedisService } from '../../config/redis/redis.service';
import { EmailService } from './email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private redis: RedisService,
    private email: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role,
        language: dto.language || 'ar',
        emailVerificationToken: verificationToken,
        ...(dto.role === 'TEACHER' ? { teacherProfile: { create: {} } } : {}),
        ...(dto.role === 'STUDENT' ? { studentProfile: { create: {} } } : {}),
      },
    });

    this.email.sendVerification(dto.email, verificationToken);

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.isSuspended) throw new UnauthorizedException('Account is suspended');
    if (user.authProvider !== 'local' && user.passwordHash === '') {
      throw new UnauthorizedException('This account uses Google login. Please sign in with Google.');
    }

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

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: hashed, resetPasswordExpires: new Date(Date.now() + 30 * 60 * 1000) },
    });

    this.email.sendPasswordReset(email, raw);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: hashed,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetPasswordToken: null, resetPasswordExpires: null },
    });

    await this.prisma.session.updateMany({
      where: { userId: user.id, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: 'Password reset successfully. Please log in with your new password.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) throw new BadRequestException('Invalid or expired verification token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null },
    });

    return { message: 'Email verified successfully.' };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerified) throw new BadRequestException('Email already verified');

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationToken },
    });

    this.email.sendVerification(email, verificationToken);
    return { message: 'Verification email sent.' };
  }

  async googleLogin(googleUser: { googleId: string; email: string; fullName: string; avatarKey?: string }): Promise<{ accessToken: string; refreshToken: string; isNew: boolean }> {
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }] },
    });

    if (user && !user.googleId) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.googleId, authProvider: 'google', emailVerified: true, avatarKey: googleUser.avatarKey || user.avatarKey },
      });
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          passwordHash: '',
          fullName: googleUser.fullName,
          role: 'STUDENT',
          authProvider: 'google',
          googleId: googleUser.googleId,
          emailVerified: true,
          avatarKey: googleUser.avatarKey,
          studentProfile: { create: {} },
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { ...tokens, isNew: !user.googleId };
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
