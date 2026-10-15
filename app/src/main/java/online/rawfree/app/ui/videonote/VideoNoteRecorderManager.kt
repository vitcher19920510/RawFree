package online.rawfree.app.ui.videonote

import android.content.Context
import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import androidx.camera.core.CameraSelector
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import java.io.File
import java.io.FileOutputStream

/**
 * Менеджер записи видеосообщений («кружков») через CameraX VideoCapture.
 * Ограничение длительности: 60 секунд, соотношение сторон 1:1.
 */
class VideoNoteRecorderManager(
    private val context: Context,
    private val lifecycleOwner: LifecycleOwner
) {
    private var videoCapture: VideoCapture<Recorder>? = null
    private var activeRecording: Recording? = null
    private var currentOutputFile: File? = null

    fun setupCamera(
        lensFacing: Int = CameraSelector.LENS_FACING_FRONT,
        onReady: () -> Unit,
        onError: (Throwable) -> Unit
    ) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()
                val recorder = Recorder.Builder()
                    .setQualitySelector(QualitySelector.from(Quality.SD))
                    .build()

                videoCapture = VideoCapture.withOutput(recorder)
                val cameraSelector = CameraSelector.Builder()
                    .requireLensFacing(lensFacing)
                    .build()

                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    videoCapture
                )
                onReady()
            } catch (e: Exception) {
                onError(e)
            }
        }, ContextCompat.getMainExecutor(context))
    }

    fun startRecording(
        outputDir: File,
        onProgress: (durationMs: Long) -> Unit,
        onFinished: (file: File, posterFile: File, durationMs: Long) -> Unit,
        onError: (Throwable) -> Unit
    ) {
        val capture = videoCapture ?: run {
            onError(IllegalStateException("Camera not initialized"))
            return
        }

        val outputFile = File(outputDir, "video_note_${System.currentTimeMillis()}.mp4")
        currentOutputFile = outputFile

        val fileOutputOptions = FileOutputOptions.Builder(outputFile).build()

        activeRecording = capture.output
            .prepareRecording(context, fileOutputOptions)
            .withAudioEnabled()
            .start(ContextCompat.getMainExecutor(context)) { recordEvent ->
                when (recordEvent) {
                    is VideoRecordEvent.Status -> {
                        val durationMs = recordEvent.recordingStats.recordedDurationNanos / 1_000_000
                        onProgress(durationMs)
                        if (durationMs >= 60_000) {
                            stopRecording()
                        }
                    }
                    is VideoRecordEvent.Finalize -> {
                        if (!recordEvent.hasError()) {
                            val posterFile = generatePosterThumbnail(outputFile)
                            val durationMs = recordEvent.recordingStats.recordedDurationNanos / 1_000_000
                            onFinished(outputFile, posterFile, durationMs)
                        } else {
                            onError(recordEvent.cause ?: Exception("Video recording failed"))
                        }
                    }
                }
            }
    }

    fun stopRecording() {
        activeRecording?.stop()
        activeRecording = null
    }

    fun cancelRecording() {
        activeRecording?.stop()
        activeRecording = null
        currentOutputFile?.delete()
        currentOutputFile = null
    }

    private fun generatePosterThumbnail(videoFile: File): File {
        val posterFile = File(videoFile.parentFile, "${videoFile.nameWithoutExtension}_poster.jpg")
        val retriever = MediaMetadataRetriever()
        try {
            retriever.setDataSource(videoFile.absolutePath)
            val bitmap = retriever.getFrameAtTime(0, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
            if (bitmap != null) {
                FileOutputStream(posterFile).use { out ->
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 85, out)
                }
            }
        } catch (_: Exception) {
        } finally {
            retriever.release()
        }
        return posterFile
    }
}
