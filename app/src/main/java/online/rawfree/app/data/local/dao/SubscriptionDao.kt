package online.rawfree.app.data.local.dao

import androidx.room.*
import kotlinx.coroutines.flow.Flow
import online.rawfree.app.data.local.entity.SubscriptionEntity

@Dao
interface SubscriptionDao {
    @Query("SELECT * FROM subscriptions WHERE userId = :userId LIMIT 1")
    fun getSubscriptionFlow(userId: String): Flow<SubscriptionEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubscription(subscription: SubscriptionEntity)

    @Query("DELETE FROM subscriptions WHERE userId = :userId")
    suspend fun deleteSubscription(userId: String)
}
