import { Controller, Get, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
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
}
