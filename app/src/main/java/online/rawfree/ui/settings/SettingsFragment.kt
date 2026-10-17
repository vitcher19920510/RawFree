package online.rawfree.ui.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import dagger.hilt.android.AndroidEntryPoint
import online.rawfree.R
import online.rawfree.databinding.FragmentSettingsBinding

@AndroidEntryPoint
class SettingsFragment : Fragment() {

    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnEditProfile.setOnClickListener {
            findNavController().navigate(R.id.action_settingsFragment_to_myProfileFragment)
        }

        binding.btnSubscription.setOnClickListener {
            findNavController().navigate(R.id.action_settingsFragment_to_paywallFragment)
        }

        binding.btnTerms.setOnClickListener {
            findNavController().navigate(R.id.action_settingsFragment_to_legalDocumentFragment)
        }

        binding.btnPrivacy.setOnClickListener {
            findNavController().navigate(R.id.action_settingsFragment_to_legalDocumentFragment)
        }

        binding.btnDeleteAccount.setOnClickListener {
            // TODO: подтверждение удаления
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
