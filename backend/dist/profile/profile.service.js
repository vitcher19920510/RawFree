"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../common/services/storage.service");
const profile_constants_1 = require("./profile.constants");
const VALID_GENDERS = ['male', 'female', 'other'];
const VALID_LOOKING_FOR = ['male', 'female', 'all'];
let ProfileService = class ProfileService {
    constructor(prisma, storageService) {
        this.prisma = prisma;
        this.storageService = storageService;
    }
    async getProfile(userId, requestingUserId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                photos: { orderBy: { order: 'asc' } },
                interests: true,
            },
        });
        if (!user || !user.profile) {
            throw new common_1.NotFoundException('Профиль не найден');
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
    async updateProfile(userId, dto) {
        if (dto.gender && !VALID_GENDERS.includes(dto.gender)) {
            throw new common_1.BadRequestException('Недопустимое значение пола');
        }
        if (dto.lookingFor && !VALID_LOOKING_FOR.includes(dto.lookingFor)) {
            throw new common_1.BadRequestException('Недопустимое значение предпочтения поиска');
        }
        const existingProfile = await this.prisma.profile.findUnique({ where: { userId } });
        if (!existingProfile) {
            if (!dto.name || !dto.age || !dto.gender || !dto.lookingFor) {
                throw new common_1.BadRequestException('Заполните обязательные поля: имя, возраст, пол и предпочтения поиска');
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
        }
        else {
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
    async uploadPhoto(userId, file) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('Файл фотографии отсутствует');
        }
        const count = await this.prisma.photo.count({ where: { userId } });
        if (count >= profile_constants_1.PROFILE_CONSTANTS.MAX_PHOTOS_PER_PROFILE) {
            throw new common_1.ConflictException('PHOTO_LIMIT_REACHED');
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
    async deletePhoto(userId, photoId) {
        const photo = await this.prisma.photo.findUnique({ where: { id: photoId } });
        if (!photo) {
            throw new common_1.NotFoundException('Фотография не найдена');
        }
        if (photo.userId !== userId) {
            throw new common_1.ForbiddenException('Нет прав на удаление этой фотографии');
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
    async hideProfile(userId, hidden) {
        await this.prisma.profile.update({
            where: { userId },
            data: { hiddenFromFeed: hidden },
        });
        return { success: true };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map