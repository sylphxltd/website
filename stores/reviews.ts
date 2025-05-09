import { defineStore } from 'pinia';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';
import { useOptimisticCrud, type OptimisticItemBase } from '~/composables/useOptimisticCrud';
import { getCurrentISOTimestamp } from '~/utils/optimisticUpdateHelpers'; // Still needed for optimistic reply object

// Interface for a Review (adjust based on actual API response)
export interface Review extends OptimisticItemBase {
  // id, createdAt are from OptimisticItemBase
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
  const fetchLoading = ref(false); // For fetchReviews
  // replying and generatingReply are specific to certain actions, keep them for now
  // crudError from composable will handle CUD errors. fetchError for fetch.
  const replying = ref<Record<string, boolean>>({});
  const generatingReply = ref<Record<string, boolean>>({});
  const fetchError = ref<string | null>(null); // For fetchReviews
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
  // const auth = getAuth(); // Removed: Will call getAuth() inside functions that need it

  // Helper to get auth token
  async function getIdToken(): Promise<string> {
    const auth = getAuth(); // Call getAuth() here
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

    fetchLoading.value = true;
    fetchError.value = null;

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
      fetchError.value = getSafeErrorMessage(err);
      toastStore.error(fetchError.value);
      reviews.value = [];
    } finally {
      fetchLoading.value = false;
    }
  };

  // --- CRUD Operations using Composable ---
  interface ReviewReplyDto {
    replyText: string;
    // For API call, we also need appId and store, but these are not part of "what's changing" directly on the Review item
    // They will be passed to the _apiPostReply wrapper.
  }
  // The API for postReply doesn't return the updated review, so TApiUpdateResponse is undefined or a simple success object
  type PostReplyApiResponse = undefined; // Or { success: boolean }

  const _apiPostReply = async (reviewId: string, dto: ReviewReplyDto & { appId: string, storePlatform: string }): Promise<PostReplyApiResponse> => {
    const token = await getIdToken();
    await $fetch('/api/reviews/reply', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: {
            appId: dto.appId,
            store: dto.storePlatform,
            reviewId: reviewId,
            text: dto.replyText,
        }
    });
    // Assuming success if no error is thrown by $fetch
  };

  const _transformReviewAfterReply = (
    itemInState: Review, // This is the review item from reviews.value with the optimistic reply
    _response: PostReplyApiResponse // API response is void or simple success, not used to update item
  ): Review => {
    // The optimistic update of the reply object itself (creating the new reply object)
    // should happen in the `postReply` wrapper before calling `updateReviewReplyOptimistic`.
    // This transform function is for the parent `Review` item. Since the API doesn't
    // return the updated parent `Review`, we just return the `itemInState` which
    // should already have its `updatedAt` (if applicable) and `reply` array updated by the wrapper
    // and the composable's default behavior for `updatedAt`.
    return {
        ...itemInState,
        updatedAt: getCurrentISOTimestamp(), // Ensure parent review's updatedAt is also refreshed
    };
  };
  
  // Dummy create/delete for now as they are not implemented in this store
  type DummyReviewCreateDto = Record<string, never>;
  const _dummyApiCreate = async (data: DummyReviewCreateDto): Promise<unknown> => { throw new Error('Not implemented for reviews'); };
  const _dummyApiDelete = async (id: string): Promise<void> => { throw new Error('Not implemented for reviews'); };

  const {
    updateItem: updateReviewReplyOptimistic,
    isLoadingUpdate,
    error: crudError,
  } = useOptimisticCrud<
    Review,
    DummyReviewCreateDto,
    ReviewReplyDto & { appId: string, storePlatform: string },
    unknown,
    PostReplyApiResponse
  >({
    itemsRef: reviews,
    apiCreate: _dummyApiCreate,
    apiUpdate: _apiPostReply,
    apiDelete: _dummyApiDelete,
    transformUpdateResponse: _transformReviewAfterReply,
  });


  const postReply = async (reviewId: string, replyText: string) => {
     if (!selectedAppId.value || !reviewId || !replyText || !userStore.isAdmin) return;

     const reviewIndex = reviews.value.findIndex(r => r.id === reviewId);
     if (reviewIndex === -1) {
         toastStore.error(`Review with ID ${reviewId} not found.`);
         return;
     }

    // This specific loading state can be driven by isLoadingUpdate[reviewId] from the composable
    // For now, we keep it to show how it would map.
     replying.value[reviewId] = true;

    // 1. Optimistically update the local Review item's 'reply' property
    const originalReview = reviews.value[reviewIndex]; // No need to deepClone here, composable handles it
    const newReplyObject = {
        body: replyText,
        createdAt: getCurrentISOTimestamp(),
    };
    
    // Create a new review object with the updated reply
    const optimisticallyUpdatedReview = {
        ...originalReview,
        reply: newReplyObject,
        updatedAt: getCurrentISOTimestamp(), // Also update parent's updatedAt
    };
    
    // Temporarily replace in the array for UI to update, before calling composable
    // The composable will do its own cloning and replacement.
    // This direct mutation is for the immediate UI effect of the new reply object.
    // The composable's updateItem will then take over.
    // This is a bit complex; ideally, the DTO would carry the new reply structure.
    // For now, we'll let the composable update the parent `Review` item,
    // and the `transformUpdateResponse` will ensure the `reply` field is correctly set.
    // The DTO passed to `updateReviewReplyOptimistic` will just be the `replyText` and context.

     const dto: ReviewReplyDto & { appId: string, storePlatform: string } = {
        replyText,
        appId: selectedAppId.value,
        storePlatform: originalReview.store,
     };
    
     // The `updateReviewReplyOptimistic` will call `_apiPostReply`.
     // `_transformReviewAfterReply` will be called with the `itemInState` (which is the review from `reviews.value`)
     // and the API response.
     // The `itemInState` passed to `_transformReviewAfterReply` by the composable will be a clone
     // of the review *before* the DTO is applied. The DTO is applied *after* transform by default.
     // This means `_transformReviewAfterReply` needs to construct the new reply.
     // Let's adjust `_transformReviewAfterReply` to use the DTO.

    // Redefining _transformReviewAfterReply to use the DTO to build the reply
    // This means the DTO needs to be available in _transformReviewAfterReply's scope,
    // or the composable needs to pass it. The composable does not pass the DTO to transformUpdateResponse.
    // So, the optimistic update of the 'reply' field must happen in the `updateItem` wrapper (this function).

    // Optimistic update of the reply directly on the item in the ref
    // This will be part of what `deepClone` in the composable captures as `originalItem`.
    reviews.value[reviewIndex].reply = newReplyObject;
    reviews.value[reviewIndex].updatedAt = getCurrentISOTimestamp();


    const result = await updateReviewReplyOptimistic(reviewId, dto);

     if (!result) { // If result is null, implies update failed to produce an item
        // Rollback the optimistic change to the reply if API call failed
        reviews.value[reviewIndex].reply = originalReview.reply;
        reviews.value[reviewIndex].updatedAt = originalReview.updatedAt;
        // Error toast is handled by the composable.
     }
     replying.value[reviewId] = false;
  };

  // Generate AI Reply Suggestion
  const generateAIReply = async (review: Review): Promise<string | null> => {
      if (!review || !userStore.isAdmin) return null;

      generatingReply.value[review.id] = true;
      fetchError.value = null; // Use fetchError for non-CRUD async operations

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
          fetchError.value = getSafeErrorMessage(err);
          toastStore.error(`AI reply generation failed: ${fetchError.value}`);
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
    fetchLoading, // For fetchReviews
    replying, // Per-item reply loading state (can be kept or replaced by isLoadingUpdate)
    generatingReply, // Per-item AI generation loading state
    fetchError,  // For fetchReviews and generateAIReply
    crudError,   // For postReply (update operation)
    isLoadingUpdate, // For postReply loading state from composable
    selectedAppId,
    selectedStore,
    pagination,
    filters,
    fetchReviews,
    postReply,
    generateAIReply,
  };
});