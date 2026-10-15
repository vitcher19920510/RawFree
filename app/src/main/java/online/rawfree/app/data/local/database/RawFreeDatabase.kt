package online.rawfree.app.data.local.database

import androidx.room.Database
import androidx.room.RoomDatabase
import online.rawfree.app.data.local.dao.*
import online.rawfree.app.data.local.entity.*

@Database(
    entities = [
        UserEntity::class,
        ProfileEntity::class,
        PhotoEntity::class,
        LikeEntity::class,
        MatchEntity::class,
        ChatEntity::class,
        MessageEntity::class,
        SubscriptionEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class RawFreeDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun profileDao(): ProfileDao
    abstract fun photoDao(): PhotoDao
    abstract fun chatDao(): ChatDao
    abstract fun messageDao(): MessageDao
    abstract fun subscriptionDao(): SubscriptionDao
}
