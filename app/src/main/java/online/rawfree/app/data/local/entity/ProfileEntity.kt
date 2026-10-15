package online.rawfree.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "profiles")
data class ProfileEntity(
    @PrimaryKey val userId: String,
    val name: String,
    val age: Int,
    val gender: String,
    val lookingFor: String,
    val city: String,
    val geoLat: Double?,
    val geoLon: Double?,
    val height: Int?,
    val bio: String,
    val hiddenFromFeed: Boolean,
    val verificationStatus: String
)
