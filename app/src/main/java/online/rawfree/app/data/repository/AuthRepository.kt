package online.rawfree.app.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import online.rawfree.app.data.remote.ApiService
import online.rawfree.app.data.remote.dto.*
import online.rawfree.app.util.AuthTokenStorage
import online.rawfree.app.util.Result

class AuthRepository(
    private val api: ApiService,
) {

    suspend fun register(
        email: String?,
        phone: String?,
        password: String,
        confirmPassword: String,
    ): Result<AuthResponse> = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = api.register(RegisterDto(email, phone, password, confirmPassword))
            AuthTokenStorage.saveTokens(response.accessToken, response.refreshToken)
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Регистрация не удалась", 0)
        }
    }

    suspend fun login(
        email: String?,
        phone: String?,
        password: String?,
    ): Result<AuthResponse> = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = api.login(LoginDto(email, phone, password))
            if (!response.requiresOtp && response.accessToken.isNotEmpty()) {
                AuthTokenStorage.saveTokens(response.accessToken, response.refreshToken)
            }
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Вход не удался", 0)
        }
    }

    suspend fun verifySms(phone: String, code: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = api.verifySms(VerifySmsDto(phone, code))
            AuthTokenStorage.saveTokens(response.accessToken, response.refreshToken)
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Подтверждение не удалось", 0)
        }
    }

    suspend fun verifyEmail(email: String, code: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = api.verifyEmail(VerifyEmailDto(email, code))
            AuthTokenStorage.saveTokens(response.accessToken, response.refreshToken)
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Подтверждение не удалось", 0)
        }
    }

    suspend fun refreshToken(refreshToken: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = api.refreshToken(RefreshTokenDto(refreshToken))
            AuthTokenStorage.saveTokens(response.accessToken, response.refreshToken)
            Result.Success(response)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Обновление токена не удалось", 0)
        }
    }

    suspend fun recoverAccess(email: String?, phone: String?) = withContext(Dispatchers.IO) {
        api.recoverAccess(RecoverAccessDto(email, phone))
    }

    suspend fun resetPassword(token: String, password: String, confirmPassword: String) = withContext(Dispatchers.IO) {
        api.resetPassword(ResetPasswordDto(token, password, confirmPassword))
    }

    suspend fun isLoggedIn(): Boolean = AuthTokenStorage.isLoggedIn()

    suspend fun logout() = withContext(Dispatchers.IO) {
        AuthTokenStorage.clear()
    }
}
