package online.rawfree.app.data.local.storage

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

private val Context.authDataStore by preferencesDataStore(name = "secure_auth_tokens")

/**
 * Хранилище токенов авторизации на базе Preferences DataStore и Android Keystore (AES/GCM/NoPadding).
 *
 * ПОЧЕМУ НЕ EncryptedSharedPreferences:
 * Библиотека `androidx.security:security-crypto` помечена deprecated, новых релизов не планируется.
 * Для безопасного хранения используется сочетание стандартного Preferences DataStore
 * и аппаратного шифрования Android Keystore.
 */
class AuthTokenStorage(private val context: Context) {

    private val keyAlias = "rawfree_auth_token_key"
    private val provider = "AndroidKeyStore"

    private fun getOrCreateSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(provider).apply { load(null) }
        if (keyStore.containsAlias(keyAlias)) {
            val entry = keyStore.getEntry(keyAlias, null) as KeyStore.SecretKeyEntry
            return entry.secretKey
        }

        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, provider)
        val keyGenSpec = KeyGenParameterSpec.Builder(
            keyAlias,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build()

        keyGenerator.init(keyGenSpec)
        return keyGenerator.generateKey()
    }

    private fun encrypt(plainText: String): String {
        if (plainText.isEmpty()) return ""
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateSecretKey())
        val iv = cipher.iv
        val encryptedBytes = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))

        val combined = ByteArray(iv.size + encryptedBytes.size)
        System.arraycopy(iv, 0, combined, 0, iv.size)
        System.arraycopy(encryptedBytes, 0, combined, iv.size, encryptedBytes.size)

        return Base64.encodeToString(combined, Base64.NO_WRAP)
    }

    private fun decrypt(encryptedBase64: String?): String? {
        if (encryptedBase64.isNullOrEmpty()) return null
        return try {
            val combined = Base64.decode(encryptedBase64, Base64.NO_WRAP)
            if (combined.size <= 12) return null // GCM IV is 12 bytes

            val iv = ByteArray(12)
            val encryptedBytes = ByteArray(combined.size - 12)
            System.arraycopy(combined, 0, iv, 0, 12)
            System.arraycopy(combined, 12, encryptedBytes, 0, encryptedBytes.size)

            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            val gcmSpec = GCMParameterSpec(128, iv)
            cipher.init(Cipher.DECRYPT_MODE, getOrCreateSecretKey(), gcmSpec)

            val decryptedBytes = cipher.doFinal(encryptedBytes)
            String(decryptedBytes, Charsets.UTF_8)
        } catch (e: Exception) {
            Log.e("AuthTokenStorage", "Error decrypting stored token", e)
            null
        }
    }

    suspend fun saveTokens(accessToken: String, refreshToken: String) {
        val encryptedAccess = encrypt(accessToken)
        val encryptedRefresh = encrypt(refreshToken)

        context.authDataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = encryptedAccess
            prefs[KEY_REFRESH_TOKEN] = encryptedRefresh
        }
    }

    suspend fun getAccessToken(): String? {
        val encrypted = context.authDataStore.data.map { prefs ->
            prefs[KEY_ACCESS_TOKEN]
        }.first()
        return decrypt(encrypted)
    }

    suspend fun getRefreshToken(): String? {
        val encrypted = context.authDataStore.data.map { prefs ->
            prefs[KEY_REFRESH_TOKEN]
        }.first()
        return decrypt(encrypted)
    }

    suspend fun clear() {
        context.authDataStore.edit { prefs ->
            prefs.clear()
        }
    }

    companion object {
        private val KEY_ACCESS_TOKEN = stringPreferencesKey("encrypted_access_token")
        private val KEY_REFRESH_TOKEN = stringPreferencesKey("encrypted_refresh_token")
    }
}
