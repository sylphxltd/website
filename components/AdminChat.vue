<template>
  <div
    ref="chatContainerRef"
    class="admin-chat-container bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl flex fixed bottom-4 right-4 z-50 overflow-hidden resize"
    :style="{ width: chatWidth + 'px', height: chatHeight + 'px' }"
  >
    <!-- Session List Panel -->
    <div class="session-list-panel w-1/3 max-w-[200px] bg-gray-50 dark:bg-gray-750 p-3 flex flex-col border-r border-gray-300 dark:border-gray-600">
      <button
        @click="handleCreateNewSession"
        class="new-chat-button w-full mb-3 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
      >
        + New Chat
      </button>
      <div class="session-list flex-grow overflow-y-auto space-y-1 pr-1">
        <div
          v-for="session in adminChatStore.sessions"
          :key="session.id"
          @click="handleSelectSession(session.id)"
          :class="[
            'session-item p-2 rounded-md cursor-pointer text-sm truncate',
            adminChatStore.currentSessionId === session.id ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 font-semibold' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          ]"
          :title="session.title || session.firstUserMessageSnippet"
        >
          {{ session.title || session.firstUserMessageSnippet }}
        </div>
        <div v-if="adminChatStore.isLoadingSessions && !adminChatStore.sessions.length" class="text-center text-xs text-gray-500 dark:text-gray-400 py-4">
          Loading sessions...
        </div>
        <div v-if="!adminChatStore.isLoadingSessions && !adminChatStore.sessions.length" class="text-center text-xs text-gray-500 dark:text-gray-400 py-4">
          No chat sessions yet.
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="main-chat-area flex-grow flex flex-col overflow-hidden p-4 pl-3">
      <h3 class="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2 cursor-move" @mousedown="onDragHeaderMouseDown">
        {{ adminChatStore.activeSessionTitle }}
      </h3>
      <div v-if="!adminChatStore.currentSessionId && !isLoading" class="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">
        Select a session or start a new chat.
      </div>
      <div v-else ref="messagesContainerRef" class="messages-area flex-grow overflow-y-auto mb-3 pr-2 space-y-3">
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
    </div> <!-- Closing main-chat-area -->
    <div
      class="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-gray-400 dark:bg-gray-500 hover:bg-gray-500 dark:hover:bg-gray-400 rounded-tl-lg cursor-se-resize transition-colors"
      @mousedown="onResizeMouseDown"
    ></div>
  </div> <!-- Closing admin-chat-container -->
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, watch, computed } from 'vue'; // Added computed
import { getAuth, type User } from 'firebase/auth';
import { useToastStore } from '~/stores/toast';
import { useChat, type Message as VercelMessage } from '@ai-sdk/vue';
import { useAdminChatStore } from '~/stores/adminChat'; // Import the new store

const adminChatStore = useAdminChatStore();
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
  body: { preventUserMessageOptimisticUpdate: true }, // Prevent auto-handling of user messages
  onToolCall: ({ toolCall: currentToolCall }) => {
    console.log('AdminChat: onToolCall triggered', JSON.parse(JSON.stringify(currentToolCall)));
  },
  onResponse: async (response) => {
    console.log('AdminChat DEBUG: onResponse triggered, status:', response.status);
    console.log('AdminChat DEBUG: onResponse headers:',
      [...response.headers.entries()].map(([k, v]) => `${k}: ${v}`).join(', '));
    // Don't try to read the response body as it's a stream being handled by useChat internally
  },
  onFinish: async (message) => { // Make onFinish async
    console.log('AdminChat: onFinish TRIGGERED. Final AI message:', JSON.parse(JSON.stringify(message)));
    if (adminChatStore.currentSessionId && message.role === 'assistant') {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          toastStore.error('Authentication error: Cannot save AI message.');
          return;
        }
        const token = await currentUser.getIdToken(); // No force refresh needed here
        await $fetch(`/api/admin/chat/sessions/${adminChatStore.currentSessionId}/messages`, {
          method: 'POST',
          body: message, // Send the complete Message object from AI
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('AdminChat: AI message saved to session', adminChatStore.currentSessionId);
        // Optionally, refresh session list if messageCount or lastUpdatedAt is displayed and needs update
        // adminChatStore.fetchSessions();
      } catch (saveError) {
        console.error('AdminChat: Failed to save AI message to session:', saveError);
        toastStore.error('Failed to save AI response.');
      }
    }
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

  const userInput = input.value.trim();
  if (!userInput) return;

  const currentUser = auth.currentUser;
  if (!currentUser) {
    toastStore.error('You must be logged in to send a message.');
    return;
  }
  
  let token: string | null = null;
  try {
    token = await currentUser.getIdToken();
  } catch (e) {
    console.error('AdminChat: Error getting auth token before submit:', e);
    toastStore.error('Authentication error. Please try sending again.');
    return;
  }
  
  if (!token) {
    toastStore.error('Authentication token is missing. Cannot send message.');
    return;
  }

  // Get current session ID first
  const currentSessionId = adminChatStore.currentSessionId;

  // Create a unique message ID that includes timestamp for better uniqueness
  const clientMessageId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  console.log('AdminChat: Creating optimistic user message', {
    messageId: clientMessageId,
    content: userInput,
    currentSessionId: currentSessionId
  });
  
  // Create the optimistic user message with our uniquely generated ID
  const optimisticUserMessage: VercelMessage = {
    id: clientMessageId,
    role: 'user',
    content: userInput,
    createdAt: new Date(),
    parts: [{ type: 'text', text: userInput }],
  };
  
  // Store the user input before clearing - CRITICAL for AI functionality
  const storedUserInput = userInput;
  
  // Clear input field to prevent double-submissions
  input.value = '';
  
  // Handle new session flow
  if (!currentSessionId) {
    // First create the session without any optimistic UI updates
    try {
      const newSessionData = await adminChatStore.createNewSession(userInput);
      
      if (!newSessionData?.id) {
        toastStore.error('Could not create a new chat session. Please try again.');
        return;
      }
      
      const sessionId = newSessionData.id;

      // Create a loading state flag to track when messages are loaded
      let messagesLoaded = false;
      const onMessagesLoaded = () => { messagesLoaded = true; };
      
      // Setup one-time watcher to know when messages are loaded
      const stopWatcher = watch(messages, async () => {
        // Look for our user message in the loaded messages
        const hasUserMessage = messages.value.some(m =>
          m.role === 'user' && m.content === userInput);
        
        if (hasUserMessage) {
          stopWatcher(); // Unwatch once we've confirmed our message is loaded
          onMessagesLoaded();
          
          // Now call AI with the session ID AFTER messages are loaded
          try {
            const freshToken = await currentUser.getIdToken();
            console.log('AdminChat: About to call AI for new session with handleSubmit', {
              sessionId,
              messageCount: messages.value.length,
              firstMessageContent: messages.value[0]?.content
            });
            
            // Add network debugging
            console.log('AdminChat DEBUG: Network request about to be made for new session with:', {
              headers: { Authorization: `Bearer ${freshToken.substring(0, 10)}...` },
              body: { sessionId }
            });
            
            // CRITICAL: Don't restore input.value for new sessions
            // Just call handleSubmit with the session ID
            try {
              const result = await handleSubmit(undefined, {
                headers: { 'Authorization': `Bearer ${freshToken}` },
                body: { sessionId }
              });
              
              console.log('AdminChat DEBUG: handleSubmit for new session returned:', result);
              console.log('AdminChat: handleSubmit for new session completed successfully');
            } catch (submitError) {
              console.error('AdminChat DEBUG: handleSubmit for new session threw an error:', submitError);
              throw submitError; // Re-throw to be caught by the outer catch
            }
          } catch (aiError) {
            console.error('AdminChat: Error calling AI for new session:', aiError);
            toastStore.error('Error requesting AI response. Please try again.');
          }
        }
      }, { deep: true });
      
      // Set a timeout to prevent indefinite waiting
      setTimeout(() => {
        if (!messagesLoaded) {
          stopWatcher();
          console.error('AdminChat: Timed out waiting for messages to load for new session');
          toastStore.error('Timed out waiting for messages to load. Please try again.');
        }
      }, 5000); // 5 second timeout
      
      // Update session ID which will trigger message loading via watcher
      adminChatStore.setCurrentSessionId(sessionId);
      
    } catch (sessionError) {
      console.error('AdminChat: Error creating new session:', sessionError);
      toastStore.error('Could not create a new chat session. Please try again.');
    }
    
    return;
  }
  
  // Handle existing session flow - add optimistic message first
  const updatedMessages = [...messages.value, optimisticUserMessage];
  setMessages(updatedMessages);
  
  try {
    // Save message to server
    const response = await $fetch<VercelMessage>(`/api/admin/chat/sessions/${currentSessionId}/messages`, {
      method: 'POST',
      body: optimisticUserMessage,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('AdminChat: User message saved to existing session', currentSessionId);
    
    // Update the message ID without causing a duplicate
    const messageIndex = messages.value.findIndex(m => m.id === clientMessageId);
    if (messageIndex !== -1 && response && response.id !== clientMessageId) {
      // Update the message ID without causing a duplicate
      const updatedMessagesArray = [...messages.value];
      updatedMessagesArray[messageIndex] = {
        ...updatedMessagesArray[messageIndex],
        id: response.id
      };
      
      setMessages(updatedMessagesArray);
    }
    
    // Instead of restoring input.value, pass the message directly in the body
    // This prevents duplicate user message from being added by handleSubmit
    try {
      console.log('AdminChat: About to call AI for existing session with handleSubmit', {
        sessionId: currentSessionId,
        messageLength: storedUserInput.length
      });
      
      // Add network debugging
      console.log('AdminChat DEBUG: Network request about to be made with:', {
        headers: { Authorization: `Bearer ${token.substring(0, 10)}...` },
        body: {
          sessionId: currentSessionId,
          message: storedUserInput
        }
      });
      
      // Wrap in a try-catch and log any errors
      try {
        const result = await handleSubmit(undefined, {
          headers: { 'Authorization': `Bearer ${token}` },
          body: {
            sessionId: currentSessionId,
            message: storedUserInput // Pass message directly in body instead of using input.value
          }
        });
        
        console.log('AdminChat DEBUG: handleSubmit returned:', result);
        console.log('AdminChat: handleSubmit for existing session completed successfully');
      } catch (submitError) {
        console.error('AdminChat DEBUG: handleSubmit threw an error:', submitError);
        throw submitError; // Re-throw to be caught by the outer catch
      }
    } catch (aiError) {
      console.error('AdminChat: Error calling AI for existing session:', aiError);
      toastStore.error('Error requesting AI response. Please try again.');
    }
  } catch (saveError) {
    console.error('AdminChat: Failed to save user message to existing session:', saveError);
    
    // Remove the optimistic message on error
    const filteredMessages = messages.value.filter(m => m.id !== clientMessageId);
    setMessages(filteredMessages);
    
    toastStore.error('Failed to save your message.');
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
    }
  });
};

// Improved messages watcher - only log message updates and scroll when messages actually change
watch(messages, (currentMessages, oldMessages) => {
  if (currentMessages.length !== oldMessages?.length ||
      JSON.stringify(currentMessages.map(m => m.id)) !== JSON.stringify(oldMessages?.map(m => m.id))) {
    console.log('AdminChat: `messages` ref from useChat updated:', JSON.parse(JSON.stringify(currentMessages)));
    scrollToBottom();
  }
}, { deep: true });

watch(() => adminChatStore.currentSessionId, (newSessionId, oldSessionId) => {
  if (newSessionId) {
    console.log(`AdminChat: Session ID changed to ${newSessionId}. Loading messages.`);
    // Reset messages to prevent flash of previous messages
    setMessages([]);
    // Load messages for new session
    adminChatStore.loadMessagesForCurrentSession(setMessages);
  } else if (oldSessionId && !newSessionId) { // Cleared session
    console.log('AdminChat: Session cleared. Clearing messages.');
    setMessages([]);
  }
}, { immediate: true }); // Set to true to ensure proper initial state

const formatTimestamp = (dateInput?: Date | string | number | { seconds: number, nanoseconds: number }): string => {
  if (!dateInput) return '';
  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'object' && 'seconds' in dateInput && 'nanoseconds' in dateInput) {
    // Handle Firestore Timestamp-like object if it somehow reaches here
    date = new Date(dateInput.seconds * 1000 + dateInput.nanoseconds / 1000000);
  } else {
    // Try to parse if it's a string or number
    date = new Date(dateInput);
  }

  if (date instanceof Date && !Number.isNaN(date.valueOf())) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  console.warn('AdminChat: formatTimestamp received an invalid dateInput', dateInput);
  return 'Invalid Date';
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
  // Fetch sessions when the component is mounted
  if (!adminChatStore.sessions.length) { // Fetch only if not already populated
    adminChatStore.fetchSessions();
  }
});

onBeforeUnmount(() => {
  // Cleanup for resize/drag listeners is handled in their respective mouseup events
});

// Improved new session creation logic
const handleCreateNewSession = () => {
  console.log('AdminChat: handleCreateNewSession triggered');
  // Clear current state before starting a new session
  setMessages([]); // Clear messages immediately
  adminChatStore.setCurrentSessionId(null); // This will trigger the watcher
  input.value = ''; // Clear input field
};

// Session selection logic
const handleSelectSession = (sessionId: string) => {
  if (adminChatStore.currentSessionId === sessionId && messages.value.length > 0) {
    // If same session is clicked and messages are already loaded, do nothing
    // or if you want to allow re-fetching, remove the messages.value.length > 0 check
    console.log(`AdminChat: Session ${sessionId} is already active.`);
    return;
  }
  console.log(`AdminChat: Selecting session ${sessionId}`);
  adminChatStore.setCurrentSessionId(sessionId);
  // The watch on currentSessionId will trigger loading messages.
};


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