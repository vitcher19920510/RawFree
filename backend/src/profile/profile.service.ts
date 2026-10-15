import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { PROFILE_CONSTANTS } from './profile.constants';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponse } from './types/profile.types';

const VALID_GENDERS = ['male', 'female', 'other'];
const VALID_LOOKING_FOR = ['male', 'female', 'all'];

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  /**
   * Получение профиля.
   * hiddenFromFeed скрывает анкету только от общего показа в ленте (FeedService.getFeed).
   * Прямой запрос профиля (своего или при клике на мэтч/чат) возвращает полные данные.
   */
  async getProfile(userId: string, requestingUserId?: string): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        photos: { orderBy: { order: 'asc' } },
        interests: true,
      },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('Профиль не найден');
    }

    return {
      userId: user.id,
      name: user.profile.name,
      age: user.profile.age,
      gender: user.profile.gender,
      lookingFor: user.profile.lookingFor,
      city: user.profile.city,
      geoLat: user.profile.geoLat,
      geoLon: user.profile.geoLon,
      height: user.profile.height,
      bio: user.profile.bio,
      hiddenFromFeed: user.profile.hiddenFromFeed,
      verificationStatus: user.profile.verificationStatus,
      photos: user.photos.map((p) => ({
        id: p.id,
        url: p.url,
        order: p.order,
        isMain: p.isMain,
      })),
      interests: user.interests.map((i) => ({
        id: i.id,
        tag: i.tag,
        type: i.type,
      })),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<{ success: boolean }> {
    if (dto.gender && !VALID_GENDERS.includes(dto.gender)) {
      throw new BadRequestException('Недопустимое значение пола');
    }
    if (dto.lookingFor && !VALID_LOOKING_FOR.includes(dto.lookingFor)) {
      throw new BadRequestException('Недопустимое значение предпочтения поиска');
    }

    const existingProfile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!existingProfile) {
      // Требование FIX 6: При создании нового профиля обязательны основные поля
      if (!dto.name || !dto.age || !dto.gender || !dto.lookingFor) {
        throw new BadRequestException('Заполните обязательные поля: имя, возраст, пол и предпочтения поиска');
      }

      await this.prisma.profile.create({
        data: {
          userId,
          name: dto.name,
          age: dto.age,
          gender: dto.gender,
          lookingFor: dto.lookingFor,
          city: dto.city || 'Не указан',
          bio: dto.bio || '',
        },
      });
    } else {
      // Частичное обновление существующего профиля
      await this.prisma.profile.update({
        where: { userId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.age && { age: dto.age }),
          ...(dto.gender && { gender: dto.gender }),
          ...(dto.lookingFor && { lookingFor: dto.lookingFor }),
          ...(dto.city && { city: dto.city }),
          ...(dto.bio !== undefined && { bio: dto.bio }),
        },
      });
    }

    return { success: true };
  }

  async uploadPhoto(userId: string, file: { buffer: Buffer; mimetype: string }): Promise<{ photoId: string; url: string; isMain: boolean }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Файл фотографии отсутствует');
    }

    const count = await this.prisma.photo.count({ where: { userId } });
    if (count >= PROFILE_CONSTANTS.MAX_PHOTOS_PER_PROFILE) {
      throw new ConflictException('PHOTO_LIMIT_REACHED');
    }

    const url = await this.storageService.upload(file.buffer, file.mimetype);
    const isMain = count === 0;

    const photo = await this.prisma.photo.create({
      data: {
        userId,
        url,
        order: count + 1,
        isMain,
      },
    });

    return { photoId: photo.id, url: photo.url, isMain: photo.isMain };
  }

  async deletePhoto(userId: string, photoId: string): Promise<{ success: boolean }> {
    const photo = await this.prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException('Фотография не найдена');
    }
    if (photo.userId !== userId) {
      throw new ForbiddenException('Нет прав на удаление этой фотографии');
    }

    await this.prisma.$transaction(async (tx) => {
      await this.storageService.delete(photo.url);
      await tx.photo.delete({ where: { id: photoId } });

      if (photo.isMain) {
        const nextPhoto = await tx.photo.findFirst({
          where: { userId },
          orderBy: { order: 'asc' },
        });
        if (nextPhoto) {
          await tx.photo.update({
            where: { id: nextPhoto.id },
            data: { isMain: true },
          });
        }
      }
    });

    return { success: true };
  }

  async hideProfile(userId: string, hidden: boolean): Promise<{ success: boolean }> {
    await this.prisma.profile.update({
      where: { userId },
      data: { hiddenFromFeed: hidden },
    });
    return { success: true };
  }
}
