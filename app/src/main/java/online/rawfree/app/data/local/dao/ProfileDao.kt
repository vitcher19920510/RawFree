package online.rawfree.app.data.local.dao

import androidx.room.*
import kotlinx.coroutines.flow.Flow
import online.rawfree.app.data.local.entity.ProfileEntity

@Dao
interface ProfileDao {
    @Query("SELECT * FROM profiles WHERE userId = :userId LIMIT 1")
    fun getProfileFlow(userId: String): Flow<ProfileEntity?>

    @Query("SELECT * FROM profiles WHERE userId = :userId LIMIT 1")
    suspend fun getProfile(userId: String): ProfileEntity?

    @Query("SELECT * FROM profiles WHERE userId IN (:ids)")
    fun getProfilesByIdsFlow(ids: List<String>): Flow<List<ProfileEntity>>

    @Query("SELECT * FROM profiles WHERE userId IN (:ids)")
    suspend fun getProfilesByIds(ids: List<String>): List<ProfileEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProfile(profile: ProfileEntity)

    @Query("DELETE FROM profiles WHERE userId = :userId")
    suspend fun deleteProfile(userId: String)
}
