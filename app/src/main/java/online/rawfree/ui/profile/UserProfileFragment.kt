package online.rawfree.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import dagger.hilt.android.AndroidEntryPoint
import online.rawfree.R
import online.rawfree.databinding.FragmentUserProfileBinding

@AndroidEntryPoint
class UserProfileFragment : Fragment() {

    private var _binding: FragmentUserProfileBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentUserProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val targetUserId = arguments?.getString("userId") ?: ""

        binding.btnLike.setOnClickListener {
            // TODO: лайк
        }

        binding.btnSkip.setOnClickListener {
            // TODO: пропуск
        }

        binding.btnReport.setOnClickListener {
            findNavController().navigate(
                R.id.action_userProfileFragment_to_reportFragment
            )
        }

        binding.btnBlock.setOnClickListener {
            // TODO: блокировка
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
