package online.rawfree.app.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import dagger.hilt.android.AndroidEntryPoint
import online.rawfree.app.R
import online.rawfree.app.databinding.FragmentAuthBinding

@AndroidEntryPoint
class AuthFragment : Fragment() {

    private var _binding: FragmentAuthBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AuthViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAuthBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Наблюдаем за состоянием
        viewModel.uiState.observe(viewLifecycleOwner) { state ->
            binding.progressBar.isVisible = state.isLoading
            state.errorMessage?.let { error ->
                binding.tvError.text = error
                binding.tvError.visibility = View.VISIBLE
            }
        }

        binding.btnLogin.setOnClickListener {
            viewModel.login()
        }

        binding.btnRegister.setOnClickListener {
            // TODO: перейти на регистрацию или переключить режим
        }

        binding.tvForgotPassword.setOnClickListener {
            // TODO: восстановить пароль
        }

        binding.tvLegal.setOnClickListener {
            findNavController().navigate(R.id.action_authFragment_to_legalDocumentFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
