import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chat: ChatService) {}

  @Get('conversations')
  getConversations(@CurrentUser('userId') userId: string) {
    return this.chat.getConversations(userId);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.chat.getMessages(id, userId);
  }

  @Post('conversations/:id/read')
  markAsRead(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.chat.markAsRead(id, userId);
  }

  @Post('conversations')
  createConversation(
    @CurrentUser('userId') userId: string,
    @Body('teacherId') teacherId: string,
  ) {
    return this.chat.getOrCreateConversation(userId, teacherId);
  }
}
