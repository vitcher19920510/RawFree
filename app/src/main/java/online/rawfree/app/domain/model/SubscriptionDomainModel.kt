package online.rawfree.app.domain.model

data class SubscriptionDomainModel(
    val productId: String,
    val title: String,
    val price: String,
    val period: String,
    val isActive: Boolean,
    val expiresAt: Long?
)
