package online.rawfree.app.ui.nearby

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import online.rawfree.app.R
import online.rawfree.app.databinding.FragmentMainNearbyBinding
import online.rawfree.app.data.remote.dto.FeedCardResponse
import kotlin.math.abs

@AndroidEntryPoint
class MainNearbyFragment : Fragment() {

    private var _binding: FragmentMainNearbyBinding? = null
    private val binding get() = _binding!!
    private val viewModel: FeedViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMainNearbyBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        observeState()
        setupSwipeGestures()
        setupButtons()
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                binding.progressBar.isVisible = state.isLoading
                state.errorMessage?.let {
                    binding.tvError.text = it
                    binding.tvError.visibility = View.VISIBLE
                }

                val card = viewModel.getCurrentCard()
                if (card != null) {
                    updateCardView(card)
                } else if (state.cards.isNotEmpty()) {
                    binding.tvEmpty.visibility = View.VISIBLE
                }
            }
        }
    }

    private fun updateCardView(card: FeedCardResponse) {
        binding.tvName.text = "${card.name}, ${card.age}"
        binding.tvCity.text = card.city
        binding.tvBio.text = card.bio
        // TODO: загрузить фото через Glide
    }

    private fun setupSwipeGestures() {
        var startX = 0f
        var startY = 0f

        binding.cardContainer.setOnTouchListener { _, event ->
            when (event.action) {
                android.view.MotionEvent.ACTION_DOWN -> {
                    startX = event.x
                    startY = event.y
                    false
                }
                android.view.MotionEvent.ACTION_MOVE -> {
                    val dx = event.x - startX
                    val dy = event.y - startY
                    binding.cardView.translationX = dx
                    binding.cardView.rotation = dx / 10f
                    false
                }
                android.view.MotionEvent.ACTION_UP -> {
                    val dx = event.x - startX
                    if (dx > 100) {
                        viewModel.like()
                        animateCardOut(binding.cardView, 1f, 0f)
                    } else if (dx < -100) {
                        viewModel.skip()
                        animateCardOut(binding.cardView, -1f, 0f)
                    } else {
                        // Reset
                        binding.cardView.animate().translationX(0f).rotation(0f).start()
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun animateCardOut(cardView: View, translateX: Float, rotation: Float) {
        cardView.animate()
            .translationX(translateX * 1000)
            .rotation(rotation * 30)
            .alpha(0f)
            .setDuration(300)
            .withEndAction {
                binding.cardView.animate().alpha(1f).translationX(0f).rotation(0f).start()
            }
            .start()
    }

    private fun setupButtons() {
        binding.btnSkip.setOnClickListener { viewModel.skip() }
        binding.btnLike.setOnClickListener { viewModel.like() }
        binding.btnSuperlike.setOnClickListener { viewModel.superlike() }
        binding.btnRefresh.setOnClickListener { viewModel.loadFeed() }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
