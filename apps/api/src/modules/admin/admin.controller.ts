import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.admin.getDashboard();
  }

  @Get('users')
  listUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.admin.listUsers(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }

  @Patch('users/:id/suspend')
  suspendUser(@Param('id') id: string, @Body('reason') reason: string) {
    return this.admin.suspendUser(id, reason);
  }

  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.admin.activateUser(id);
  }

  @Get('reports')
  listReports() {
    return this.admin.listReports();
  }

  @Patch('reports/:id/resolve')
  resolveReport(@Param('id') id: string) {
    return this.admin.resolveReport(id);
  }

  @Get('documents/pending')
  listPendingDocuments() {
    return this.admin.listPendingDocuments();
  }

  @Patch('documents/:id/verify')
  verifyDocument(@Param('id') id: string) {
    return this.admin.verifyDocument(id);
  }

  @Delete('documents/:id')
  rejectDocument(@Param('id') id: string) {
    return this.admin.rejectDocument(id);
  }

  @Patch('teachers/:id/verify')
  toggleVerify(@Param('id') id: string) {
    return this.admin.toggleVerify(id);
  }

  @Patch('teachers/:id/official')
  toggleOfficial(@Param('id') id: string) {
    return this.admin.toggleOfficial(id);
  }

  @Get('teachers')
  listTeachers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.admin.listTeachers(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string) {
    return this.admin.deleteReview(id);
  }

  @Get('disputes')
  listDisputes() {
    return this.admin.listDisputes();
  }

  @Get('disputes/:id')
  getDispute(@Param('id') id: string) {
    return this.admin.getDispute(id);
  }

  @Patch('disputes/:id/resolve')
  resolveDispute(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
    @Body() body: { action: string; note?: string },
  ) {
    return this.admin.resolveDispute(id, adminId, body.action, body.note);
  }

  @Patch('users/:id/suspend-from-dispute')
  suspendUserFromDispute(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.admin.suspendUserFromDispute(id, body.reason);
  }

  @Post('disputes/:id/message')
  sendMessageToDispute(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
    @Body() body: { receiverType: string; message: string },
  ) {
    return this.admin.sendMessageToDispute(id, body.receiverType, body.message, adminId);
  }

  @Get('disputes/:id/messages')
  getDisputeMessages(@Param('id') id: string) {
    return this.admin.getDisputeMessages(id);
  }

  @Patch('disputes/:id/start-review')
  startReview(@Param('id') id: string) {
    return this.admin.startReview(id);
  }

  @Patch('disputes/:id/resolve')
  resolveDisputeAction(@Param('id') id: string) {
    return this.admin.resolveDisputeAction(id);
  }

  @Patch('disputes/:id/close')
  closeDispute(@Param('id') id: string) {
    return this.admin.closeDispute(id);
  }

  @Get('disputes/:id/with-conversations')
  getDisputeWithConversations(@Param('id') id: string) {
    return this.admin.getDisputeWithConversations(id);
  }
}
