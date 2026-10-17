package online.rawfree.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import online.rawfree.app.data.repository.AuthRepository
import online.rawfree.app.util.Result

data class AuthUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val requiresOtp: Boolean = false,
    val otpMessage: String? = null,
)

@HiltViewModel
class AuthViewModel(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun onEmailChanged(email: String) {
        _uiState.value = _uiState.value.copy(email = email)
    }

    fun onPasswordChanged(password: String) {
        _uiState.value = _uiState.value.copy(password = password)
    }

    fun login() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)

            val result = authRepository.login(
                email = _uiState.value.email.takeIf { it.isNotEmpty() },
                phone = null,
                password = _uiState.value.password,
            )

            _uiState.value = _uiState.value.copy(isLoading = false)

            when (result) {
                is Result.Success -> {
                    if (result.data.requiresOtp == true) {
                        _uiState.value = _uiState.value.copy(
                            requiresOtp = true,
                            otpMessage = result.data.message,
                        )
                    } else {
                        _uiState.value = AuthUiState() // success — сброс
                    }
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

    fun verifySms(phone: String, code: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            val result = authRepository.verifySms(phone, code)

            _uiState.value = _uiState.value.copy(isLoading = false)

            if (result is Result.Success) {
                _uiState.value = AuthUiState()
            } else if (result is Result.Error) {
                _uiState.value = _uiState.value.copy(errorMessage = result.message)
            }
        }
    }

    fun verifyEmail(email: String, code: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            val result = authRepository.verifyEmail(email, code)

            _uiState.value = _uiState.value.copy(isLoading = false)

            if (result is Result.Success) {
                _uiState.value = AuthUiState()
            } else if (result is Result.Error) {
                _uiState.value = _uiState.value.copy(errorMessage = result.message)
            }
        }
    }
}
