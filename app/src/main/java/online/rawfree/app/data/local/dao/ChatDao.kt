package online.rawfree.app.data.local.dao

import androidx.room.*
import kotlinx.coroutines.flow.Flow
import online.rawfree.app.data.local.entity.ChatEntity

@Dao
interface ChatDao {
    @Query("SELECT * FROM chats ORDER BY lastMessageAt DESC")
    fun getAllChatsFlow(): Flow<List<ChatEntity>>

    @Query("SELECT * FROM chats WHERE id = :chatId LIMIT 1")
    fun getChatFlow(chatId: String): Flow<ChatEntity?>

    @Query("UPDATE chats SET lastMessageText = :text, lastMessageAt = :time WHERE id = :chatId")
    suspend fun updateLastMessage(chatId: String, text: String, time: Long)

    @Query("UPDATE chats SET unreadCount = 0 WHERE id = :chatId")
    suspend fun resetUnreadCount(chatId: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChats(chats: List<ChatEntity>)

    @Query("DELETE FROM chats WHERE id = :chatId")
    suspend fun deleteChat(chatId: String)
}
