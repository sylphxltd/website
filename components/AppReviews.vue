<template>
  <div>
    <!-- Store Selection -->
    <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded shadow">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
         <div class="md:col-span-2">
           <label for="reviewStoreSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Store to View Reviews</label>
           <select
             id="reviewStoreSelect"
             v-model="selectedStore"
             class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
           >
             <option value="" disabled>Select a Store</option>
             <option v-if="app.links?.googlePlay" value="googlePlay">Google Play</option>
             <option v-if="app.links?.appStore" value="appStore">App Store</option>
             <!-- Add other stores if needed -->
           </select>
           <p v-if="!app.links?.googlePlay && !app.links?.appStore" class="text-xs text-gray-500 mt-1">No Google Play or App Store link found for this app in its details.</p>
         </div>
         <button
           @click="fetchReviews"
           :disabled="!selectedStore || reviewsLoading"
           class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {{ reviewsLoading ? 'Loading...' : 'Fetch Reviews' }}
         </button>
       </div>
        <p v-if="fetchError" class="text-red-500 text-sm mt-2">{{ fetchError }}</p>
     </div>

    <!-- Review List -->
    <div v-if="reviewsLoading" class="text-center py-10">
      <p>Loading reviews...</p>
    </div>
    <div v-else-if="reviews.length > 0" class="space-y-4">
       <h3 class="text-xl font-semibold mb-3">Reviews ({{ selectedStore === 'googlePlay' ? 'Google Play' : 'App Store' }})</h3>
       <div v-for="review in reviews" :key="review.id" class="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="font-semibold">{{ review.userName }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">- {{ new Date(review.timestamp).toLocaleDateString() }}</span>
            </div>
            <div class="flex items-center">
               <span v-for="n in 5" :key="n" class="text-yellow-400">
                 <span :class="n <= review.rating ? 'i-carbon-star-filled' : 'i-carbon-star'"></span>
               </span>
            </div>
          </div>
          <h4 v-if="review.title" class="font-medium mb-1">{{ review.title }}</h4>
          <p class="text-gray-700 dark:text-gray-300 mb-3">{{ review.text }}</p>

          <!-- Reply Section -->
          <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
             <button
               @click="toggleReply(review.id)"
               class="text-sm text-blue-500 hover:underline"
             >
               {{ replyingTo === review.id ? 'Cancel Reply' : 'Reply' }}
             </button>

             <div v-if="replyingTo === review.id" class="mt-2">
               <textarea
                 v-model="replyText"
                 rows="3"
                 class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 placeholder="Write your reply..."
               ></textarea>
               <p v-if="replyError" class="text-xs text-red-500 mt-1">{{ replyError }}</p>
               <p v-if="generationError" class="text-xs text-red-500 mt-1">AI Error: {{ generationError }}</p>
               <div class="flex justify-between items-center mt-2">
                  <button
                     type="button"
                     @click="generateAIReply(review)"
                     :disabled="isGeneratingReply || isSubmittingReply"
                     class="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 flex items-center gap-1"
                     title="Generate reply using AI"
                   >
                     <span v-if="isGeneratingReply">Generating...</span>
                     <span v-else class="flex items-center gap-1">
                       <span class="i-carbon-magic-wand-filled"></span> Generate AI Reply
                     </span>
                   </button>
                  <button
                     @click="submitReply(review)"
                     :disabled="!replyText || isSubmittingReply || isGeneratingReply"
                     class="bg-green-500 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                    {{ isSubmittingReply ? 'Submitting...' : 'Submit Reply' }}
                  </button>
               </div>
             </div>
          </div>
       </div> <!-- End v-for -->
    </div>
    <div v-else class="text-center py-10 text-gray-500 dark:text-gray-400">
       {{ selectedStore ? 'No reviews found for this store.' : 'Please select a store to fetch reviews.' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import type { Application } from '~/stores/apps'; // Import Application type

// Define Review interface matching the mock API
interface Review {
  id: string;
  userName: string;
  rating: number;
  title?: string;
  text: string;
  timestamp: string;
  store: 'googlePlay' | 'appStore';
  appId: string; // This was the store-specific ID in the mock API
}

const props = defineProps<{
  app: Application // Receive the full app object
}>();

const userStore = useUserStore();

const selectedStore = ref<'googlePlay' | 'appStore' | ''>('');
const reviews = ref<Review[]>([]);
const reviewsLoading = ref(false);
const fetchError = ref<string | null>(null);
const replyingTo = ref<string | null>(null);
const replyText = ref('');
const isSubmittingReply = ref(false);
const replyError = ref<string | null>(null);
const isGeneratingReply = ref(false);
const generationError = ref<string | null>(null);

// Clear reviews and reply state when store selection changes or app prop changes
watch([() => props.app, selectedStore], () => {
    reviews.value = [];
    fetchError.value = null;
    replyingTo.value = null;
    replyText.value = '';
    replyError.value = null;
    generationError.value = null;
}, { deep: true }); // Use deep watch for prop object

const fetchReviews = async () => {
  if (!selectedStore.value || !props.app) return;

  // Get the store-specific ID from the app's links
  const appIdForApi = props.app.links?.[selectedStore.value];
  if (!appIdForApi) {
      fetchError.value = `App ID for ${selectedStore.value} not found in app details. Please add it in the 'Details & Edit' tab.`;
      userStore.showToast(fetchError.value, 'error');
      return;
  }

  reviewsLoading.value = true;
  fetchError.value = null;
  reviews.value = [];

  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const response = await $fetch<{ reviews: Review[] }>('/api/reviews/list', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${idToken}` },
      query: {
        appId: appIdForApi,
        store: selectedStore.value
      }
    });
    reviews.value = response.reviews;

  } catch (err: unknown) {
    console.error("Error fetching reviews:", err);
    let errorMsg = "Failed to load reviews.";
     if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data) {
        errorMsg = err.data.message as string;
    } else if (err instanceof Error) {
        errorMsg = err.message;
    }
    fetchError.value = errorMsg;
    userStore.showToast(errorMsg, 'error');
  } finally {
    reviewsLoading.value = false;
  }
};

const toggleReply = (reviewId: string) => {
    if (replyingTo.value === reviewId) {
        replyingTo.value = null;
        replyText.value = '';
        replyError.value = null;
    } else {
        replyingTo.value = reviewId;
        replyText.value = '';
        replyError.value = null;
        generationError.value = null;
    }
};

const submitReply = async (review: Review) => {
    if (!replyText.value || isSubmittingReply.value || !props.app) return;

    const appIdForApi = props.app.links?.[review.store];
    if (!appIdForApi) {
        replyError.value = `App ID for ${review.store} not found. Cannot submit reply.`;
        userStore.showToast(replyError.value, 'error');
        return;
    }

    isSubmittingReply.value = true;
    replyError.value = null;

    try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error("Authentication token not found.");

        await $fetch('/api/reviews/reply', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviewId: review.id,
                replyText: replyText.value,
                store: review.store,
                appId: appIdForApi
            })
        });
        userStore.showToast('Reply submitted successfully (simulated).', 'success');
        toggleReply(review.id);

    } catch (err: unknown) {
        console.error("Error submitting reply:", err);
        let errorMsg = "Failed to submit reply.";
         if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data) {
            errorMsg = err.data.message as string;
        } else if (err instanceof Error) {
             errorMsg = err.message;
        }
        replyError.value = errorMsg;
        userStore.showToast(errorMsg, 'error');
    } finally {
        isSubmittingReply.value = false;
    }
};

const generateAIReply = async (review: Review) => {
    if (isGeneratingReply.value || !props.app) return;

    isGeneratingReply.value = true;
    generationError.value = null;
    const currentReplyText = replyText.value;
    replyText.value = 'AI is generating reply...';

    try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error("Authentication token not found.");

        const response = await fetch('/api/ai/generate-review-reply', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviewText: review.text,
                reviewRating: review.rating,
                appName: props.app.name || 'this app'
            })
        });

        if (!response.ok || !response.body) {
             const errorData = await response.json().catch(() => ({ message: response.statusText }));
             throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let generatedText = '';
        replyText.value = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            generatedText += decoder.decode(value, { stream: true });
            replyText.value = generatedText;
        }
         const finalChunk = decoder.decode();
         if (finalChunk) replyText.value += finalChunk;
         if (!replyText.value) {
             replyText.value = currentReplyText;
             throw new Error("AI returned an empty reply.");
         }

    } catch (err: unknown) {
        console.error("Error generating AI reply:", err);
        let errorMsg = "Failed to generate AI reply.";
         if (err instanceof Error) errorMsg = err.message;
        generationError.value = errorMsg;
        replyText.value = currentReplyText;
        userStore.showToast(errorMsg, 'error');
    } finally {
        isGeneratingReply.value = false;
    }
};

</script>