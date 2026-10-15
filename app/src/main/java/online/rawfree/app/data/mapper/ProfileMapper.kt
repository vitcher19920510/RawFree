package online.rawfree.app.data.mapper

import online.rawfree.app.data.local.entity.PhotoEntity
import online.rawfree.app.data.local.entity.ProfileEntity
import online.rawfree.app.data.local.entity.UserEntity
import online.rawfree.app.domain.model.UserDomainModel

/**
 * Алиас для доступа к маппингу профиля через единый [UserMapper]
 */
object ProfileMapper {
    fun toDomain(user: UserEntity, profile: ProfileEntity?, photos: List<PhotoEntity>): UserDomainModel {
        return UserMapper.toDomain(user, profile, photos)
    }
}
