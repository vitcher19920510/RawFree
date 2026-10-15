package online.rawfree.app.data.local.dao

import androidx.room.*
import kotlinx.coroutines.flow.Flow
import online.rawfree.app.data.local.entity.PhotoEntity

@Dao
interface PhotoDao {
    @Query("SELECT * FROM photos WHERE userId = :userId ORDER BY photo_order ASC")
    fun getPhotosFlow(userId: String): Flow<List<PhotoEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPhotos(photos: List<PhotoEntity>)

    @Query("DELETE FROM photos WHERE userId = :userId")
    suspend fun deletePhotosForUser(userId: String)
}
