package online.rawfree.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "messages")
data class MessageEntity(
    @PrimaryKey val id: String,
    val chatId: String,
    val sender: String,
    val text: String?,
    val mediaType: String?, // text, photo, videonote
    val mediaUrl: String?,
    val posterUrl: String?,
    val durationMs: Long?,
    val width: Int?,
    val height: Int?,
    val sizeBytes: Long?,
    val status: String, // sending, sent, delivered, read
    val createdAt: Long,
    val readAt: Long?,
    val viewedAt: Long?
)
