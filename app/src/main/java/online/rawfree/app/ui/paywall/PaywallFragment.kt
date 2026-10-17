package online.rawfree.app.ui.paywall

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import dagger.hilt.android.AndroidEntryPoint
import online.rawfree.app.R
import online.rawfree.app.databinding.FragmentPaywallBinding

@AndroidEntryPoint
class PaywallFragment : Fragment() {

    private var _binding: FragmentPaywallBinding? = null
    private val binding get() = _binding!!
    private val viewModel: PaywallViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPaywallBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rvPlans.layoutManager = LinearLayoutManager(requireContext())
        binding.rvPlans.adapter = PlanAdapter(viewModel.plans) { plan ->
            viewModel.purchasePlan(plan.id)
        }

        binding.btnRestore.setOnClickListener {
            // TODO: восстановить покупку
        }

        binding.tvLegal.setOnClickListener {
            findNavController().navigate(R.id.action_paywallFragment_to_legalDocumentFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
