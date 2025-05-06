<template>
  <div class="admin-chat-container bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 flex flex-col h-96 w-80 fixed bottom-4 right-4 z-50">
    <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 border-b pb-2">Admin Chat</h3>
    <div class="messages-area flex-grow overflow-y-auto mb-4 space-y-2">
      <div v-for="message in messages" :key="message.id" :class="message.sender === 'user' ? 'text-right' : 'text-left'">
        <span :class="['inline-block p-2 rounded-lg', message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100']">
          {{ message.text }}
        </span>
      </div>
    </div>
    <div class="input-area flex border-t pt-2">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Type your message..."
        class="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        @keyup.enter="sendMessage"
        :disabled="isSending"
      />
      <button
        @click="sendMessage"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSending"
      >
        {{ isSending ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getAuth } from 'firebase/auth';
import { useToastStore } from '~/stores/toast'; // Assuming your store path

interface Message {
  id: number; // Added for unique key
  sender: 'user' | 'ai' | 'error'; // Added error sender type
  text: string;
}

const toastStore = useToastStore();
const auth = getAuth();
const messageIdCounter = ref(3); // Start after initial messages

// Type guard to check for Nuxt FetchError structure
interface FetchErrorData {
  message: string;
  // Add other potential properties if needed
}
interface FetchError extends Error {
  data?: FetchErrorData;
}
function isFetchErrorWithMessage(error: unknown): error is FetchError {
  if (
    typeof error === 'object' &&
    error !== null &&
    error instanceof Error &&
    'data' in error // Check if 'data' property exists on the Error object
  ) {
    const data = (error as { data?: unknown }).data; // Extract data safely
    if (
      typeof data === 'object' && // Check if data is an object
      data !== null &&
      'message' in data && // Check if 'message' exists within the data object
      typeof (data as { message?: unknown }).message === 'string' // Check if message is a string
    ) {
      return true; // All conditions met
    }
  }
  return false; // Conditions not met
}

const messages = ref<Message[]>([
  { id: 0, sender: 'ai', text: 'Hello! How can I help you today?' },
  { id: 1, sender: 'user', text: 'I need help with the app settings.' },
  { id: 2, sender: 'ai', text: 'Sure, what specific setting are you looking for?' },
]);

const newMessage = ref('');
const isSending = ref(false);

const sendMessage = async () => {
  const userInput = newMessage.value.trim();
  if (userInput === '' || isSending.value) return;

  isSending.value = true;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    toastStore.error('You must be logged in to chat.');
    messages.value.push({ id: messageIdCounter.value++, sender: 'error', text: 'Authentication error. Please log in again.' });
    isSending.value = false;
    return;
  }

  let token: string | null = null;
  try {
    token = await currentUser.getIdToken(true);
  } catch (error) {
    console.error('Error getting auth token:', error);
    toastStore.error('Could not authenticate. Please try again.');
    messages.value.push({ id: messageIdCounter.value++, sender: 'error', text: 'Failed to get authentication token.' });
    isSending.value = false;
    return;
  }

  if (!token) {
    toastStore.error('Authentication token is missing.');
     messages.value.push({ id: messageIdCounter.value++, sender: 'error', text: 'Authentication token unavailable.' });
    isSending.value = false;
    return;
  }

  // Add user message optimistically
  const userMessageId = messageIdCounter.value++;
  messages.value.push({ id: userMessageId, sender: 'user', text: userInput });
  newMessage.value = ''; // Clear input immediately

  try {
    const response = await $fetch<{ reply: string }>('/api/admin/chat', { // Ensure correct endpoint
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userInput }),
    });

    if (response?.reply) { // Use optional chaining
      messages.value.push({ id: messageIdCounter.value++, sender: 'ai', text: response.reply });
    } else {
      // Handle cases where response might be okay but no reply field
      console.warn('Received response without reply:', response);
      messages.value.push({ id: messageIdCounter.value++, sender: 'error', text: 'Received an unexpected response from the server.' });
      toastStore.warning('Received an empty or invalid response from the AI.');
    }
  } catch (error: unknown) { // Use unknown instead of any
    console.error('Error sending message:', error);
    let errorMessage = 'Failed to send message. Please try again.';
    if (isFetchErrorWithMessage(error) && error.data) {
      // Now TypeScript knows error.data and error.data.message exist
      errorMessage = error.data.message || error.message;
    } else if (error instanceof Error) {
       errorMessage = error.message; // Standard Error message
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    toastStore.error(`Chat Error: ${errorMessage}`);
    messages.value.push({ id: messageIdCounter.value++, sender: 'error', text: `Error: ${errorMessage}` });
  } finally {
    isSending.value = false;
  }
};
</script>

<style scoped>
/* Add any specific styles if needed, though Tailwind covers most */
.admin-chat-container {
  /* Adjust height, width, position as needed */
}
.messages-area {
  /* Ensure scrollbar is styled nicely if needed */
  scrollbar-width: thin; /* Firefox */
}
.messages-area::-webkit-scrollbar {
  width: 8px; /* Safari/Chrome */
}
.messages-area::-webkit-scrollbar-thumb {
  background-color: #a0aec0; /* gray-400 */
  border-radius: 4px;
}
.messages-area::-webkit-scrollbar-track {
  background-color: #edf2f7; /* gray-200 */
}
.dark .messages-area::-webkit-scrollbar-thumb {
  background-color: #4a5568; /* gray-600 */
}
.dark .messages-area::-webkit-scrollbar-track {
  background-color: #2d3748; /* gray-800 */
}
</style>