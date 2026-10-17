package online.rawfree.ui.legal

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import dagger.hilt.android.AndroidEntryPoint
import online.rawfree.databinding.FragmentLegalDocumentBinding

@AndroidEntryPoint
class LegalDocumentFragment : Fragment() {

    private var _binding: FragmentLegalDocumentBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLegalDocumentBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val code = arguments?.getString("code") ?: "terms"

        // TODO: загрузить документ через API
        when (code) {
            "terms" -> {
                binding.tvTitle.text = "Пользовательское соглашение"
                binding.tvBody.text = "Текст пользовательского соглашения..."
            }
            "privacy" -> {
                binding.tvTitle.text = "Политика конфиденциальности"
                binding.tvBody.text = "Текст политики конфиденциальности..."
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
