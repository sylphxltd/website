<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Store Reviews</h3>
      <div class="flex items-center gap-2">
        <select 
          v-model="selectedStore" 
          class="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Stores</option>
          <option value="googlePlay">Google Play</option>
          <option value="appStore">App Store</option>
        </select>
        <select 
          v-model="selectedRating" 
          class="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Ratings</option>
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>
        <select 
          v-model="selectedStatus" 
          class="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Reply</option>
          <option value="replied">Replied</option>
        </select>
        <button 
          @click="fetchReviews" 
          class="text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
        >
          <span class="i-carbon-refresh"></span>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md mb-6">
      <p class="flex items-center">
        <span class="i-carbon-warning-filled mr-2"></span>
        <span>{{ error }}</span>
      </p>
      <button @click="fetchReviews" class="text-sm text-red-600 dark:text-red-400 underline mt-2">Try again</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredReviews.length === 0" class="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-md">
      <div class="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <span class="i-carbon-star-review text-2xl text-gray-400 dark:text-gray-500"></span>
      </div>
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No reviews found</h4>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ getEmptyStateMessage() }}
      </p>
    </div>

    <!-- Reviews list -->
    <div v-else class="space-y-6">
      <div v-for="review in filteredReviews" :key="review.id" class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex justify-between items-start">
          <div class="flex items-start gap-3">
            <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              <span v-if="!review.authorImage" class="text-gray-500 dark:text-gray-400 font-medium">
                {{ review.author.charAt(0).toUpperCase() }}
              </span>
              <img v-else :src="review.authorImage" :alt="review.author" class="h-full w-full object-cover">
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ review.author }}</div>
              <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{{ formatDate(review.date) }}</span>
                <span>•</span>
                <span>{{ review.store }}</span>
              </div>
              <div class="flex mt-1">
                <span v-for="i in 5" :key="i" 
                  :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                  class="i-carbon-star-filled">
                </span>
              </div>
            </div>
          </div>
          <div>
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
              :class="review.replied ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'"
            >
              {{ review.replied ? 'Replied' : 'Needs Reply' }}
            </span>
          </div>
        </div>
        
        <div class="mt-3 text-gray-800 dark:text-gray-200">
          {{ review.text }}
        </div>
        
        <!-- Reply section -->
        <div v-if="review.replied" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-start gap-3">
            <div class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <span class="text-indigo-600 dark:text-indigo-400 font-medium text-xs">R</span>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">Your Reply</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(review.replyDate) }}</div>
              <div class="mt-1 text-gray-800 dark:text-gray-200">
                {{ review.replyText }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Reply form -->
        <div v-else class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <textarea 
            v-model="review.draftReply" 
            rows="3" 
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Write a reply..."
          ></textarea>
          
          <div class="flex justify-between items-center mt-2">
            <button 
              @click="generateAIReply(review)" 
              :disabled="isGeneratingReply === review.id"
              class="text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isGeneratingReply === review.id">Generating...</span>
              <span v-else>
                <span class="i-carbon-ai-status"></span>
                AI Reply
              </span>
            </button>
            <button 
              @click="submitReply(review)" 
              :disabled="!review.draftReply || isSubmitting === review.id"
              class="text-sm px-4 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting === review.id ? 'Submitting...' : 'Submit Reply' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredReviews.length > 0" class="flex justify-between items-center mt-6">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Showing <span class="font-medium">{{ filteredReviews.length }}</span> of <span class="font-medium">{{ totalReviews }}</span> reviews
      </div>
      <div class="flex gap-2">
        <button 
          @click="prevPage" 
          :disabled="page === 1"
          class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="page >= totalPages"
          class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
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
    default: null // If not provided, will show reviews for all apps
  }
});

// State
const userStore = useUserStore();
const reviews = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedStore = ref('all');
const selectedRating = ref('all');
const selectedStatus = ref('all');
const page = ref(1);
const perPage = ref(10);
const totalReviews = ref(0);
const isGeneratingReply = ref(null);
const isSubmitting = ref(null);

// Computed
const filteredReviews = computed(() => {
  let result = reviews.value;
  
  // Filter by store
  if (selectedStore.value !== 'all') {
    result = result.filter(review => review.storeKey === selectedStore.value);
  }
  
  // Filter by rating
  if (selectedRating.value !== 'all') {
    result = result.filter(review => review.rating === Number.parseInt(selectedRating.value, 10));
  }
  
  // Filter by status
  if (selectedStatus.value === 'pending') {
    result = result.filter(review => !review.replied);
  } else if (selectedStatus.value === 'replied') {
    result = result.filter(review => review.replied);
  }
  
  // Set total for pagination
  totalReviews.value = result.length;
  
  // Apply pagination
  const start = (page.value - 1) * perPage.value;
  const end = start + perPage.value;
  return result.slice(start, end);
});

const totalPages = computed(() => Math.ceil(totalReviews.value / perPage.value));

// Methods
const fetchReviews = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Build API URL with query params
    let url = '/api/reviews/list';
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
    
    // Process the reviews to add draftReply field for UI
    reviews.value = data.reviews.map(review => ({
      ...review,
      draftReply: '',
      storeKey: getStoreKey(review.store)
    }));
    
    // Sort by date (newest first)
    reviews.value.sort((a, b) => new Date(b.date) - new Date(a.date));
    
  } catch (err) {
    console.error('Error fetching reviews:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load reviews';
    userStore.showToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
};

const getStoreKey = (storeName) => {
  const storeMap = {
    'Google Play': 'googlePlay',
    'App Store': 'appStore'
  };
  return storeMap[storeName] || storeName.toLowerCase().replace(' ', '');
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
  }
};

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++;
  }
};

const generateAIReply = async (review) => {
  if (isGeneratingReply.value) return;
  
  isGeneratingReply.value = review.id;
  
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/api/ai/generate-review-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        appName: review.appName,
        reviewText: review.text,
        rating: review.rating,
        store: review.store
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    review.draftReply = data.reply;
    
  } catch (err) {
    console.error('Error generating AI reply:', err);
    userStore.showToast(err instanceof Error ? err.message : 'Failed to generate AI reply', 'error');
  } finally {
    isGeneratingReply.value = null;
  }
};

const submitReply = async (review) => {
  if (!review.draftReply || isSubmitting.value) return;
  
  isSubmitting.value = review.id;
  
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/api/reviews/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reviewId: review.id,
        appId: review.appId,
        reply: review.draftReply,
        store: review.store
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    // Update the review in the local state
    review.replied = true;
    review.replyText = review.draftReply;
    review.replyDate = new Date().toISOString();
    review.draftReply = '';
    
    userStore.showToast('Reply submitted successfully', 'success');
    
  } catch (err) {
    console.error('Error submitting reply:', err);
    userStore.showToast(err instanceof Error ? err.message : 'Failed to submit reply', 'error');
  } finally {
    isSubmitting.value = null;
  }
};

const getEmptyStateMessage = () => {
  if (props.appId) {
    return 'This app has no reviews yet, or no reviews match your filters.';
  }
  
  if (selectedStore.value !== 'all' || selectedRating.value !== 'all' || selectedStatus.value !== 'all') {
    return 'No reviews match your filters. Try adjusting the filters or refreshing.';
  }
  
  return 'No reviews found. Check back later or try refreshing.';
};

// Watchers
watch([selectedStore, selectedRating, selectedStatus], () => {
  page.value = 1; // Reset to first page when filters change
});

// Initialize
onMounted(() => {
  fetchReviews();
});
</script>