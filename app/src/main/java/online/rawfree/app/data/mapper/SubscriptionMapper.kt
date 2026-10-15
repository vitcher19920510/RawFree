package online.rawfree.app.data.mapper

import online.rawfree.app.data.local.entity.SubscriptionEntity
import online.rawfree.app.domain.model.SubscriptionDomainModel

object SubscriptionMapper {
    fun toDomain(entity: SubscriptionEntity): SubscriptionDomainModel {
        return SubscriptionDomainModel(
            productId = entity.plan,
            title = "Премиум 7 дней",
            price = entity.price,
            period = "7 дней",
            isActive = entity.status == "ACTIVE" && entity.expiresAt > System.currentTimeMillis(),
            expiresAt = entity.expiresAt
        )
    }

    fun toEntity(domain: SubscriptionDomainModel, userId: String): SubscriptionEntity {
        return SubscriptionEntity(
            userId = userId,
            plan = domain.productId,
            price = domain.price,
            startedAt = System.currentTimeMillis(),
            expiresAt = domain.expiresAt ?: (System.currentTimeMillis() + 7 * 24 * 3600 * 1000L),
            autoRenew = true,
            platform = "RUSTORE",
            purchaseToken = "",
            status = if (domain.isActive) "ACTIVE" else "EXPIRED"
        )
    }
}
