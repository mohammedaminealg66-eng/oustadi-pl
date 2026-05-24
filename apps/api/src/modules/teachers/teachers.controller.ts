import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeachersService } from './teachers.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('teachers')
export class TeachersController {
  constructor(private teachers: TeachersService) {}

  @Get()
  search(
    @Query('query') query?: string,
    @Query('subjectId') subjectId?: string,
    @Query('city') city?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minExperience') minExperience?: string,
    @Query('teachingMode') teachingMode?: string,
    @Query('gender') gender?: string,
    @Query('levels') levels?: string,
    @Query('minRating') minRating?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
    @Query('availableToday') availableToday?: string,
    @Query('availableThisWeek') availableThisWeek?: string,
    @Query('sort') sort?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.teachers.search({
      query,
      subjectId,
      city,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minExperience: minExperience ? parseInt(minExperience) : undefined,
      teachingMode,
      gender,
      levels: levels ? levels.split(',') : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      verifiedOnly: verifiedOnly === 'true',
      availableToday: availableToday === 'true',
      availableThisWeek: availableThisWeek === 'true',
      sort,
      cursor,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.teachers.getProfile(id);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  updateProfile(@CurrentUser('userId') userId: string, @Body() body: any) {
    return this.teachers.updateProfile(userId, body);
  }

  @Post('subjects')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  addSubject(@CurrentUser('userId') userId: string, @Body() body: { subjectId: string; levels: string[]; price?: number }) {
    return this.teachers.addSubject(userId, body);
  }

  @Delete('subjects/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  removeSubject(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.teachers.removeSubject(userId, id);
  }

  @Post('experience')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  addWorkExperience(@CurrentUser('userId') userId: string, @Body() body: { institution: string; position: string; duration: string }) {
    return this.teachers.addWorkExperience(userId, body);
  }

  @Delete('experience/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  removeWorkExperience(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.teachers.removeWorkExperience(userId, id);
  }

  @Post('availability')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  addAvailability(@CurrentUser('userId') userId: string, @Body() body: { dayOfWeek: number; startTime: string; endTime: string }) {
    return this.teachers.addAvailability(userId, body);
  }

  @Delete('availability/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.TEACHER)
  removeAvailability(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.teachers.removeAvailability(userId, id);
  }

  @Post(':id/report')
  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  reportTeacher(
    @CurrentUser('userId') userId: string,
    @Param('id') teacherId: string,
    @Body() body: { reason: string; description?: string },
  ) {
    return this.teachers.reportTeacher(userId, teacherId, body.reason, body.description);
  }
}
