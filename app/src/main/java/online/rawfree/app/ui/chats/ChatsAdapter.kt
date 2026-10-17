package online.rawfree.app.ui.chats

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import online.rawfree.app.databinding.ItemChatBinding
import online.rawfree.app.data.remote.dto.ChatResponse

class ChatsAdapter(
    private var chats: List<ChatResponse>,
    private val onItemClick: (ChatResponse) -> Unit,
) : RecyclerView.Adapter<ChatsAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemChatBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemChatBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val chat = chats[position]
        holder.binding.chat = chat
        holder.itemView.setOnClickListener { onItemClick(chat) }
    }

    override fun getItemCount(): Int = chats.size

    fun update(newChats: List<ChatResponse>) {
        chats = newChats
        notifyDataSetChanged()
    }
}
