package online.rawfree.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "likes")
data class LikeEntity(
    @PrimaryKey val id: String,
    val fromUser: String,
    val toUser: String,
    val isSuper: Boolean,
    val createdAt: Long
)
