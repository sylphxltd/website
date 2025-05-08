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
      <!-- Iterate directly over messages from useChat -->
      <div v-for="message in messages" :key="message.id" :class="['flex flex-col', message.role === 'user' ? 'items-end' : 'items-start']">
        <div
          :class="[
            'inline-block rounded-xl py-2 px-3 shadow-md max-w-[85%]',
            message.role === 'user' ? 'bg-blue-600 text-white ml-auto' : '',
            message.role === 'assistant' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-auto' : '',
            (message.role !== 'user' && message.role !== 'assistant') ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 w-full text-sm p-2 border rounded-md' : '' /* Fallback for system/data messages */
          ]"
        >
          <!-- Drastically simplified content rendering for debugging 'ns' error -->
          <!-- Enhanced message rendering -->
          <div class="message-content-wrapper">
            <!-- Handle User Messages -->
            <span v-if="message.role === 'user'" class="whitespace-pre-wrap break-words">
              {{ message.content }}
            </span>

            <!-- Handle Assistant Messages: Strictly iterate over parts -->
            <template v-if="message.role === 'assistant'">
              <template v-if="message.parts && message.parts.length > 0">
                <template v-for="(part, index) in message.parts" :key="`${message.id}-part-${index}`">
                  <!-- Render text parts from AI -->
                  <span v-if="part.type === 'text'" class="whitespace-pre-wrap break-words">{{ part.text }}</span>

                  <!-- Render tool invocation UI -->
                  <div v-else-if="part.type === 'tool-invocation' && part.toolInvocation" class="tool-call-ui my-1 p-2 border rounded-md text-sm">
                    <template v-if="(part.toolInvocation as any).state === 'result'">
                      <span class="text-green-600 dark:text-green-400">✅ Call to <strong>{{ (part.toolInvocation as any).toolName }}</strong> finished.</span>
                      <template v-if="(part.toolInvocation as any).toolName === 'list_applications'">
                        <span v-if="getAppCountFromResult((part.toolInvocation as any).result) !== null">
                          (Found {{ getAppCountFromResult((part.toolInvocation as any).result) }} app(s))
                        </span>
                      </template>
                    </template>
                    <template v-else-if="(part.toolInvocation as any).state === 'error'">
                      <span class="text-red-600 dark:text-red-400">❌ Call to <strong>{{ (part.toolInvocation as any).toolName }}</strong> failed.</span>
                      <pre v-if="(part.toolInvocation as any).result" class="text-xs whitespace-pre-wrap break-all bg-red-50 dark:bg-red-900 p-1 rounded mt-1">{{ (part.toolInvocation as any).result }}</pre>
                    </template>
                    <template v-else> <!-- Default state, assumed to be 'calling' or 'pending' -->
                      <span class="text-blue-600 dark:text-blue-400">⚙️ Calling <strong>{{ (part.toolInvocation as any).toolName }}</strong>...</span>
                    </template>
                  </div>
                  <!-- Can add more v-else-if for other part types like 'step-start' if specific UI is needed -->
                </template>
              </template>
              <!-- Fallback to message.content if parts is empty but content exists (safer, but user asked to avoid extra things) -->
              <span v-else-if="message.content" class="whitespace-pre-wrap break-words">
                {{ message.content }}
              </span>
            </template>
          </div>
        </div>
        <span v-if="message.createdAt" :class="['text-xs mt-1', message.role === 'user' ? 'text-gray-400 dark:text-gray-500 mr-1' : 'text-gray-500 dark:text-gray-400 ml-1']">
          {{ formatTimestamp(message.createdAt) }}
        </span>
      </div>
      <!-- Display general error from useChat if any -->
      <div v-if="error" class="flex flex-col items-start">
          <div class="inline-block rounded-xl py-2 px-3 shadow-md max-w-[85%] bg-red-100 dark:bg-red-700 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-100 w-full text-sm">
              <span class="whitespace-pre-wrap break-words">Chat Error: {{ error.message }}</span>
          </div>
      </div>
    </div>
    <!-- Bind input to `input` from useChat and submit with `submitForm` -->
    <form @submit.prevent="submitForm" class="input-area flex items-center border-t border-gray-300 dark:border-gray-600 pt-3">
      <input
        v-model="input"
        type="text"
        placeholder="Type your message..."
        class="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-shadow duration-150"
        :disabled="isLoading"
      />
      <button
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="isLoading || !input.trim()"
      >
        <span v-if="isLoading">Sending...</span>
        <span v-else>Send</span>
      </button>
    </form>
    <div
      class="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-gray-400 dark:bg-gray-500 hover:bg-gray-500 dark:hover:bg-gray-400 rounded-tl-lg cursor-se-resize transition-colors"
      @mousedown="onResizeMouseDown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'; // `computed` is removed.
import { getAuth, type User } from 'firebase/auth';
import { useToastStore } from '~/stores/toast';
import { useChat, type Message as VercelMessage } from '@ai-sdk/vue';

const toastStore = useToastStore();
const auth = getAuth();

const messagesContainerRef = ref<HTMLElement | null>(null);
const chatContainerRef = ref<HTMLElement | null>(null);

// Resizing and Dragging state (preserved from original)
const chatWidth = ref(360);
const chatHeight = ref(420);
const minChatWidth = 300;
const minChatHeight = 250;
const isResizing = ref(false);
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const initialChatWidth = ref(0);
const initialChatHeight = ref(0);
const isDraggingHeader = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const initialChatX = ref(0);
const initialChatY = ref(0);

const { messages, input, handleSubmit, isLoading, error, setMessages } = useChat({
  api: '/api/admin/chat',
  onToolCall: ({ toolCall: currentToolCall }) => {
    console.log('AdminChat: onToolCall triggered', JSON.parse(JSON.stringify(currentToolCall)));
  },
  onFinish: (message) => {
    console.log('AdminChat: onFinish triggered. Final message:', JSON.parse(JSON.stringify(message)));
  },
  onError: (err: Error) => {
    console.error("AdminChat useChat SDK error:", err);
    toastStore.error(`Chat Error: ${err.message}`);
  },
});

const submitForm = async (event?: Event | SubmitEvent) => {
  if (event && typeof (event as SubmitEvent).preventDefault === 'function') {
    (event as SubmitEvent).preventDefault();
  }
  const currentUser = auth.currentUser;
  if (!currentUser) {
    toastStore.error('You must be logged in to send a message.');
    return;
  }
  let token: string | null = null;
  try {
    token = await currentUser.getIdToken(true);
  } catch (e) {
    console.error('AdminChat: Error getting auth token before submit:', e);
    toastStore.error('Authentication error. Please try sending again.');
    return;
  }
  if (!token) {
    toastStore.error('Authentication token is missing. Cannot send message.');
    return;
  }
  handleSubmit(undefined, { headers: { 'Authorization': `Bearer ${token}` } });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
    }
  });
};

watch(messages, (currentMessages) => { 
  console.log('AdminChat: `messages` ref from useChat updated:', JSON.parse(JSON.stringify(currentMessages)));
  scrollToBottom();
}, { deep: true });

const formatTimestamp = (date?: Date): string => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// --- Resizing and Dragging Logic (preserved from original) ---
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
};
// --- End Resizing and Dragging Logic ---

onMounted(() => {
  scrollToBottom();
});

onBeforeUnmount(() => {
  // Cleanup for resize/drag listeners is handled in their respective mouseup events
});

const getAppCountFromResult = (jsonString: string | undefined | null): number | null => {
  if (!jsonString) return null;
  try {
    const result = JSON.parse(jsonString);
    if (result && typeof result.count === 'number') {
      return result.count;
    }
  } catch (e) {
    // Not a valid JSON or count not found
    console.warn("AdminChat: Could not parse app count from tool result", e, jsonString);
  }
  return null;
};

</script>

<style scoped>
.admin-chat-container {
  min-width: v-bind(minChatWidth + 'px');
  min-height: v-bind(minChatHeight + 'px');
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

.tool-call-ui, .tool-result-ui {
  font-family: monospace;
}

.resize-handle {
  z-index: 10;
}
.tool-call-ui strong {
  font-weight: 600; /* semibold */
}
.tool-call-ui {
  background-color: rgba(0,0,0,0.03); /* Lighten the bg slightly */
}
.dark .tool-call-ui {
  background-color: rgba(255,255,255,0.03); /* Lighten the bg slightly for dark mode */
}
</style>