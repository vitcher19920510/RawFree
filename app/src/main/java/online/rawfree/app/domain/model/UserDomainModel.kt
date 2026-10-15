package online.rawfree.app.domain.model

data class UserDomainModel(
    val id: String,
    val name: String,
    val age: Int,
    val birthDate: String,
    val gender: String,
    val targetGender: String,
    val city: String,
    val photos: List<String>,
    val bio: String,
    val interests: List<String>,
    val distanceKm: Int?,
    val isVerified: Boolean,
    val isPremium: Boolean,
    val isIncognito: Boolean
)
