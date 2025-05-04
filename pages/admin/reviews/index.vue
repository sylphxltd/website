<template>
  <div>
    <!-- Page header -->
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Reviews Management</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Monitor and respond to reviews across all app stores.
        </p>
      </div>
      <!-- Actions can be added here if needed -->
    </div>

    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <!-- App Selector -->
      <div>
        <label for="app-select-reviews" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application</label>
        <select
          id="app-select-reviews"
          v-model="selectedAppId"
          class="block w-full py-2 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          :disabled="appsLoading"
        >
          <option :value="null">All Applications</option> <!-- Or force selection -->
          <option v-if="appsLoading" :value="null" disabled>Loading apps...</option>
          <option v-for="app in apps" :key="app.id" :value="app.id">
            {{ app.name }}
          </option>
        </select>
      </div>

      <!-- Store Selector -->
      <div>
         <label for="store-select-reviews" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store</label>
         <select
           id="store-select-reviews"
           v-model="selectedStore"
           class="block w-full py-2 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
         >
           <option value="">All Stores</option>
           <option value="googlePlay">Google Play</option>
           <option value="appStore">App Store</option>
           <!-- Add other store types as needed -->
         </select>
       </div>

       <!-- Rating Filter -->
       <div>
         <label for="rating-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Rating</label>
         <select
           id="rating-filter"
           v-model="filters.rating"
           class="block w-full py-2 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
         >
           <option :value="null">Any Rating</option>
           <option value="5">★★★★★ (5)</option>
           <option value="4">★★★★☆ (4+)</option>
           <option value="3">★★★☆☆ (3+)</option>
           <option value="2">★★☆☆☆ (2+)</option>
           <option value="1">★☆☆☆☆ (1+)</option>
         </select>
       </div>

       <!-- Has Reply Filter -->
       <div>
         <label for="reply-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reply Status</label>
         <select
           id="reply-filter"
           v-model="filters.hasReply"
           class="block w-full py-2 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
         >
           <option :value="null">Any Status</option>
           <option :value="true">Replied</option>
           <option :value="false">Not Replied</option>
         </select>
       </div>
       <!-- Add Date Filters if needed -->

    </div>

    <!-- Reviews List / Loading / Empty States -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
       <div v-if="loading" class="p-10 text-center text-gray-500 dark:text-gray-400">
         <span class="i-carbon-circle-dash w-8 h-8 animate-spin inline-block mr-2"></span>
         Loading reviews...
       </div>
       <div v-else-if="!selectedAppId" class="p-10 text-center text-gray-500 dark:text-gray-400">
         Please select an application to view reviews.
       </div>
       <div v-else-if="error" class="p-10 text-center text-red-600 dark:text-red-400">
         Error loading reviews: {{ error }}
       </div>
       <div v-else-if="reviews.length === 0" class="p-10 text-center text-gray-500 dark:text-gray-400">
         No reviews found matching your criteria for this application.
       </div>
       <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
         <li v-for="review in reviews" :key="review.id" class="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
           <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
             <!-- Review Content -->
             <div class="flex-1 min-w-0">
               <div class="flex items-center mb-1">
                 <span class="text-sm font-medium text-gray-900 dark:text-white mr-2">{{ review.author }}</span>
                 <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(review.createdAt) }}</span>
                 <span class="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" :class="getStoreBadgeClass(review.store)">
                   {{ review.store }}
                 </span>
               </div>
               <div class="flex items-center mb-2">
                 <span v-for="i in 5" :key="i" :class="[i <= review.rating ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600', 'i-carbon-star-filled text-lg']"></span>
               </div>
               <h4 v-if="review.title" class="text-md font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ review.title }}</h4>
               <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ review.body }}</p>
             </div>

             <!-- Reply Section -->
             <div class="mt-4 sm:mt-0 sm:ml-6 sm:w-64 flex-shrink-0">
               <div v-if="review.reply" class="mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                 <p class="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Your Reply ({{ formatDate(review.reply.createdAt) }}):</p>
                 <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ review.reply.body }}</p>
               </div>
               <div v-else>
                 <textarea
                   v-model="replyTexts[review.id]"
                   rows="3"
                   class="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                   placeholder="Write a reply..."
                 ></textarea>
                 <div class="flex justify-between items-center">
                   <button
                     @click="generateAndFillReply(review)"
                     :disabled="generatingReply[review.id] || replying[review.id]"
                     class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                   >
                     <span v-if="generatingReply[review.id]" class="i-carbon-circle-dash w-3 h-3 animate-spin mr-1"></span>
                     <span v-else class="i-carbon-ai-status mr-1"></span>
                     AI Suggest
                   </button>
                   <button
                     @click="submitReply(review.id)"
                     :disabled="!replyTexts[review.id] || replying[review.id] || generatingReply[review.id]"
                     class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                   >
                      <span v-if="replying[review.id]" class="i-carbon-circle-dash w-3 h-3 animate-spin mr-1"></span>
                     Reply
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </li>
       </ul>
       <!-- Add Pagination controls here if implemented -->
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useReviewsStore, type Review } from '~/stores/reviews';
import { useAppsStore, type Application } from '~/stores/apps';
import { useToastStore } from '~/stores/toast';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// --- Stores ---
const reviewsStore = useReviewsStore();
const appsStore = useAppsStore();
const toastStore = useToastStore();

// --- Local State ---
const replyTexts = ref<Record<string, string>>({}); // Store reply text per review ID

// --- Store State Refs ---
const loading = computed(() => reviewsStore.loading);
const replying = computed(() => reviewsStore.replying);
const generatingReply = computed(() => reviewsStore.generatingReply);
const error = computed(() => reviewsStore.error);
const reviews = computed(() => reviewsStore.reviews);
const pagination = computed(() => reviewsStore.pagination);
const filters = ref(reviewsStore.filters); // Use ref for two-way binding with filters object
const selectedAppId = ref<string | null>(reviewsStore.selectedAppId);
const selectedStore = ref<string>(reviewsStore.selectedStore);

const appsLoading = computed(() => appsStore.loading);
const apps = computed(() => appsStore.apps);

// --- Methods ---
const onAppSelectionChange = () => {
  reviewsStore.selectedAppId = selectedAppId.value;
  // Fetching is handled by the watcher
};
const onStoreSelectionChange = () => {
  reviewsStore.selectedStore = selectedStore.value;
   // Fetching is handled by the watcher
};

const submitReply = (reviewId: string) => {
  const text = replyTexts.value[reviewId];
  if (text) {
    reviewsStore.postReply(reviewId, text);
    // Optionally clear text after submission attempt
    // replyTexts.value[reviewId] = '';
  }
};

const generateAndFillReply = async (review: Review) => {
  const suggestion = await reviewsStore.generateAIReply(review);
  if (suggestion) {
    replyTexts.value[review.id] = suggestion;
  }
};

// Helper to format date
const formatDate = (timestamp: string | undefined | null): string => {
  if (!timestamp) return 'Unknown';
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  } catch (e) {
    return 'Invalid Date';
  }
};

// Helper for store badges
const getStoreBadgeClass = (store: string): string => {
    const map: Record<string, string> = {
        'googlePlay': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        'appStore': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    };
    return map[store] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

// --- Watchers ---
// Watch store selection changes to update local refs
watch(() => reviewsStore.selectedAppId, (newVal) => {
  selectedAppId.value = newVal;
});
watch(() => reviewsStore.selectedStore, (newVal) => {
  selectedStore.value = newVal;
});
// Watch local filter refs to update store filters (debounced?)
// watch(filters, (newFilters) => { // Watch the ref directly
//    reviewsStore.filters = newFilters; // Update store - consider debouncing
// }, { deep: true });
//    reviewsStore.filters = filters.value;
// }, { deep: true });

// --- Lifecycle Hooks ---
onMounted(async () => {
  // Fetch apps for the selector
  await appsStore.fetchApps();
  // Fetch initial reviews if an app is already selected in the store
  if (reviewsStore.selectedAppId) {
    await reviewsStore.fetchReviews();
  }
});

</script>