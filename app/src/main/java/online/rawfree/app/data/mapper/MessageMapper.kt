package online.rawfree.app.data.mapper

import online.rawfree.app.data.local.entity.MessageEntity
import online.rawfree.app.domain.model.MessageDomainModel

object MessageMapper {
    fun toDomain(entity: MessageEntity, currentUserId: String): MessageDomainModel {
        return MessageDomainModel(
            messageId = entity.id,
            chatId = entity.chatId,
            senderId = entity.sender,
            text = entity.text,
            photoUrl = if (entity.mediaType == "photo") entity.mediaUrl else null,
            videoNoteUrl = if (entity.mediaType == "videonote") entity.mediaUrl else null,
            timestamp = entity.createdAt,
            isRead = entity.status == "read",
            isOutgoing = entity.sender == currentUserId
        )
    }

    fun toEntity(domain: MessageDomainModel): MessageEntity {
        val mediaType = when {
            domain.videoNoteUrl != null -> "videonote"
            domain.photoUrl != null -> "photo"
            else -> "text"
        }
        val mediaUrl = domain.videoNoteUrl ?: domain.photoUrl

        return MessageEntity(
            id = domain.messageId,
            chatId = domain.chatId,
            sender = domain.senderId,
            text = domain.text,
            mediaType = mediaType,
            mediaUrl = mediaUrl,
            posterUrl = null,
            durationMs = null,
            width = null,
            height = null,
            sizeBytes = null,
            status = if (domain.isRead) "read" else "sent",
            createdAt = domain.timestamp,
            readAt = if (domain.isRead) domain.timestamp else null,
            viewedAt = null
        )
    }
}
