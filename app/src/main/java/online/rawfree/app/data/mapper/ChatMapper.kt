package online.rawfree.app.data.mapper

import online.rawfree.app.data.local.entity.ChatEntity
import online.rawfree.app.domain.model.ChatDomainModel
import online.rawfree.app.domain.model.UserDomainModel

object ChatMapper {
    fun toDomain(chat: ChatEntity, peerUser: UserDomainModel): ChatDomainModel {
        return ChatDomainModel(
            chatId = chat.id,
            peerUser = peerUser,
            lastMessage = null,
            unreadCount = chat.unreadCount,
            updatedAt = chat.lastMessageAt
        )
    }
}
