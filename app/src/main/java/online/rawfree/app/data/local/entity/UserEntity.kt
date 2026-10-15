package online.rawfree.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val email: String?,
    val phone: String?,
    val tokenPair: String?, // Encrypted reference link
    val createdAt: Long,
    val is18: Boolean
)
