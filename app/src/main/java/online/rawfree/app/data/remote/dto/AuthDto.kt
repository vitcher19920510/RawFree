package online.rawfree.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ==================== Auth DTOs ====================

@Serializable
data class RegisterDto(
    val email: String? = null,
    val phone: String? = null,
    val password: String,
    val confirmPassword: String,
)

@Serializable
data class LoginDto(
    val email: String? = null,
    val phone: String? = null,
    val password: String? = null,
)

@Serializable
data class VerifySmsDto(
    val phone: String,
    val code: String,
)

@Serializable
data class VerifyEmailDto(
    val email: String,
    val code: String,
)

@Serializable
data class RefreshTokenDto(
    val refreshToken: String,
)

@Serializable
data class RecoverAccessDto(
    val email: String? = null,
    val phone: String? = null,
)

@Serializable
data class ResetPasswordDto(
    val token: String,
    val password: String,
    val confirmPassword: String,
)

// ==================== Auth Response DTOs ====================

@Serializable
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val requiresOtp: Boolean? = null,
    val message: String? = null,
)

@Serializable
data class UserProfileResponse(
    val id: String,
    val email: String?,
    val phone: String?,
    val isVerified: Boolean,
    val is18: Boolean,
    val createdAt: String,
    val profile: ProfileResponse?,
    val subscription: SubscriptionResponse?,
)

@Serializable
data class ProfileResponse(
    val userId: String,
    val name: String,
    val age: Int,
    val gender: String,
    val lookingFor: String,
    val city: String,
    val geoLat: Double?,
    val geoLon: Double?,
    val height: Int?,
    val bio: String,
    val hiddenFromFeed: Boolean,
    val verificationStatus: String,
)

// ==================== Subscription DTOs ====================

@Serializable
data class SubscriptionStatusResponse(
    val isActive: Boolean,
    val plan: String? = null,
    val expiresAt: String? = null,
)

@Serializable
data class SubscriptionPlan(
    val id: String,
    val title: String,
    val priceCents: Int,
    val periodDays: Int,
    val savingsPercent: Int,
    val savingsLabel: String?,
)

@Serializable
data class SubscriptionVerifyDto(
    val plan: String,
    val platform: String,
    val purchaseToken: String,
)

// ==================== Feed DTOs ====================

@Serializable
data class FeedCardResponse(
    val id: String,
    val name: String,
    val age: Int,
    val city: String,
    val bio: String,
    val photoUrl: String?,
    val distance: Double?,
)

@Serializable
data class FeedActionDto(
    val targetUserId: String,
    val isSuper: Boolean = false,
)

// ==================== Match DTOs ====================

@Serializable
data class MatchResponse(
    val id: String,
    val userA: String,
    val userB: String,
    val createdAt: String,
    val peerUser: PeerUserResponse?,
)

@Serializable
data class PeerUserResponse(
    val userId: String,
    val name: String,
    val photoUrl: String?,
)

// ==================== Chat DTOs ====================

@Serializable
data class ChatResponse(
    val chatId: String,
    val matchId: String,
    val peerUser: PeerUserResponse,
    val lastMessage: LastMessageResponse?,
    val unreadCount: Int,
    val updatedAt: String,
)

@Serializable
data class LastMessageResponse(
    val text: String?,
    val mediaType: String?,
    val createdAt: String,
)

@Serializable
data class MessageResponse(
    val id: String,
    val chatId: String,
    val senderId: String,
    val text: String?,
    val mediaType: String,
    val mediaUrl: String?,
    val posterUrl: String?,
    val durationMs: Int?,
    val width: Int?,
    val height: Int?,
    val sizeBytes: Int?,
    val status: String,
    val createdAt: String,
    val readAt: String?,
    val sender: PeerUserResponse,
)

@Serializable
data class SendMessageDto(
    val text: String? = null,
    val mediaType: String? = "text",
    val mediaUrl: String? = null,
    val posterUrl: String? = null,
    val durationMs: Int? = null,
    val width: Int? = null,
    val height: Int? = null,
    val sizeBytes: Int? = null,
)

// ==================== Report DTOs ====================

@Serializable
data class ReportDto(
    val targetUserId: String,
    val reason: String,
    val comment: String? = null,
)

// ==================== Error DTO ====================

@Serializable
data class ErrorResponse(
    val message: String?,
    val error: String?,
    val statusCode: Int?,
)
