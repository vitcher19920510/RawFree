package online.rawfree.app.ui.onboarding

import android.content.Context
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentPagerAdapter
import androidx.viewpager2.widget.ViewPager2
import online.rawfree.app.R

class OnboardingPagerAdapter(
    context: Context,
) : FragmentPagerAdapter(
        androidx.fragment.app.FragmentActivity(context),
        BEHAVIOR_RESUME_ONLY_CURRENT_FRAGMENT,
    ) {

    private val slides = listOf(
        OnboardingSlide(
            titleRes = R.string.onboarding_title_1,
            descriptionRes = R.string.onboarding_desc_1,
            iconRes = R.drawable.ic_nav_nearby,
        ),
        OnboardingSlide(
            titleRes = R.string.onboarding_title_2,
            descriptionRes = R.string.onboarding_desc_2,
            iconRes = android.R.drawable.ic_menu_myplaces,
        ),
        OnboardingSlide(
            titleRes = R.string.onboarding_title_3,
            descriptionRes = R.string.onboarding_desc_3,
            iconRes = android.R.drawable.ic_lock_lock,
        ),
    )

    override fun getItem(position: Int): Fragment {
        return OnboardingSlideFragment.newInstance(slides[position])
    }

    override fun getCount: Int = slides.size
}

data class OnboardingSlide(
    val titleRes: Int,
    val descriptionRes: Int,
    val iconRes: Int,
)
