<template>
  <div
    ref="chatContainerRef"
    class="admin-chat-container bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl p-4 flex flex-col fixed bottom-4 right-4 z-50 overflow-hidden resize"
    :style="{ width: chatWidth + 'px', height: chatHeight + 'px' }"
  >
    <h3 class="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2 cursor-move" @mousedown="onDragHeaderMouseDown">
      Admin Chat
    </h3>
    <div ref="messagesContainerRef" class="messages-area flex-grow overflow-y-auto mb-3 pr-2 space-y-3">
      <div v-for="message in messages" :key="message.id" :class="['flex flex-col', message.sender === 'user' ? 'items-end' : 'items-start']">
        <div
          :class="[
            'inline-block rounded-xl py-2 px-3 shadow-md max-w-[85%]',
            message.sender === 'user' ? 'bg-blue-600 text-white ml-auto' : '',
            message.sender === 'ai' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-auto' : '',
            message.sender === 'error' ? 'bg-red-100 dark:bg-red-700 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-100 w-full text-sm' : ''
          ]"
        >
          <span class="whitespace-pre-wrap break-words">{{ message.text }}</span>
          <span v-if="message.sender === 'ai' && message.isStreaming" class="inline-block ml-1 animate-pulse">▋</span>
        </div>
        <span v-if="message.timestamp" :class="['text-xs mt-1', message.sender === 'user' ? 'text-gray-400 dark:text-gray-500 mr-1' : 'text-gray-500 dark:text-gray-400 ml-1']">
          {{ message.timestamp }}
        </span>
      </div>
    </div>
    <div class="input-area flex items-center border-t border-gray-300 dark:border-gray-600 pt-3">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Type your message..."
        class="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-shadow duration-150"
        @keyup.enter="sendMessage"
        :disabled="isSending"
      />
      <button
        @click="sendMessage"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="isSending || !newMessage.trim()"
      >
        <span v-if="isSending">Sending...</span>
        <span v-else>Send</span>
      </button>
    </div>
    <div
      class="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-gray-400 dark:bg-gray-500 hover:bg-gray-500 dark:hover:bg-gray-400 rounded-tl-lg cursor-se-resize transition-colors"
      @mousedown="onResizeMouseDown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { getAuth } from 'firebase/auth';
import { useToastStore } from '~/stores/toast';

interface Message {
  id: number;
  sender: 'user' | 'ai' | 'error';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

const toastStore = useToastStore();
const auth = getAuth(); // Assuming Firebase is initialized elsewhere

const messages = ref<Message[]>([
  // Initial messages can be kept or removed based on preference
  // { id: 0, sender: 'ai', text: 'Hello! How can I assist you?', timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) },
]);
const newMessage = ref('');
const isSending = ref(false);
const messageIdCounter = ref(messages.value.length > 0 ? Math.max(...messages.value.map(m => m.id)) + 1 : 0);

const messagesContainerRef = ref<HTMLElement | null>(null);
const chatContainerRef = ref<HTMLElement | null>(null);

// Resizing state
const chatWidth = ref(360); // Initial width
const chatHeight = ref(420); // Initial height
const minChatWidth = 300;
const minChatHeight = 250;
const isResizing = ref(false);
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const initialChatWidth = ref(0);
const initialChatHeight = ref(0);

// Dragging state (for moving the window)
const isDraggingHeader = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const initialChatX = ref(0);
const initialChatY = ref(0);


const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
    }
  });
};

watch(messages, () => {
  scrollToBottom();
}, { deep: true });


const onResizeMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  isResizing.value = true;
  resizeStartX.value = event.clientX;
  resizeStartY.value = event.clientY;
  initialChatWidth.value = chatContainerRef.value?.offsetWidth || chatWidth.value;
  initialChatHeight.value = chatContainerRef.value?.offsetHeight || chatHeight.value;
  document.addEventListener('mousemove', onResizeMouseMove);
  document.addEventListener('mouseup', onResizeMouseUp);
};

const onResizeMouseMove = (event: MouseEvent) => {
  if (!isResizing.value) return;
  const dx = event.clientX - resizeStartX.value;
  const dy = event.clientY - resizeStartY.value;
  chatWidth.value = Math.max(minChatWidth, initialChatWidth.value + dx);
  chatHeight.value = Math.max(minChatHeight, initialChatHeight.value + dy);
};

const onResizeMouseUp = () => {
  if (!isResizing.value) return;
  isResizing.value = false;
  document.removeEventListener('mousemove', onResizeMouseMove);
  document.removeEventListener('mouseup', onResizeMouseUp);
};

const onDragHeaderMouseDown = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).classList.contains('cursor-move')) return;
  event.preventDefault();
  isDraggingHeader.value = true;
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;

  if (chatContainerRef.value) {
    const rect = chatContainerRef.value.getBoundingClientRect();
    initialChatX.value = rect.left;
    initialChatY.value = rect.top;
     // Temporarily make position absolute for dragging if it's fixed
    if (getComputedStyle(chatContainerRef.value).position === 'fixed') {
        chatContainerRef.value.style.right = 'auto';
        chatContainerRef.value.style.bottom = 'auto';
        chatContainerRef.value.style.left = `${initialChatX.value}px`;
        chatContainerRef.value.style.top = `${initialChatY.value}px`;
    }
  }
  document.addEventListener('mousemove', onDragHeaderMouseMove);
  document.addEventListener('mouseup', onDragHeaderMouseUp);
};

const onDragHeaderMouseMove = (event: MouseEvent) => {
  if (!isDraggingHeader.value || !chatContainerRef.value) return;
  const dx = event.clientX - dragStartX.value;
  const dy = event.clientY - dragStartY.value;
  chatContainerRef.value.style.left = `${initialChatX.value + dx}px`;
  chatContainerRef.value.style.top = `${initialChatY.value + dy}px`;
};

const onDragHeaderMouseUp = () => {
  if (!isDraggingHeader.value) return;
  isDraggingHeader.value = false;
  document.removeEventListener('mousemove', onDragHeaderMouseMove);
  document.removeEventListener('mouseup', onDragHeaderMouseUp);
   // Optional: Snap back to corner if that's desired behavior after drag
   // Or save position in localStorage to persist
};


const addMessage = (sender: 'user' | 'ai' | 'error', text: string, isStreaming = false): Message => {
  const newMessageEntry: Message = {
    id: messageIdCounter.value++,
    sender,
    text,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    isStreaming: sender === 'ai' ? isStreaming : undefined,
  };
  messages.value.push(newMessageEntry);
  scrollToBottom();
  return newMessageEntry;
};

const sendMessage = async () => {
  const userInput = newMessage.value.trim();
  if (userInput === '' || isSending.value) return;

  isSending.value = true;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    toastStore.error('You must be logged in to chat.');
    addMessage('error', 'Authentication error. Please log in again.');
    isSending.value = false;
    return;
  }

  let token: string | null = null;
  try {
    token = await currentUser.getIdToken(true); // Force refresh token
  } catch (error) {
    console.error('Error getting auth token:', error);
    toastStore.error('Could not authenticate. Please try again.');
    addMessage('error', 'Failed to get authentication token.');
    isSending.value = false;
    return;
  }

  if (!token) {
    toastStore.error('Authentication token is missing.');
    addMessage('error', 'Authentication token unavailable.');
    isSending.value = false;
    return;
  }

  addMessage('user', userInput);
  const currentInput = newMessage.value; // Store before clearing
  newMessage.value = ''; // Clear input

  let aiMessageRef: Message | null = null;

  try {
    const response = await fetch('/api/admin/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: currentInput }), // Use stored input
    });

    if (!response.ok) {
      let errorData: { message?: string } | string;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() || `Server error: ${response.status}` };
      }
      throw new Error((typeof errorData === 'string' ? errorData : errorData.message) || `Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');

    if (contentType && (contentType.includes('text/event-stream') || contentType.includes('text/plain'))) {
      // Handle streaming response
      aiMessageRef = addMessage('ai', '', true);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable.');
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const aiMsg = messages.value.find(m => aiMessageRef && m.id === aiMessageRef.id);
        if (aiMsg) {
          aiMsg.text += chunk;
          scrollToBottom(); // Scroll as content streams
        }
      }
      const finalChunk = decoder.decode(); // Process any remaining data
      if (finalChunk) {
         const aiMsg = messages.value.find(m => aiMessageRef && m.id === aiMessageRef.id);
         if (aiMsg) aiMsg.text += finalChunk;
      }
       const aiMsg = messages.value.find(m => aiMessageRef && m.id === aiMessageRef.id);
       if (aiMsg) aiMsg.isStreaming = false;

    } else if (contentType?.includes('application/json')) {
      // Handle JSON response
      const data = await response.json();
      if (data?.reply) {
        addMessage('ai', data.reply);
      } else {
        console.warn('Received JSON response without reply:', data);
        addMessage('error', 'Received an unexpected JSON response from the server.');
        toastStore.warning('Received an empty or invalid JSON response from the AI.');
      }
    } else {
      // Handle other content types or missing content type as plain text
      const textResponse = await response.text();
      if (textResponse) {
        addMessage('ai', textResponse);
      } else {
        addMessage('error', 'Received an empty or unrecognized response from the server.');
        toastStore.warning('Received an empty or unrecognized response from the AI.');
      }
    }

  } catch (error: unknown) {
    console.error('Error sending message:', error);
    let errorMessage = 'Failed to send message. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    toastStore.error(`Chat Error: ${errorMessage}`);
    addMessage('error', `Error: ${errorMessage}`);
    if (aiMessageRef) { // If streaming started but failed
        const aiMsg = messages.value.find(m => aiMessageRef && m.id === aiMessageRef.id);
        if (aiMsg) aiMsg.isStreaming = false;
    }
  } finally {
    isSending.value = false;
    scrollToBottom();
  }
};

onMounted(() => {
  scrollToBottom();
  // Position chat window if needed, e.g., from localStorage
});

onBeforeUnmount(() => {
  // Clean up global listeners if any were added and not cleaned up elsewhere
  // (resize and drag listeners are cleaned up on mouseup)
});

</script>

<style scoped>
.admin-chat-container {
  min-width: v-bind(minChatWidth + 'px');
  min-height: v-bind(minChatHeight + 'px');
  /* Tailwind's resize utility can also be used if preferred over manual JS for basic resize */
}
.messages-area {
  scrollbar-width: thin;
  scrollbar-color: #a0aec0 #edf2f7; /* thumb track for Firefox */
}
.messages-area::-webkit-scrollbar {
  width: 8px;
}
.messages-area::-webkit-scrollbar-track {
  background: #edf2f7; /* Tailwind gray-200 */
}
.messages-area::-webkit-scrollbar-thumb {
  background-color: #a0aec0; /* Tailwind gray-400 */
  border-radius: 4px;
  border: 2px solid #edf2f7; /* Creates padding around thumb */
}

.dark .messages-area {
   scrollbar-color: #4a5568 #2d3748;
}
.dark .messages-area::-webkit-scrollbar-track {
  background: #2d3748; /* Tailwind gray-800 */
}
.dark .messages-area::-webkit-scrollbar-thumb {
  background-color: #718096; /* Tailwind gray-500 */
  border: 2px solid #2d3748;
}

.resize-handle {
  /* Ensures it's on top of other elements within the container if needed */
  z-index: 10;
}
</style>