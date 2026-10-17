package online.rawfree.app.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import online.rawfree.app.data.remote.ApiService
import online.rawfree.app.data.remote.dto.MatchResponse
import online.rawfree.app.util.Result

class MatchesRepository(
    private val api: ApiService,
) {

    suspend fun getMatches(): Result<List<MatchResponse>> = withContext(Dispatchers.IO) {
        return@withContext try {
            val matches = api.getMatches()
            Result.Success(matches)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Не удалось загрузить мэтчи", 0)
        }
    }
}
