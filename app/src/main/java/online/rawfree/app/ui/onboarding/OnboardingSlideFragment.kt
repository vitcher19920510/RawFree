package online.rawfree.app.ui.onboarding

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import online.rawfree.app.R
import online.rawfree.app.databinding.FragmentOnboardingSlideBinding

class OnboardingSlideFragment : Fragment() {

    private var _binding: FragmentOnboardingSlideBinding? = null
    private val binding get() = _binding!!

    companion object {
        private const val ARG_SLIDE = "slide"

        fun newInstance(slide: OnboardingSlide): Fragment {
            return OnboardingSlideFragment().apply {
                arguments = Bundle().apply {
                    putParcelable(ARG_SLIDE, slide)
                }
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOnboardingSlideBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val slide = arguments?.getParcelable<OnboardingSlide>(ARG_SLIDE) ?: return

        binding.ivIcon.setImageResource(slide.iconRes)
        binding.tvTitle.text = getString(slide.titleRes)
        binding.tvDescription.text = getString(slide.descriptionRes)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
