import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from './students.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('students')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.STUDENT)
export class StudentsController {
  constructor(private students: StudentsService) {}

  @Get('profile')
  getProfile(@CurrentUser('userId') userId: string) {
    return this.students.getProfile(userId);
  }

  @Patch('profile')
  updateProfile(@CurrentUser('userId') userId: string, @Body() body: { bio?: string; city?: string }) {
    return this.students.updateProfile(userId, body);
  }

  @Get('favorites')
  getFavorites(@CurrentUser('userId') userId: string) {
    return this.students.getFavorites(userId);
  }

  @Post('favorites/:teacherId')
  addFavorite(@CurrentUser('userId') userId: string, @Param('teacherId') teacherId: string) {
    return this.students.toggleFavorite(userId, teacherId);
  }

  @Delete('favorites/:teacherId')
  removeFavorite(@CurrentUser('userId') userId: string, @Param('teacherId') teacherId: string) {
    return this.students.toggleFavorite(userId, teacherId);
  }

  @Get('reviews/mine')
  getMyReviews(@CurrentUser('userId') userId: string) {
    return this.students.getMyReviews(userId);
  }

  @Post('reviews')
  @UseGuards(EmailVerifiedGuard)
  createReview(
    @CurrentUser('userId') userId: string,
    @Body() body: { teacherId: string; rating: number; comment?: string },
  ) {
    return this.students.createReview(userId, body.teacherId, body.rating, body.comment);
  }
}
