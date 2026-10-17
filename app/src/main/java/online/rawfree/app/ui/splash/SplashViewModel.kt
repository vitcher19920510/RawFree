package online.rawfree.app.ui.splash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import online.rawfree.app.data.remote.ApiService
import online.rawfree.app.util.AuthTokenStorage
import javax.inject.Inject

sealed class SplashNavigation {
    object ToOnboarding : SplashNavigation()
    object ToAuth : SplashNavigation()
    object ToPaywall : SplashNavigation()
    object ToMain : SplashNavigation()
}

@HiltViewModel
class SplashViewModel @Inject constructor(
    private val api: ApiService,
) : ViewModel() {

    private val _navigation = MutableStateFlow<SplashNavigation?>(null)
    val navigation: StateFlow<SplashNavigation?> = _navigation.asStateFlow()

    fun checkAuth() {
        viewModelScope.launch {
            if (!AuthTokenStorage.isLoggedIn()) {
                _navigation.value = SplashNavigation.ToOnboarding
                return@launch
            }

            // Токен есть — проверяем подписку
            try {
                val status = api.getSubscriptionStatus()
                if (status.isActive) {
                    _navigation.value = SplashNavigation.ToMain
                } else {
                    _navigation.value = SplashNavigation.ToPaywall
                }
            } catch (e: Exception) {
                // Ошибка сети — идём на Paywall (fail-closed)
                _navigation.value = SplashNavigation.ToPaywall
            }
        }
    }
}
