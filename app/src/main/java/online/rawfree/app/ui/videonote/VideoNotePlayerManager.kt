package online.rawfree.app.ui.videonote

import android.content.Context
import android.net.Uri
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

/**
 * Менеджер воспроизведения круглых видеосообщений через Media3 ExoPlayer.
 * Гарантирует воспроизведение строго одного кружка одновременно.
 */
class VideoNotePlayerManager(private val context: Context) {

    private var exoPlayer: ExoPlayer? = null
    private var currentPlayingUrl: String? = null
    private var isDoubleSpeed: Boolean = false

    init {
        exoPlayer = ExoPlayer.Builder(context).build().apply {
            repeatMode = Player.REPEAT_MODE_OFF
        }
    }

    fun playVideoNote(
        url: String,
        playerView: PlayerView,
        onPlaybackStateChanged: (isPlaying: Boolean, progressPercent: Float) -> Unit,
        onEnded: () -> Unit
    ) {
        val player = exoPlayer ?: return

        if (currentPlayingUrl == url && player.isPlaying) {
            player.pause()
            onPlaybackStateChanged(false, getProgressPercent())
            return
        }

        if (currentPlayingUrl != url) {
            currentPlayingUrl = url
            playerView.player = player
            val mediaItem = MediaItem.fromUri(Uri.parse(url))
            player.setMediaItem(mediaItem)
            player.prepare()
        }

        player.playbackParameters = PlaybackParameters(if (isDoubleSpeed) 2.0f else 1.0f)
        player.play()
        onPlaybackStateChanged(true, getProgressPercent())

        player.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_ENDED) {
                    currentPlayingUrl = null
                    onEnded()
                }
            }
        })
    }

    fun pause() {
        exoPlayer?.pause()
    }

    fun toggleSpeed(): Float {
        isDoubleSpeed = !isDoubleSpeed
        val speed = if (isDoubleSpeed) 2.0f else 1.0f
        exoPlayer?.playbackParameters = PlaybackParameters(speed)
        return speed
    }

    fun release() {
        exoPlayer?.release()
        exoPlayer = null
        currentPlayingUrl = null
    }

    private fun getProgressPercent(): Float {
        val player = exoPlayer ?: return 0f
        val duration = player.duration
        val position = player.currentPosition
        if (duration <= 0) return 0f
        return (position.toFloat() / duration.toFloat()) * 100f
    }
}
