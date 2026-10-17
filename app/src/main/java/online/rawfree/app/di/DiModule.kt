package online.rawfree.app.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import online.rawfree.app.data.repository.AuthRepository
import online.rawfree.app.data.remote.ApiService
import online.rawfree.app.data.remote.RetrofitClient
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DiModule {

    @Provides
    @Singleton
    fun provideApiService(): ApiService = RetrofitClient.api

    @Provides
    @Singleton
    fun provideAuthRepository(api: ApiService): AuthRepository = AuthRepository(api)
}
