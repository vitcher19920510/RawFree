package online.rawfree.app.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import online.rawfree.app.data.remote.ApiService
import online.rawfree.app.data.remote.dto.FeedActionDto
import online.rawfree.app.data.remote.dto.FeedCardResponse
import online.rawfree.app.util.Result

class FeedRepository(
    private val api: ApiService,
) {

    suspend fun getFeed(page: Int = 1, limit: Int = 20): Result<List<FeedCardResponse>> = withContext(Dispatchers.IO) {
        return@withContext try {
            val cards = api.getFeed(page, limit)
            Result.Success(cards)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Не удалось загрузить ленту", 0)
        }
    }

    suspend fun like(targetUserId: String): Result<Unit> = withContext(Dispatchers.IO) {
        return@withContext try {
            api.like(FeedActionDto(targetUserId))
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Ошибка лайка", 0)
        }
    }

    suspend fun skip(targetUserId: String): Result<Unit> = withContext(Dispatchers.IO) {
        return@withContext try {
            api.skip(FeedActionDto(targetUserId))
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Ошибка пропуска", 0)
        }
    }

    suspend fun superlike(targetUserId: String): Result<Unit> = withContext(Dispatchers.IO) {
        return@withContext try {
            api.superlike(FeedActionDto(targetUserId, isSuper = true))
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Ошибка суперлайка", 0)
        }
    }
}
