<template>
  <div>
    <!-- Email List -->
    <div v-if="loading" class="text-center py-10">
      <p>Loading emails...</p>
    </div>
    <div v-else-if="fetchError" class="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
      Error loading emails: {{ fetchError }}
    </div>
    <div v-else>
      <!-- TODO: Add Compose button specific to this app's support address? -->
      <div class="space-y-4">
        <h3 class="text-xl font-semibold mb-3">Inbox ({{ app.name }})</h3> <!-- Indicate App Context -->
        <div v-if="emails.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
          No emails found for this app.
        </div>
        <div v-else v-for="email in emails" :key="email.id" class="p-4 bg-white dark:bg-gray-800 rounded shadow cursor-pointer hover:shadow-md" @click="selectEmail(email)">
          <div class="flex justify-between items-start mb-1">
            <span class="font-semibold">{{ email.from }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ new Date(email.receivedAt).toLocaleString() }}</span>
          </div>
          <p class="text-gray-800 dark:text-gray-200 truncate">{{ email.subject }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ email.body }}</p>
           <span class="text-xs px-2 py-0.5 rounded-full mt-2 inline-block" :class="getStatusClass(email.status)">
             {{ email.status }}
           </span>
        </div>
      </div>
    </div>

    <!-- Email Detail / Reply Modal -->
    <div v-if="selectedEmail" class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50" @click.self="closeEmailModal">
       <div class="relative p-6 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white dark:bg-gray-900 max-h-[80vh] flex flex-col">
          <button @click="closeEmailModal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
             <span class="i-carbon-close text-2xl"></span>
          </button>
          <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{{ selectedEmail.subject }}</h3>
          <div class="mb-4 text-sm">
             <p><span class="font-medium">From:</span> {{ selectedEmail.from }}</p>
             <p><span class="font-medium">To:</span> {{ selectedEmail.to }}</p>
             <p><span class="font-medium">Date:</span> {{ new Date(selectedEmail.receivedAt).toLocaleString() }}</p>
          </div>
          <div class="flex-grow overflow-y-auto border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-4">
             <pre class="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{{ selectedEmail.body }}</pre>
          </div>

          <!-- Reply Form -->
          <div>
             <h4 class="text-lg font-medium mb-2">Reply</h4>
             <textarea
               v-model="replyContent"
               rows="5"
               class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white mb-2"
               placeholder="Write your reply..."
             ></textarea>
             <p v-if="sendError" class="text-red-500 text-sm mb-1">{{ sendError }}</p>
             <p v-if="aiReplyError" class="text-red-500 text-sm mb-1">AI Error: {{ aiReplyError }}</p>
             <div class="flex justify-between items-center mt-2">
                 <button
                   type="button"
                   @click="generateEmailAIReply"
                   :disabled="isGeneratingAIReply || isSending"
                   class="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 flex items-center gap-1"
                   title="Generate reply using AI"
                 >
                   <span v-if="isGeneratingAIReply">Generating...</span>
                   <span v-else class="flex items-center gap-1">
                     <span class="i-carbon-magic-wand-filled"></span> Generate AI Reply
                   </span>
                 </button>
                <button
                  @click="sendReply"
                  :disabled="!replyContent || isSending || isGeneratingAIReply"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSending ? 'Sending...' : 'Send Reply' }}
                </button>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineProps } from 'vue';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import type { Application } from '~/stores/apps'; // Import Application type

// Define Email interface matching API response
interface Email {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  headers?: string;
  status: string;
}

const props = defineProps<{
  app: Application // Receive the app object
}>();

const userStore = useUserStore();
const emails = ref<Email[]>([]);
const loading = ref(false);
const fetchError = ref<string | null>(null);
const selectedEmail = ref<Email | null>(null);
const replyContent = ref('');
const isSending = ref(false);
const sendError = ref<string | null>(null);
const isGeneratingAIReply = ref(false);
const aiReplyError = ref<string | null>(null);

const fetchEmails = async () => {
  // TODO: Modify API call to filter emails for props.app.id or a specific app email address
  // For now, it fetches all emails as before.
  loading.value = true;
  fetchError.value = null;
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    // Placeholder: Add query parameter for app filtering if backend supports it
    // const queryParams = { appId: props.app.id };
    const response = await $fetch<{ emails: Email[] }>('/api/emails/list', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${idToken}` },
      // query: queryParams // Add query params when backend is ready
    });
    // TODO: Filter emails client-side if backend doesn't support it yet
    // e.g., emails.value = response.emails.filter(e => e.to === props.app.supportEmail);
    emails.value = response.emails;
  } catch (err: unknown) {
    console.error("Error fetching emails:", err);
    let errorMsg = "Failed to load emails.";
     if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data) {
        errorMsg = err.data.message as string;
    } else if (err instanceof Error) {
        errorMsg = err.message;
    }
    fetchError.value = errorMsg;
    userStore.showToast(errorMsg, 'error');
  } finally {
    loading.value = false;
  }
};

const selectEmail = (email: Email) => {
  selectedEmail.value = email;
  replyContent.value = '';
  sendError.value = null;
  aiReplyError.value = null;
};

const closeEmailModal = () => {
  selectedEmail.value = null;
  replyContent.value = '';
  sendError.value = null;
  aiReplyError.value = null;
};

const sendReply = async () => {
  if (!selectedEmail.value || !replyContent.value || isSending.value) return;

  isSending.value = true;
  sendError.value = null;

  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const replySubject = `Re: ${selectedEmail.value.subject}`;
    const replyBody = `\n\n--- Original Message ---\nFrom: ${selectedEmail.value.from}\nDate: ${new Date(selectedEmail.value.receivedAt).toLocaleString()}\nSubject: ${selectedEmail.value.subject}\n\n${selectedEmail.value.body}`;
    const fullReplyText = replyContent.value + replyBody;

    // Determine sender address (use app-specific if available, fallback)
    const senderEmail = props.app.links?.supportEmail || "support@yourverifieddomain.com"; // Example: assume supportEmail link exists

    await $fetch('/api/emails/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: selectedEmail.value.from,
        subject: replySubject,
        text: fullReplyText,
        from: senderEmail // Use app-specific or default sender
      })
    });

    userStore.showToast('Reply sent successfully.', 'success');
    // TODO: Update email status
    closeEmailModal();

  } catch (err: unknown) {
    console.error("Error sending reply:", err);
    let errorMsg = "Failed to send reply.";
     if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data) {
        errorMsg = err.data.message as string;
    } else if (err instanceof Error) {
         errorMsg = err.message;
    }
    sendError.value = errorMsg;
    userStore.showToast(errorMsg, 'error');
  } finally {
    isSending.value = false;
  }
};

const generateEmailAIReply = async () => {
    if (!selectedEmail.value || isGeneratingAIReply.value || isSending.value) return;

    isGeneratingAIReply.value = true;
    aiReplyError.value = null;
    const currentReply = replyContent.value;
    replyContent.value = 'AI is thinking...';

    try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error("Authentication token not found.");

        const response = await fetch('/api/ai/generate-email-reply', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                originalSubject: selectedEmail.value.subject,
                originalSender: selectedEmail.value.from,
                originalBody: selectedEmail.value.body
            })
        });

        if (!response.ok || !response.body) {
             const errorData = await response.json().catch(() => ({ message: response.statusText }));
             throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let generatedText = '';
        replyContent.value = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            generatedText += decoder.decode(value, { stream: true });
            replyContent.value = generatedText;
        }
         const finalChunk = decoder.decode();
         if (finalChunk) replyContent.value += finalChunk;
         if (!replyContent.value) {
             replyContent.value = currentReply;
             throw new Error("AI returned an empty reply.");
         }

    } catch (err: unknown) {
        console.error("Error generating AI email reply:", err);
        let errorMsg = "Failed to generate AI reply.";
         if (err instanceof Error) errorMsg = err.message;
        aiReplyError.value = errorMsg;
        replyContent.value = currentReply;
        userStore.showToast(errorMsg, 'error');
    } finally {
        isGeneratingAIReply.value = false;
    }
};

const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
        case 'received': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'replied': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
};

// Fetch emails when the app prop is available and user is authenticated
watch(() => [props.app, userStore.isAuthenticated], ([currentApp, isAuth]) => {
    if (currentApp && isAuth) {
        fetchEmails();
    }
}, { immediate: true }); // Fetch immediately if possible

</script>