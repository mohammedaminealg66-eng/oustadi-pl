import { Controller, Get, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser('userId') userId: string) {
    return this.users.getProfile(userId);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() body: { fullName?: string; phone?: string; language?: string },
  ) {
    return this.users.updateProfile(userId, body);
  }

  @Delete('me')
  deleteAccount(@CurrentUser('userId') userId: string) {
    return this.users.deleteAccount(userId);
  }
}
