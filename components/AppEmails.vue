<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Email Support</h3>
      <div class="flex items-center gap-3">
        <select 
          v-model="selectedStatus" 
          class="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
        <button 
          @click="composeNewEmail" 
          class="text-sm px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <span class="i-carbon-edit mr-1"></span>
          Compose
        </button>
        <button 
          @click="fetchEmails" 
          class="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span class="i-carbon-refresh"></span>
        </button>
      </div>
    </div>

    <!-- Email interface layout -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      <!-- Email list -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden md:col-span-1">
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="p-4 text-red-600 dark:text-red-400">
          <p>{{ error }}</p>
          <button @click="fetchEmails" class="text-sm underline mt-1">Try again</button>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredEmails.length === 0" class="text-center py-10">
          <div class="mx-auto h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <span class="i-carbon-email text-xl text-gray-400 dark:text-gray-500"></span>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-sm">No emails found</p>
        </div>

        <!-- Email list -->
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700 h-full overflow-y-auto">
          <div 
            v-for="email in filteredEmails" 
            :key="email.id" 
            @click="selectEmail(email)"
            class="p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-750"
            :class="[
              selectedEmail?.id === email.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : '',
              !email.read ? 'font-semibold' : ''
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm truncate" :class="!email.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'">
                {{ email.sender.name || email.sender.email }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {{ formatDateShort(email.date) }}
              </span>
            </div>
            <div class="text-xs truncate" :class="!email.read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'">
              {{ email.subject }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
              {{ email.previewText }}
            </div>
            <div class="flex gap-1 mt-1">
              <span 
                v-if="!email.read" 
                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                New
              </span>
              <span 
                v-if="email.replied" 
                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              >
                Replied
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Email content and reply -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden md:col-span-2 flex flex-col">
        <!-- No selected email -->
        <div v-if="!selectedEmail && !isComposing" class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div class="text-center">
            <div class="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
              <span class="i-carbon-email text-2xl text-gray-400 dark:text-gray-500"></span>
            </div>
            <p>Select an email from the list or compose a new message</p>
          </div>
        </div>

        <!-- Viewing an email -->
        <div v-else-if="selectedEmail && !isComposing" class="flex flex-col h-full">
          <!-- Email header -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ selectedEmail.subject }}</h3>
              <div class="flex gap-2">
                <button 
                  @click="replyToEmail" 
                  class="text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                >
                  <span class="i-carbon-reply mr-1"></span>
                  Reply
                </button>
                <button 
                  @click="selectedEmail = null" 
                  class="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span class="i-carbon-close"></span>
                </button>
              </div>
            </div>
            <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <span class="text-gray-500 dark:text-gray-400 font-medium">
                    {{ (selectedEmail.sender.name || selectedEmail.sender.email).charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <div class="font-medium">{{ selectedEmail.sender.name || selectedEmail.sender.email }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ selectedEmail.sender.email }}</div>
                </div>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {{ formatDate(selectedEmail.date) }}
              </div>
            </div>
          </div>

          <!-- Email content -->
          <div class="p-4 overflow-y-auto flex-grow">
            <div class="prose prose-sm dark:prose-invert max-w-none">
              <div v-html="selectedEmail.content"></div>
            </div>
          </div>

          <!-- Email thread -->
          <div v-if="selectedEmail.thread && selectedEmail.thread.length > 0" class="p-4 border-t border-gray-200 dark:border-gray-700">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Previous Messages</div>
            <div v-for="(message, index) in selectedEmail.thread" :key="index" class="mb-4 last:mb-0">
              <div class="flex items-center gap-2 mb-1">
                <div class="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-xs">
                  <span class="text-gray-500 dark:text-gray-400 font-medium">
                    {{ message.sender.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="text-xs">
                  <span class="font-medium">{{ message.sender }}</span>
                  <span class="text-gray-500 dark:text-gray-400 ml-2">{{ formatDate(message.date) }}</span>
                </div>
              </div>
              <div class="pl-8 text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
                <div v-html="message.content"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Compose or reply -->
        <div v-else class="flex flex-col h-full">
          <!-- Compose header -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ isReplying ? 'Reply to Email' : 'Compose New Email' }}
              </h3>
              <button 
                @click="cancelCompose" 
                class="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span class="i-carbon-close"></span>
              </button>
            </div>
          </div>

          <!-- Compose form -->
          <div class="p-4 flex-grow overflow-y-auto">
            <form @submit.prevent="sendEmail" class="space-y-4">
              <!-- To field -->
              <div v-if="!isReplying">
                <label for="to" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                <input
                  id="to"
                  v-model="emailDraft.to"
                  type="email"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="recipient@example.com"
                />
              </div>
              <!-- To field (reply) -->
              <div v-else class="flex items-center">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">To:</div>
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ selectedEmail.sender.name ? `${selectedEmail.sender.name} <${selectedEmail.sender.email}>` : selectedEmail.sender.email }}
                </div>
              </div>

              <!-- Subject field -->
              <div v-if="!isReplying">
                <label for="subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  id="subject"
                  v-model="emailDraft.subject"
                  type="text"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Email subject"
                />
              </div>
              <!-- Subject field (reply) -->
              <div v-else class="flex items-center">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Subject:</div>
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ emailDraft.subject }}
                </div>
              </div>

              <!-- Message body -->
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <div class="mt-1">
                  <MilkdownEditorWrapper
                    v-model="emailDraft.message"
                    placeholder="Write your message here..."
                    class="border border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              <!-- AI assist -->
              <div class="flex justify-between items-center">
                <button
                  type="button"
                  @click="generateEmailReply"
                  :disabled="isGeneratingReply"
                  class="flex items-center gap-1 text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isGeneratingReply">Generating...</span>
                  <span v-else>
                    <span class="i-carbon-ai-status mr-1"></span>
                    Generate AI Response
                  </span>
                </button>
              </div>
            </form>
          </div>

          <!-- Compose footer -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              @click="cancelCompose"
              class="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Discard
            </button>
            <button
              @click="sendEmail"
              :disabled="isSending || !emailDraft.message"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSending ? 'Sending...' : 'Send' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';

// Props
const props = defineProps({
  appId: {
    type: String,
    default: null
  }
});

// State
const userStore = useUserStore();
const emails = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedStatus = ref('all');
const selectedEmail = ref(null);
const isComposing = ref(false);
const isReplying = ref(false);
const isGeneratingReply = ref(false);
const isSending = ref(false);

// Email draft
const emailDraft = ref({
  to: '',
  subject: '',
  message: '',
  appId: props.appId
});

// Computed
const filteredEmails = computed(() => {
  let result = emails.value;
  
  // Filter by status
  if (selectedStatus.value === 'unread') {
    result = result.filter(email => !email.read);
  } else if (selectedStatus.value === 'read') {
    result = result.filter(email => email.read && !email.replied);
  } else if (selectedStatus.value === 'replied') {
    result = result.filter(email => email.replied);
  }
  
  return result;
});

// Methods
const fetchEmails = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Build API URL with query params
    let url = '/api/emails/list';
    const params = new URLSearchParams();
    
    if (props.appId) {
      params.append('appId', props.appId);
    }
    
    url = `${url}?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    emails.value = data.emails;
    
    // Sort by date (newest first)
    emails.value.sort((a, b) => new Date(b.date) - new Date(a.date));
    
  } catch (err) {
    console.error('Error fetching emails:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load emails';
    userStore.showToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  
  if (diffDays < 7) {
    const options = { weekday: 'short' };
    return date.toLocaleDateString(undefined, options);
  }
  
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const selectEmail = (email) => {
  selectedEmail.value = email;
  isComposing.value = false;
  isReplying.value = false;
  
  // Mark as read if not already
  if (!email.read) {
    email.read = true;
    // In a real app, would update the read status on the server
  }
};

const composeNewEmail = () => {
  isComposing.value = true;
  isReplying.value = false;
  selectedEmail.value = null;
  
  // Reset draft
  emailDraft.value = {
    to: '',
    subject: '',
    message: '',
    appId: props.appId
  };
};

const replyToEmail = () => {
  if (!selectedEmail.value) return;
  
  isComposing.value = true;
  isReplying.value = true;
  
  // Prepare reply draft
  emailDraft.value = {
    to: selectedEmail.value.sender.email,
    subject: `Re: ${selectedEmail.value.subject}`,
    message: '',
    appId: props.appId,
    inReplyTo: selectedEmail.value.id
  };
};

const cancelCompose = () => {
  if (isReplying.value) {
    isComposing.value = false;
    isReplying.value = false;
  } else {
    isComposing.value = false;
    selectedEmail.value = null;
  }
};

const generateEmailReply = async () => {
  if (isGeneratingReply.value) return;
  isGeneratingReply.value = true;
  
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Prepare request payload
    const payload = {
      appId: props.appId
    };
    
    if (isReplying.value && selectedEmail.value) {
      payload.inReplyTo = selectedEmail.value.id;
      payload.originalSubject = selectedEmail.value.subject;
      payload.originalContent = selectedEmail.value.content;
      payload.originalSender = selectedEmail.value.sender;
    } else {
      payload.subject = emailDraft.value.subject;
      payload.to = emailDraft.value.to;
    }
    
    const response = await fetch('/api/ai/generate-email-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    emailDraft.value.message = data.reply;
    
  } catch (err) {
    console.error('Error generating AI reply:', err);
    userStore.showToast(err instanceof Error ? err.message : 'Failed to generate AI reply', 'error');
  } finally {
    isGeneratingReply.value = false;
  }
};

const sendEmail = async () => {
  if (isSending.value || !emailDraft.value.message) return;
  isSending.value = true;
  
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Prepare email data
    const emailData = {
      to: emailDraft.value.to,
      subject: emailDraft.value.subject,
      message: emailDraft.value.message,
      appId: props.appId
    };
    
    if (isReplying.value && selectedEmail.value) {
      emailData.inReplyTo = selectedEmail.value.id;
    }
    
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(emailData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    userStore.showToast('Email sent successfully', 'success');
    
    // Update UI state after sending
    if (isReplying.value && selectedEmail.value) {
      selectedEmail.value.replied = true;
      
      // Add to thread
      if (!selectedEmail.value.thread) {
        selectedEmail.value.thread = [];
      }
      
      selectedEmail.value.thread.push({
        sender: 'You',
        date: new Date().toISOString(),
        content: emailDraft.value.message
      });
    }
    
    // Reset compose state
    isComposing.value = false;
    isReplying.value = false;
    
    // Refresh emails list
    fetchEmails();
    
  } catch (err) {
    console.error('Error sending email:', err);
    userStore.showToast(err instanceof Error ? err.message : 'Failed to send email', 'error');
  } finally {
    isSending.value = false;
  }
};

// Watchers
watch(selectedStatus, () => {
  // Reset selected email when filter changes
  selectedEmail.value = null;
  isComposing.value = false;
  isReplying.value = false;
});

// Initialize
onMounted(() => {
  fetchEmails();
});
</script>