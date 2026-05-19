import { Controller, Get, Post, Body, Headers, Req, UseGuards, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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
  login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Req() req?: any,
  ) {
    const ip = req?.ip;
    return this.auth.login(dto, userAgent, ip);
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
