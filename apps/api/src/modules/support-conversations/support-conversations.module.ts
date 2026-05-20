import { Module } from '@nestjs/common';
import { SupportConversationsController } from './support-conversations.controller';
import { SupportConversationsService } from './support-conversations.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [SupportConversationsController],
  providers: [SupportConversationsService],
  exports: [SupportConversationsService],
})
export class SupportConversationsModule {}
