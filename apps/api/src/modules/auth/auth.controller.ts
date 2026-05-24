import { Controller, Get, Post, Body, Headers, Req, UseGuards, HttpCode, Query, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  login(@Body() dto: LoginDto, @Headers('user-agent') userAgent?: string, @Req() req?: any) {
    return this.auth.login(dto, userAgent, req?.ip);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.password);
  }

  @Post('verify-email')
  @HttpCode(200)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  resendVerification(@Body('email') email: string) {
    return this.auth.resendVerification(email);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: any, @Res() res: any) {
    const result = req.user;
    const webUrl = process.env.WEB_URL || 'http://localhost:3000';
    res.redirect(`${webUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&isNew=${result.isNew}`);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body('refreshToken') token: string) {
    return this.auth.refresh(token);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  logout(@CurrentUser('userId') userId: string, @Body('refreshToken') token: string) {
    return this.auth.logout(userId, token);
  }

  @Post('heartbeat')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  heartbeat(@CurrentUser('userId') userId: string) {
    return this.auth.heartbeat(userId);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@CurrentUser() user: any) {
    return user;
  }
}
