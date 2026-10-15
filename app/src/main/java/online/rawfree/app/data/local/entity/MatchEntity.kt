package online.rawfree.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "matches")
data class MatchEntity(
    @PrimaryKey val id: String,
    val userA: String,
    val userB: String,
    val createdAt: Long
)
