package online.rawfree.app.data.remote

import online.rawfree.app.data.remote.dto.*
import retrofit2.http.*

interface ApiService {

    // ==================== AUTH ====================

    @POST("auth/register")
    suspend fun register(@Body dto: RegisterDto): AuthResponse

    @POST("auth/login")
    suspend fun login(@Body dto: LoginDto): AuthResponse

    @POST("auth/verify")
    suspend fun verifySms(@Body dto: VerifySmsDto): AuthResponse

    @POST("auth/verify-email")
    suspend fun verifyEmail(@Body dto: VerifyEmailDto): AuthResponse

    @POST("auth/refresh")
    suspend fun refreshToken(@Body dto: RefreshTokenDto): AuthResponse

    @POST("auth/recover")
    suspend fun recoverAccess(@Body dto: RecoverAccessDto)

    @POST("auth/reset-password")
    suspend fun resetPassword(@Body dto: ResetPasswordDto)

    // ==================== PROFILE ====================

    @GET("profile")
    suspend fun getProfile(): UserProfileResponse

    @PUT("profile")
    suspend fun updateProfile(@Body dto: Map<String, Any>)

    @POST("profile/photos")
    @Multipart
    suspend fun uploadPhoto(@PartMap files: Map<String, Any>): List<Map<String, String>>

    @DELETE("profile/photos/{id}")
    suspend fun deletePhoto(@Path("id") photoId: String)

    @POST("profile/hide")
    suspend fun hideProfile(@Body dto: Map<String, Boolean>)

    // ==================== FEED ====================

    @GET("feed")
    suspend fun getFeed(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): List<FeedCardResponse>

    @POST("feed/like")
    suspend fun like(@Body dto: FeedActionDto)

    @POST("feed/skip")
    suspend fun skip(@Body dto: FeedActionDto)

    @POST("feed/superlike")
    suspend fun superlike(@Body dto: FeedActionDto)

    // ==================== MATCHES ====================

    @GET("matches")
    suspend fun getMatches(): List<MatchResponse>

    // ==================== CHATS ====================

    @GET("chats")
    suspend fun getChats(): List<ChatResponse>

    @GET("chats/{id}/messages")
    suspend fun getMessages(
        @Path("id") chatId: String,
        @Query("limit") limit: Int = 50,
        @Query("before") before: String? = null,
    ): List<MessageResponse>

    @POST("chats/{id}/messages")
    suspend fun sendMessage(
        @Path("id") chatId: String,
        @Body dto: SendMessageDto,
    ): MessageResponse

    // ==================== SUBSCRIPTION ====================

    @GET("subscription/plans")
    suspend fun getPlans(): List<SubscriptionPlan>

    @GET("subscription/status")
    suspend fun getSubscriptionStatus(): SubscriptionStatusResponse

    @POST("subscription/verify")
    suspend fun verifyPurchase(@Body dto: SubscriptionVerifyDto)

    @POST("subscription/cancel")
    suspend fun cancelSubscription(@Body reason: String? = null)

    // ==================== MISC ====================

    @POST("incognito")
    suspend fun enableIncognito()

    @DELETE("incognito")
    suspend fun disableIncognito()

    @GET("blocked")
    suspend fun getBlockedUsers(): List<Map<String, Any>>

    @POST("blocked")
    suspend fun blockUser(@Body dto: Map<String, String>)

    @DELETE("blocked/{id}")
    suspend fun unblockUser(@Path("id") targetId: String)

    @POST("reports")
    suspend fun sendReport(@Body dto: ReportDto)

    @GET("interests")
    suspend fun getInterests(): List<Map<String, Any>>

    @PUT("interests")
    suspend fun updateInterests(@Body dto: Map<String, List<String>>)

    @GET("legal/{code}")
    suspend fun getLegalDoc(@Path("code") code: String)

    @POST("client-errors")
    suspend fun logClientError(@Body dto: Map<String, Any>)
}
