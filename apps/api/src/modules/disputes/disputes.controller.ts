import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DisputesService } from './disputes.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('disputes')
@UseGuards(AuthGuard('jwt'))
export class DisputesController {
  constructor(private disputes: DisputesService) {}

  @Get(':id')
  getDispute(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.disputes.getDispute(id, userId, userRole);
  }

  @Post(':id/message')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() body: { message: string },
  ) {
    return this.disputes.sendMessage(id, userId, userRole, body.message);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('userId') userId: string) {
    return this.disputes.getUnreadCount(userId);
  }
}
