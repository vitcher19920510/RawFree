package online.rawfree.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "subscriptions")
data class SubscriptionEntity(
    @PrimaryKey val userId: String,
    val plan: String,
    val price: String,
    val startedAt: Long,
    val expiresAt: Long,
    val autoRenew: Boolean,
    val platform: String,
    val purchaseToken: String,
    val status: String
)
