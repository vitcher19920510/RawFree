package online.rawfree.app.ui.chats

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import online.rawfree.app.databinding.ItemMessageInBinding
import online.rawfree.app.databinding.ItemMessageOutBinding
import online.rawfree.app.data.remote.dto.MessageResponse

class MessagesAdapter(
    private var messages: List<MessageResponse>,
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    companion object {
        private val VIEW_TYPE_IN = 0
        private val VIEW_TYPE_OUT = 1
    }

    class InViewHolder(val binding: ItemMessageInBinding) : RecyclerView.ViewHolder(binding.root)
    class OutViewHolder(val binding: ItemMessageOutBinding) : RecyclerView.ViewHolder(binding.root)

    override fun getItemViewType(position: Int): Int {
        return if (messages[position].senderId == "current_user") VIEW_TYPE_OUT else VIEW_TYPE_IN
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return if (viewType == VIEW_TYPE_IN) {
            val binding = ItemMessageInBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            InViewHolder(binding)
        } else {
            val binding = ItemMessageOutBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            OutViewHolder(binding)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val message = messages[position]
        when (holder) {
            is InViewHolder -> {
                holder.binding.message = message
            }
            is OutViewHolder -> {
                holder.binding.message = message
            }
        }
    }

    override fun getItemCount(): Int = messages.size

    fun update(newMessages: List<MessageResponse>) {
        messages = newMessages
        notifyDataSetChanged()
    }
}
