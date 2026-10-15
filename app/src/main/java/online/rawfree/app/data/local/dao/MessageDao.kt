package online.rawfree.app.data.local.dao

import androidx.room.*
import kotlinx.coroutines.flow.Flow
import online.rawfree.app.data.local.entity.MessageEntity

@Dao
interface MessageDao {
    @Query("SELECT * FROM messages WHERE chatId = :chatId ORDER BY createdAt ASC")
    fun getMessagesFlow(chatId: String): Flow<List<MessageEntity>>

    @Query("SELECT * FROM messages WHERE chatId = :chatId ORDER BY createdAt DESC LIMIT 1")
    fun getLastMessageFlow(chatId: String): Flow<MessageEntity?>

    @Query("UPDATE messages SET status = 'read', readAt = :readAt WHERE id = :messageId")
    suspend fun markAsRead(messageId: String, readAt: Long)

    @Query("UPDATE messages SET status = :status WHERE id = :messageId")
    suspend fun updateStatus(messageId: String, status: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: MessageEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessages(messages: List<MessageEntity>)

    @Query("DELETE FROM messages WHERE chatId = :chatId")
    suspend fun deleteMessagesForChat(chatId: String)
}
