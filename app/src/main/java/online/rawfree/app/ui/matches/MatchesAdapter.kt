package online.rawfree.app.ui.matches

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import online.rawfree.app.databinding.ItemMatchBinding
import online.rawfree.app.data.remote.dto.MatchResponse

class MatchesAdapter(
    private var matches: List<MatchResponse>,
    private val onItemClick: (MatchResponse) -> Unit,
) : RecyclerView.Adapter<MatchesAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemMatchBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemMatchBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val match = matches[position]
        holder.binding.match = match
        holder.itemView.setOnClickListener { onItemClick(match) }
    }

    override fun getItemCount(): Int = matches.size

    fun update(newMatches: List<MatchResponse>) {
        matches = newMatches
        notifyDataSetChanged()
    }
}
