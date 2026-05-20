import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestsService } from './requests.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestStatus } from '@prisma/client';

@Controller('requests')
@UseGuards(AuthGuard('jwt'))
export class RequestsController {
  constructor(private requests: RequestsService) {}

  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Body() body: { teacherId: string; subjectId: string; message: string; lessonType?: string; bookedDate?: string; bookedTime?: string },
  ) {
    return this.requests.create({
      studentId: userId,
      teacherUserId: body.teacherId,
      subjectId: body.subjectId,
      message: body.message,
      lessonType: body.lessonType,
      bookedDate: body.bookedDate,
      bookedTime: body.bookedTime,
    });
  }

  @Get()
  findByUser(@CurrentUser('userId') userId: string) {
    return this.requests.findByUser(userId);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.requests.updateStatus(id, userId, RequestStatus.ACCEPTED);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body('notes') notes?: string,
  ) {
    return this.requests.updateStatus(id, userId, RequestStatus.REJECTED, notes);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.requests.updateStatus(id, userId, RequestStatus.COMPLETED);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.requests.updateStatus(id, userId, RequestStatus.CANCELLED);
  }

  @Patch(':id/propose')
  proposeTime(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() body: { bookedDate: string; bookedTime: string },
  ) {
    return this.requests.updateStatus(id, userId, RequestStatus.PENDING, body.bookedDate + ' ' + body.bookedTime);
  }
}
