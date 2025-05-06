import { defineStore } from 'pinia';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';

// Interface for a Review (adjust based on actual API response)
export interface Review {
  id: string; // Unique ID for the review (e.g., from the store API)
  appId: string; // Associated application ID
  store: 'googlePlay' | 'appStore' | string; // Source store
  author: string;
  rating: number; // e.g., 1-5
  title?: string;
  body: string;
  createdAt: string; // ISO timestamp string
  reply?: {
    body: string;
    createdAt: string; // ISO timestamp string
  } | null;
  // Add other relevant fields like version, device, language etc.
}

// Interface for pagination state
interface ReviewPaginationState {
  currentPage: number;
  pageSize: number;
  totalReviews: number | null;
  // Add cursor/token if API uses it
}

// Interface for filter state
interface ReviewFilters {
    rating: number | null;
    dateFrom: string | null;
    dateTo: string | null;
    hasReply: boolean | null;
}

export const useReviewsStore = defineStore('reviews', () => {
  // State
  const reviews = ref<Review[]>([]);
  const loading = ref(false);
  const replying = ref<Record<string, boolean>>({}); // Track reply loading state per review ID
  const generatingReply = ref<Record<string, boolean>>({}); // Track AI generation loading state
  const error = ref<string | null>(null);
  const selectedAppId = ref<string | null>(null);
  const selectedStore = ref<string>(''); // e.g., 'googlePlay', 'appStore', '' for all
  const pagination = ref<ReviewPaginationState>({
      currentPage: 1,
      pageSize: 10,
      totalReviews: null,
  });
   const filters = ref<ReviewFilters>({
      rating: null,
      dateFrom: null,
      dateTo: null,
      hasReply: null,
   });

  // Dependencies
  const userStore = useUserStore();
  const toastStore = useToastStore();

  // Helper to get auth token
  async function getIdToken(): Promise<string> {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error("Could not retrieve user token");
    }
    return idToken;
  }

   // Helper to safely get error messages
   function getSafeErrorMessage(error: unknown): string {
     if (typeof error === 'string') return error;
     
     // Check for standard Error object first
     if (error instanceof Error) {
       return error.message;
     }
     
     // Check for Nuxt/H3 fetch error structure (more specific checks)
     if (typeof error === 'object' && error !== null) {
       // Check for H3Error structure (e.g., from createError)
       if ('statusMessage' in error && typeof error.statusMessage === 'string') {
         return error.statusMessage;
       }
       // Check for $fetch error structure (often has a 'data' property)
       if ('data' in error) {
         const errorData = (error as { data?: unknown }).data;
         if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof errorData.message === 'string') {
           return errorData.message;
         }
       }
       // Fallback for other object types with a message property
       if ('message' in error && typeof error.message === 'string') {
          return error.message;
       }
     }
     
     // Default fallback
     return 'An unknown error occurred';
   }

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    if (!selectedAppId.value || !userStore.isAdmin) {
        reviews.value = [];
        return;
    }

    loading.value = true;
    error.value = null;

    try {
      const token = await getIdToken();
      const queryParams = new URLSearchParams({
        appId: selectedAppId.value,
        page: page.toString(),
        limit: pagination.value.pageSize.toString(),
      });
      if (selectedStore.value) queryParams.append('store', selectedStore.value);
      if (filters.value.rating) queryParams.append('rating', filters.value.rating.toString());
      if (filters.value.dateFrom) queryParams.append('dateFrom', filters.value.dateFrom);
      if (filters.value.dateTo) queryParams.append('dateTo', filters.value.dateTo);
      if (filters.value.hasReply !== null) queryParams.append('hasReply', filters.value.hasReply.toString());


      const response = await $fetch<{ reviews: Review[]; total: number }>('/api/reviews/list', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        query: queryParams,
      });

      reviews.value = response.reviews;
      pagination.value.totalReviews = response.total;
      pagination.value.currentPage = page;

    } catch (err: unknown) {
      error.value = getSafeErrorMessage(err);
      toastStore.error(error.value);
      reviews.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Post a reply
  const postReply = async (reviewId: string, replyText: string) => {
     if (!selectedAppId.value || !reviewId || !replyText || !userStore.isAdmin) return;

     replying.value[reviewId] = true;
     error.value = null; // Clear previous errors

     try {
        const token = await getIdToken();
        await $fetch('/api/reviews/reply', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: {
                appId: selectedAppId.value,
                store: reviews.value.find(r => r.id === reviewId)?.store, // Find store type
                reviewId: reviewId,
                text: replyText,
            }
        });
        toastStore.success('Reply posted successfully!');
        // Refresh reviews for the current page
        await fetchReviews(pagination.value.currentPage);
     } catch (err: unknown) {
        error.value = getSafeErrorMessage(err);
        toastStore.error(`Failed to post reply: ${error.value}`);
     } finally {
        replying.value[reviewId] = false;
     }
  };

  // Generate AI Reply Suggestion
  const generateAIReply = async (review: Review): Promise<string | null> => {
      if (!review || !userStore.isAdmin) return null;

      generatingReply.value[review.id] = true;
      error.value = null;

      try {
          const token = await getIdToken();
          const response = await $fetch<{ suggestion: string }>('/api/ai/generate-review-reply', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: {
                  appId: review.appId, // Add this line
                  reviewBody: review.body,
                  rating: review.rating,
                  // Add other context if needed (app name, previous replies etc.)
              }
          });
          return response.suggestion;
      } catch (err: unknown) {
          error.value = getSafeErrorMessage(err);
          toastStore.error(`AI reply generation failed: ${error.value}`);
          return null;
      } finally {
          generatingReply.value[review.id] = false;
      }
  };

  // Watch for changes in app/store selection or filters to refetch
  watch([selectedAppId, selectedStore, filters], () => {
      fetchReviews(1); // Reset to page 1 when filters change
  }, { deep: true });


  return {
    reviews,
    loading,
    replying,
    generatingReply,
    error,
    selectedAppId,
    selectedStore,
    pagination,
    filters,
    fetchReviews,
    postReply,
    generateAIReply,
  };
});