package online.rawfree.app.ui.paywall

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import online.rawfree.app.databinding.ItemPlanBinding

class PlanAdapter(
    private val plans: List<PlanItem>,
    private val onPlanClick: (PlanItem) -> Unit,
) : RecyclerView.Adapter<PlanAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemPlanBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemPlanBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val plan = plans[position]
        holder.binding.plan = plan
        holder.itemView.setOnClickListener { onPlanClick(plan) }
    }

    override fun getItemCount(): Int = plans.size
}
