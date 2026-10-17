package online.rawfree.app.ui.chats

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import dagger.hilt.android.AndroidEntryPoint
import io.socket.client.IO
import io.socket.socket.Socket
import kotlinx.coroutines.launch
import online.rawfree.app.R
import online.rawfree.app.databinding.FragmentChatDetailBinding
import online.rawfree.app.util.AuthTokenStorage

@AndroidEntryPoint
class ChatDetailFragment : Fragment() {

    private var _binding: FragmentChatDetailBinding? = null
    private val binding get() = _binding!!
    private val viewModel: ChatDetailViewModel by viewModels()
    private lateinit var messagesAdapter: MessagesAdapter
    private var socket: Socket? = null
    private var chatId: String = ""

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentChatDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        chatId = arguments?.getString("chatId") ?: ""
        setupRecyclerView()
        setupSendButton()
        connectWebSocket()
        loadMessages()
    }

    private fun setupRecyclerView() {
        messagesAdapter = MessagesAdapter(emptyList())
        binding.rvMessages.layoutManager = LinearLayoutManager(requireContext()).apply {
            stackFromEnd = true
        }
        binding.rvMessages.adapter = messagesAdapter
    }

    private fun setupSendButton() {
        binding.btnSend.setOnClickListener {
            val text = binding.etMessage.text?.toString()?.trim()
            if (text.isNullOrEmpty()) return@setOnClickListener

            viewModel.sendMessage(chatId, text)
            binding.etMessage.text?.clear()
        }
    }

    private fun connectWebSocket() {
        try {
            val token = AuthTokenStorage.getAccessToken() ?: ""
            val options = IO.Options().apply {
                auth = mapOf("token" to token)
                forceNew = true
            }

            socket = IO.socket("http://localhost:3000/ws/chats", options)
            socket?.connect()

            socket?.on(Socket.EVENT_CONNECT) {
                socket?.emit("join_chat", mapOf("chatId" to chatId))
            }

            socket?.on("message_received") { args ->
                val data = args[0] as Map<*, *>
                val message = data["message"] as Map<*, *>
                // Add to adapter
            }

            socket?.on("messages_read") { args ->
                // Update read status
            }

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun loadMessages() {
        // TODO: load from API
    }

    override fun onDestroyView() {
        super.onDestroyView()
        socket?.disconnect()
        socket = null
        _binding = null
    }
}
