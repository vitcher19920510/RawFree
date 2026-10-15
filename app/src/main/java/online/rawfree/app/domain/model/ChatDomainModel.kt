package online.rawfree.app.domain.model

data class ChatDomainModel(
    val chatId: String,
    val peerUser: UserDomainModel,
    val lastMessage: MessageDomainModel?,
    val unreadCount: Int,
    val updatedAt: Long
)
