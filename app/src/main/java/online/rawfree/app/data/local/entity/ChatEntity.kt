package online.rawfree.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "chats")
data class ChatEntity(
    @PrimaryKey val id: String,
    val matchId: String,
    val lastMessageText: String?,
    val lastMessageAt: Long,
    val unreadCount: Int
)
