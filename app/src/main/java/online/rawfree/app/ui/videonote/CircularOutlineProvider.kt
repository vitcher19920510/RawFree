package online.rawfree.app.ui.videonote

import android.graphics.Outline
import android.view.View
import android.view.ViewOutlineProvider

/**
 * Провайдер контура для обрезки View в ровный круг (View.clipToOutline = true)
 */
class CircularOutlineProvider : ViewOutlineProvider() {
    override fun getOutline(view: View, outline: Outline) {
        val diameter = minOf(view.width, view.height)
        val left = (view.width - diameter) / 2
        val top = (view.height - diameter) / 2
        outline.setOval(left, top, left + diameter, top + diameter)
    }
}
