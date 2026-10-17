package online.rawfree.ui.admin

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import dagger.hilt.android.AndroidEntryPoint
import online.rawfree.R
import online.rawfree.databinding.FragmentAdminInAppBinding

@AndroidEntryPoint
class AdminInAppFragment : Fragment() {

    private var _binding: FragmentAdminInAppBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAdminInAppBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // TODO: встроить WebView с admin.rawfree.ru
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
