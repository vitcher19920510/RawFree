package online.rawfree.app.domain.model

data class MessageDomainModel(
    val messageId: String,
    val chatId: String,
    val senderId: String,
    val text: String?,
    val photoUrl: String?,
    val videoNoteUrl: String?,
    val timestamp: Long,
    val isRead: Boolean,
    val isOutgoing: Boolean
)
