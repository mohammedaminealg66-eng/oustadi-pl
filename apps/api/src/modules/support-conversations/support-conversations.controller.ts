import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupportConversationsService } from './support-conversations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('support')
@UseGuards(AuthGuard('jwt'))
export class SupportConversationsController {
  constructor(private service: SupportConversationsService) {}

  @Get('conversations')
  getParticipantConversations(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.getParticipantConversations(userId, userRole);
  }

  @Get(':id')
  getConversation(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.service.getConversation(id, userId, userRole);
  }

  @Post(':id/message')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() body: { message: string },
  ) {
    return this.service.sendMessage(id, userId, userRole, body.message);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('userId') userId: string) {
    return this.service.getUnreadCount(userId);
  }
}
