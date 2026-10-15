package online.rawfree.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "photos")
data class PhotoEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val url: String,
    @ColumnInfo(name = "photo_order") val order: Int,
    val isMain: Boolean
)
