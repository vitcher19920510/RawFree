package online.rawfree.app.data.mapper

import online.rawfree.app.data.local.entity.PhotoEntity
import online.rawfree.app.data.local.entity.ProfileEntity
import online.rawfree.app.data.local.entity.UserEntity
import online.rawfree.app.domain.model.UserDomainModel

object UserMapper {
    fun toDomain(
        user: UserEntity,
        profile: ProfileEntity?,
        photos: List<PhotoEntity>
    ): UserDomainModel {
        val sortedPhotoUrls = photos.sortedWith(
            compareByDescending<PhotoEntity> { it.isMain }.thenBy { it.order }
        ).map { it.url }

        return UserDomainModel(
            id = user.id,
            name = profile?.name ?: "",
            age = profile?.age ?: 0,
            birthDate = "",
            gender = profile?.gender ?: "",
            targetGender = profile?.lookingFor ?: "",
            city = profile?.city ?: "",
            photos = sortedPhotoUrls,
            bio = profile?.bio ?: "",
            interests = emptyList(),
            distanceKm = null,
            isVerified = profile?.verificationStatus == "VERIFIED",
            isPremium = false,
            isIncognito = profile?.hiddenFromFeed ?: false
        )
    }

    fun toEntity(domain: UserDomainModel): UserEntity {
        return UserEntity(
            id = domain.id,
            email = null,
            phone = null,
            tokenPair = null,
            createdAt = System.currentTimeMillis(),
            is18 = domain.age >= 18
        )
    }
}
