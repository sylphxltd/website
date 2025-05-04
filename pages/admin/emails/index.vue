<template>
  <div class="flex flex-col h-full">
    <!-- Page header -->
    <div class="sm:flex sm:items-center sm:justify-between mb-6 px-4 sm:px-0">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Email Support</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Manage customer support emails.
        </p>
      </div>
      <!-- Add Compose button or other actions if needed -->
    </div>

    <!-- Main Layout (List + Detail) -->
    <div class="flex-1 flex overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">

      <!-- Email List Pane -->
      <div class="w-full sm:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <!-- List Filters -->
        <div class="p-3 border-b border-gray-200 dark:border-gray-700">
           <select
             v-model="filters.status"
             class="block w-full py-2 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm"
           >
             <option value="inbox">Inbox</option>
             <option value="unread">Unread</option>
             <option value="sent">Sent</option>
             <option value="archived">Archived</option>
           </select>
           <!-- Add Search/Date filters here if desired -->
        </div>

        <!-- Email List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="loadingList" class="p-6 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          <div v-else-if="error && !emails.length" class="p-6 text-center text-red-500 dark:text-red-400">{{ error }}</div>
          <div v-else-if="emails.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">No emails found.</div>
          <ul v-else>
            <li
              v-for="email in emails"
              :key="email.id"
              @click="selectEmail(email)"
              :class="[
                'p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors',
                currentEmail?.id === email.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : '',
                !email.isRead && filters.status !== 'sent' ? 'font-semibold' : ''
              ]"
            >
              <div class="flex justify-between items-center mb-1">
                <p :class="['text-sm truncate', !email.isRead && filters.status !== 'sent' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400']">
                  {{ email.senderName || email.senderEmail }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">{{ formatRelativeTime(email.receivedAt) }}</p>
              </div>
              <p :class="['text-sm truncate', !email.isRead && filters.status !== 'sent' ? 'text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300']">
                {{ email.subject }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{{ email.snippet || email.body.substring(0, 50) }}</p>
            </li>
          </ul>
          <!-- Add List Pagination if needed -->
        </div>
      </div>

      <!-- Email Detail / Composer Pane -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div v-if="loadingDetail" class="p-6 text-center text-gray-500 dark:text-gray-400 flex-1 flex items-center justify-center">Loading email...</div>
        <div v-else-if="!currentEmail" class="p-6 text-center text-gray-500 dark:text-gray-400 flex-1 flex items-center justify-center">Select an email to view</div>
        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <!-- Email Header -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ currentEmail.subject }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              From: {{ currentEmail.senderName || currentEmail.senderEmail }} <span class="text-gray-400 dark:text-gray-500"><{{ currentEmail.senderEmail }}></span>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Received: {{ formatDate(currentEmail.receivedAt) }}</p>
          </div>

          <!-- Email Body -->
          <div class="flex-1 overflow-y-auto p-4 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {{ currentEmail.body }}
            <!-- Render HTML if body is HTML -->
            <!-- <div v-html="currentEmail.body"></div> -->

            <!-- Display Replies if threaded -->
            <div v-if="currentEmail.replies && currentEmail.replies.length > 0" class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
               <div v-for="reply in currentEmail.replies" :key="reply.id" class="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p class="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      {{ reply.senderName || reply.senderEmail }} replied on {{ formatDate(reply.receivedAt) }}:
                  </p>
                  <p class="text-sm whitespace-pre-wrap">{{ reply.body }}</p>
               </div>
            </div>
          </div>

          <!-- Reply Composer -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
             <textarea
               v-model="replyText"
               rows="4"
               class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 mb-2"
               placeholder="Write your reply..."
             ></textarea>
             <div class="flex justify-between items-center">
               <button
                 @click="generateAndFillReply"
                 :disabled="generatingReply || sendingReply"
                 class="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
               >
                 <span v-if="generatingReply" class="i-carbon-circle-dash w-4 h-4 animate-spin mr-1"></span>
                 <span v-else class="i-carbon-ai-status mr-1"></span>
                 AI Suggest Reply
               </button>
               <button
                 @click="submitReply"
                 :disabled="!replyText || sendingReply || generatingReply"
                 class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
               >
                  <span v-if="sendingReply" class="i-carbon-circle-dash w-4 h-4 animate-spin mr-2"></span>
                 Send Reply
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useEmailsStore, type EmailMessage } from '~/stores/emails';
import { useAppsStore } from '~/stores/apps'; // Needed if filtering by app
import { useToastStore } from '~/stores/toast';
import { useTimeAgo } from '@vueuse/core'; // For relative time

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// --- Stores ---
const emailsStore = useEmailsStore();
const appsStore = useAppsStore(); // Fetch apps if needed for context/filtering
const toastStore = useToastStore();

// --- Local State ---
const replyText = ref('');

// --- Store State Refs ---
const loadingList = computed(() => emailsStore.loadingList);
const loadingDetail = computed(() => emailsStore.loadingDetail);
const sendingReply = computed(() => emailsStore.sendingReply);
const generatingReply = computed(() => emailsStore.generatingReply);
const error = computed(() => emailsStore.error);
const emails = computed(() => emailsStore.emails);
const currentEmail = computed(() => emailsStore.currentEmail);
const pagination = computed(() => emailsStore.pagination);
const filters = ref(emailsStore.filters); // Use ref for two-way binding

// --- Methods ---
const selectEmail = (email: EmailMessage) => {
  replyText.value = ''; // Clear reply text when selecting new email
  emailsStore.fetchEmailDetail(email.id);
};

const submitReply = () => {
  if (currentEmail.value && replyText.value) {
    emailsStore.sendReply(currentEmail.value.id, replyText.value, currentEmail.value.senderEmail);
    // Optionally clear text after submission attempt starts
    // replyText.value = '';
  }
};

const generateAndFillReply = async () => {
  if (currentEmail.value) {
    const suggestion = await emailsStore.generateAIReply(currentEmail.value.body);
    if (suggestion) {
      replyText.value = suggestion;
    }
  }
};

// Helper to format date (full date)
const formatDate = (timestamp: string | undefined | null): string => {
  if (!timestamp) return 'Unknown';
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch (e) { return 'Invalid Date'; }
};

// Helper for relative time
const formatRelativeTime = (timestamp: string | undefined | null): string => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return '';
        // Use VueUse useTimeAgo for relative time
        const timeAgo = useTimeAgo(date);
        return timeAgo.value;
    } catch (e) {
        return '';
    }
};

// --- Watchers ---
// Watch filters ref to update store filters (could be debounced)
watch(filters, (newFilters) => {
   emailsStore.filters = newFilters;
}, { deep: true });

// --- Lifecycle Hooks ---
onMounted(() => {
  // Fetch initial list based on default filters
  emailsStore.fetchEmails();
  // Fetch apps if needed for context/filtering
  // appsStore.fetchApps();
});

</script>