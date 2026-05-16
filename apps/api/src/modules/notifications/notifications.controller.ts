import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  findByUser(@CurrentUser('userId') userId: string) {
    return this.notifications.findByUser(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.notifications.markAsRead(id, userId);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('userId') userId: string) {
    return this.notifications.markAllAsRead(userId);
  }
}
