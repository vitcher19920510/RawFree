package online.rawfree.app.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import online.rawfree.app.data.remote.ApiService
import online.rawfree.app.data.remote.dto.ChatResponse
import online.rawfree.app.data.remote.dto.MessageResponse
import online.rawfree.app.data.remote.dto.SendMessageDto
import online.rawfree.app.util.Result

class ChatsRepository(
    private val api: ApiService,
) {

    suspend fun getChats(): Result<List<ChatResponse>> = withContext(Dispatchers.IO) {
        return@withContext try {
            val chats = api.getChats()
            Result.Success(chats)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Не удалось загрузить чаты", 0)
        }
    }

    suspend fun getMessages(chatId: String, limit: Int = 50): Result<List<MessageResponse>> = withContext(Dispatchers.IO) {
        return@withContext try {
            val messages = api.getMessages(chatId, limit)
            Result.Success(messages)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Не удалось загрузить сообщения", 0)
        }
    }

    suspend fun sendMessage(chatId: String, dto: SendMessageDto): Result<MessageResponse> = withContext(Dispatchers.IO) {
        return@withContext try {
            val message = api.sendMessage(chatId, dto)
            Result.Success(message)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Не удалось отправить сообщение", 0)
        }
    }
}
