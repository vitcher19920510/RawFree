package online.rawfree.app.ui.chats

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import online.rawfree.app.data.repository.ChatsRepository
import online.rawfree.app.data.remote.dto.MessageResponse
import online.rawfree.app.util.Result

data class ChatDetailUiState(
    val messages: List<MessageResponse> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
)

@HiltViewModel
class ChatDetailViewModel @Inject constructor(
    private val chatsRepository: ChatsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatDetailUiState())
    val uiState: StateFlow<ChatDetailUiState> = _uiState.asStateFlow()

    fun loadMessages(chatId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            val result = chatsRepository.getMessages(chatId)

            _uiState.value = _uiState.value.copy(isLoading = false)

            when (result) {
                is Result.Success -> {
                    _uiState.value = _uiState.value.copy(
                        messages = result.data,
                        errorMessage = null,
                    )
                }
                is Result.Error -> {
                    _uiState.value = _uiState.value.copy(
                        errorMessage = result.message,
                    )
                }
                is Result.Loading -> {}
            }
        }
    }

    fun sendMessage(chatId: String, text: String) {
        viewModelScope.launch {
            val result = chatsRepository.sendMessage(chatId, online.rawfree.app.data.remote.dto.SendMessageDto(text = text))
            if (result is Result.Success) {
                // Message sent via HTTP, WebSocket will handle real-time delivery
            }
        }
    }
}
