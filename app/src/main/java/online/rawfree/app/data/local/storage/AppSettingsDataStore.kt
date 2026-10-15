package online.rawfree.app.data.local.storage

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "app_settings")

/**
 * Хранилище пользовательских настроек на базе DataStore Preferences
 */
class AppSettingsDataStore(private val context: Context) {

    val isDarkThemeFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_DARK_THEME] ?: true
    }

    val isOnboardingCompletedFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_ONBOARDING_COMPLETED] ?: false
    }

    val isDebugSubscribedFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_DEBUG_SUBSCRIBED] ?: false
    }

    suspend fun setDarkTheme(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_DARK_THEME] = enabled
        }
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ONBOARDING_COMPLETED] = completed
        }
    }

    suspend fun setDebugSubscribed(subscribed: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_DEBUG_SUBSCRIBED] = subscribed
        }
    }

    companion object {
        private val KEY_DARK_THEME = booleanPreferencesKey("dark_theme")
        private val KEY_ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
        private val KEY_DEBUG_SUBSCRIBED = booleanPreferencesKey("debug_subscribed")
    }
}
