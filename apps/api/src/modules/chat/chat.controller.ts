import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chat: ChatService) {}

  @Get('conversations')
  getConversations(@CurrentUser('userId') userId: string, @CurrentUser('role') userRole: string) {
    return this.chat.getConversations(userId, userRole);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string, @CurrentUser('userId') userId: string, @CurrentUser('role') userRole: string) {
    return this.chat.getMessages(id, userId, userRole);
  }

  @Post('conversations/:id/read')
  markAsRead(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.chat.markAsRead(id, userId);
  }

  @Post('conversations')
  createConversation(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') userRole: string,
    @Body('teacherId') teacherId: string,
    @Body('studentId') studentId: string,
  ) {
    if (userRole === 'ADMIN') {
      const otherId = teacherId || studentId;
      const otherRole = teacherId ? 'TEACHER' : 'STUDENT';
      return this.chat.getOrCreateAdminConversation(userId, otherId, otherRole);
    }
    return this.chat.getOrCreateConversation(userId, teacherId);
  }
}
