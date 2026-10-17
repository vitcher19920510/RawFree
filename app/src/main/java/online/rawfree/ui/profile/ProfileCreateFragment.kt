package online.rawfree.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import dagger.hilt.android.AndroidEntryPoint
import online.rawfree.R
import online.rawfree.databinding.FragmentProfileCreateBinding

@AndroidEntryPoint
class ProfileCreateFragment : Fragment() {

    private var _binding: FragmentProfileCreateBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileCreateBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnSave.setOnClickListener {
            val name = binding.etName.text?.toString()?.trim()
            val bio = binding.etBio.text?.toString()?.trim()

            // TODO: сохранить профиль через API
            findNavController().navigate(R.id.action_profileCreateFragment_to_mainNearbyFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
