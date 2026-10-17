package online.rawfree.app.ui.nearby

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import online.rawfree.app.data.repository.FeedRepository
import online.rawfree.app.data.remote.dto.FeedCardResponse
import online.rawfree.app.util.Result

data class FeedUiState(
    val cards: List<FeedCardResponse> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val currentIndex: Int = 0,
)

@HiltViewModel
class FeedViewModel @Inject constructor(
    private val feedRepository: FeedRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(FeedUiState())
    val uiState: StateFlow<FeedUiState> = _uiState.asStateFlow()

    init {
        loadFeed()
    }

    fun loadFeed() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            val result = feedRepository.getFeed()

            _uiState.value = _uiState.value.copy(isLoading = false)

            when (result) {
                is Result.Success -> {
                    _uiState.value = _uiState.value.copy(
                        cards = result.data,
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

    fun like() {
        val state = _uiState.value
        if (state.cards.isEmpty() || state.currentIndex >= state.cards.size) return

        val card = state.cards[state.currentIndex]
        viewModelScope.launch {
            val result = feedRepository.like(card.id)
            if (result is Result.Success) {
                swipeRight()
            }
        }
    }

    fun skip() {
        val state = _uiState.value
        if (state.cards.isEmpty() || state.currentIndex >= state.cards.size) return
        viewModelScope.launch {
            val result = feedRepository.skip(state.cards[state.currentIndex].id)
            if (result is Result.Success) {
                swipeLeft()
            }
        }
    }

    fun superlike() {
        val state = _uiState.value
        if (state.cards.isEmpty() || state.currentIndex >= state.cards.size) return

        val card = state.cards[state.currentIndex]
        viewModelScope.launch {
            val result = feedRepository.superlike(card.id)
            if (result is Result.Success) {
                swipeRight()
            }
        }
    }

    fun swipeLeft() {
        if (_uiState.value.currentIndex < _uiState.value.cards.size - 1) {
            _uiState.value = _uiState.value.copy(currentIndex = _uiState.value.currentIndex + 1)
        }
    }

    fun swipeRight() {
        if (_uiState.value.currentIndex < _uiState.value.cards.size - 1) {
            _uiState.value = _uiState.value.copy(currentIndex = _uiState.value.currentIndex + 1)
        }
    }

    fun getCurrentCard(): FeedCardResponse? {
        val state = _uiState.value
        return if (state.currentIndex < state.cards.size) state.cards[state.currentIndex] else null
    }
}
