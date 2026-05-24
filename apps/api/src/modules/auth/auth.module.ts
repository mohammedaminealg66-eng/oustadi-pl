import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { GoogleConfigGuard } from './google-config.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';

const providers: any[] = [AuthService, EmailService, JwtStrategy, EmailVerifiedGuard, GoogleConfigGuard];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleStrategy);
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      signOptions: { expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any },
    }),
  ],
  controllers: [AuthController],
  providers,
  exports: [JwtModule, PassportModule, JwtStrategy, EmailService, EmailVerifiedGuard],
})
export class AuthModule {}
