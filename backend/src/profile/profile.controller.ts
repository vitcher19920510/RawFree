import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('api/v1/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any) {
    return this.profileService.getProfile(req.user.sub);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.sub, dto);
  }

  /**
   * POST /api/v1/profile/photos
   * Загрузка фотографии профиля. Лимит: максимум 6 фото на профиль.
   * При превышении лимита сервис выбрасывает 409 Conflict (PHOTO_LIMIT_REACHED).
   */
  @Post('photos')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Недопустимый формат файла. Разрешены только JPEG, PNG и WebP'), false);
        }
      },
    })
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadPhoto(@Request() req: any, @UploadedFile() file: any) {
    return this.profileService.uploadPhoto(req.user.sub, file);
  }

  @Delete('photos/:id')
  @HttpCode(HttpStatus.OK)
  async deletePhoto(@Request() req: any, @Param('id') photoId: string) {
    return this.profileService.deletePhoto(req.user.sub, photoId);
  }

  @Post('hide')
  @HttpCode(HttpStatus.OK)
  async hideProfile(@Request() req: any, @Body('hidden') hidden: boolean) {
    return this.profileService.hideProfile(req.user.sub, hidden);
  }
}
