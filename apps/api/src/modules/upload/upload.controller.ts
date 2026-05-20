import { Controller, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
export class UploadController {
  constructor(private upload: UploadService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@CurrentUser('userId') userId: string, @UploadedFile() file: Express.Multer.File) {
    return this.upload.uploadAvatar(userId, file);
  }

  @Post('document')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(@CurrentUser('userId') userId: string, @UploadedFile() file: Express.Multer.File) {
    return this.upload.uploadDocument(userId, file);
  }

  @Delete(':id')
  deleteUpload(@Param('id') id: string) {
    return this.upload.deleteUpload(id);
  }

  @Post('chat-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadChatFile(@CurrentUser('userId') userId: string, @UploadedFile() file: Express.Multer.File) {
    return this.upload.uploadChatFile(userId, file);
  }
}
