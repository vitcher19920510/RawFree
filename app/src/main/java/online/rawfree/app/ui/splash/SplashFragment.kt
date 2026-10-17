package online.rawfree.app.ui.splash

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import dagger.hilt.android.AndroidEntryPoint
import online.rawfree.app.R
import online.rawfree.app.databinding.FragmentSplashBinding

@AndroidEntryPoint
class SplashFragment : Fragment() {

    private var _binding: FragmentSplashBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SplashViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSplashBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel.checkAuth()

        viewModel.navigation.observe(viewLifecycleOwner) { nav ->
            when (nav) {
                is SplashNavigation.ToOnboarding -> {
                    findNavController().navigate(R.id.action_splashFragment_to_onboardingFragment)
                }
                is SplashNavigation.ToAuth -> {
                    findNavController().navigate(R.id.action_splashFragment_to_authFragment)
                }
                is SplashNavigation.ToPaywall -> {
                    findNavController().navigate(R.id.action_splashFragment_to_paywallFragment)
                }
                is SplashNavigation.ToMain -> {
                    findNavController().navigate(R.id.action_splashFragment_to_mainNearbyFragment)
                }
                null -> {}
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
