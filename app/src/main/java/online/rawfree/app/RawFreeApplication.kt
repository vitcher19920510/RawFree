package online.rawfree.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import online.rawfree.app.util.AuthTokenStorage

@HiltAndroidApp
class RawFreeApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        AuthTokenStorage.init(this)
    }
}
