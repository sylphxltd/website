import { defineStore } from 'pinia';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';
// generateTempId, deepClone, getCurrentISOTimestamp are now used within useOptimisticCrud or by its helpers
import { useOptimisticCrud, type OptimisticItemBase } from '~/composables/useOptimisticCrud';

// Interface for an Email Thread/Message (adjust based on actual API)
export interface EmailMessage extends OptimisticItemBase {
  // id, createdAt (receivedAt can be alias for createdAt) are from OptimisticItemBase
  subject: string;
  senderName?: string;
  senderEmail: string;
  recipientEmail: string; // Usually your support email
  snippet?: string; // Short preview
  body: string; // Full body (HTML or plain text)
  isRead: boolean;
  isArchived: boolean;
  receivedAt: string; // ISO timestamp string
  replies?: EmailMessage[]; // For threaded view
  // Add labels/tags if needed
}

// Interface for pagination state
interface EmailPaginationState {
  currentPage: number;
  pageSize: number;
  totalEmails: number | null;
  // Add cursor/token if API uses it
}

// Interface for filter state
interface EmailFilters {
    status: 'inbox' | 'sent' | 'archived' | 'unread' | '';
    dateFrom: string | null;
    dateTo: string | null;
    searchTerm: string;
}

export const useEmailsStore = defineStore('emails', () => {
  // State
  const emails = ref<EmailMessage[]>([]);
  const currentEmail = ref<EmailMessage | null>(null);
  const fetchListLoading = ref(false); // Renamed
  const fetchDetailLoading = ref(false); // Renamed
  // sendingReply will be handled by isLoadingUpdate from composable
  const generatingReply = ref(false); // For AI suggestions, separate from CRUD
  const fetchError = ref<string | null>(null); // Renamed for fetch errors
  const pagination = ref<EmailPaginationState>({
      currentPage: 1,
      pageSize: 20,
      totalEmails: null,
  });
   const filters = ref<EmailFilters>({
      status: 'inbox', // Default view
      dateFrom: null,
      dateTo: null,
      searchTerm: '',
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

  // Fetch email list
  const fetchEmails = async (page = 1) => {
    if (!userStore.isAdmin) return;

    fetchListLoading.value = true;
    fetchError.value = null;

    try {
      const token = await getIdToken();
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.value.pageSize.toString(),
        status: filters.value.status || 'inbox',
      });
      if (filters.value.searchTerm) queryParams.append('search', filters.value.searchTerm);
      if (filters.value.dateFrom) queryParams.append('dateFrom', filters.value.dateFrom);
      if (filters.value.dateTo) queryParams.append('dateTo', filters.value.dateTo);

      const response = await $fetch<{ emails: EmailMessage[]; total: number }>('/api/emails/list', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        query: queryParams,
      });

      emails.value = response.emails;
      pagination.value.totalEmails = response.total;
      pagination.value.currentPage = page;

    } catch (err: unknown) {
      fetchError.value = getSafeErrorMessage(err);
      toastStore.error(fetchError.value);
      emails.value = [];
    } finally {
      fetchListLoading.value = false;
    }
  };

  // Fetch single email detail (if needed)
  const fetchEmailDetail = async (id: string) => {
      if (!id || !userStore.isAdmin) return;
      fetchDetailLoading.value = true;
      fetchError.value = null;
      currentEmail.value = null;
      try {
          const token = await getIdToken();
          const response = await $fetch<EmailMessage>(`/api/emails/${id}`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` },
          });
          currentEmail.value = response;
      } catch (err: unknown) {
          fetchError.value = getSafeErrorMessage(err);
          toastStore.error(fetchError.value);
      } finally {
          fetchDetailLoading.value = false;
      }
  };

  // --- CRUD Operations using Composable ---
  interface EmailReplyDto {
    body: string;
    recipientEmail: string;
    subject: string; // Subject for the reply email
    // threadId is the ID of the item being "updated"
    }
    type SendReplyApiResponse = undefined; // API likely doesn't return significant data
  
    const _apiSendReply = async (threadId: string, dto: EmailReplyDto): Promise<SendReplyApiResponse> => {
    const token = await getIdToken();
    await $fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: {
            threadId: threadId,
            to: dto.recipientEmail,
            subject: dto.subject,
            body: dto.body,
        }
    });
  };

  const _transformEmailAfterReply = (
    itemInState: EmailMessage, // The parent email message
    _response: SendReplyApiResponse, // API response (void)
    // We need the DTO to construct the optimistic reply object
    // This suggests transformUpdateResponse might need access to the DTO or the optimistic update logic needs adjustment
    // For now, we'll assume the DTO's data is available via closure or passed differently if needed.
    // Let's assume the optimistic update of itemInState.replies happens *before* this transform is called by the composable,
    // or this transform is responsible for adding the new reply.
    // The composable's updateItem applies DTO to item, then calls this.
    // So, itemInState here would be the parent email *after* its 'updatedAt' (if any) is set by composable,
    // but *before* the 'replies' array is modified with the new reply.
    // This transform should construct the new reply and add it.
    // However, the DTO for updateItem is `EmailReplyDto`, not the full `EmailMessage` for the reply.
    // This means the optimistic construction of the reply needs to happen in the `sendReply` wrapper.
    // The `transformUpdateResponse` here will just return the `itemInState` as the API doesn't give new info for the parent.
    // The actual addition to `replies` array will be done optimistically in the `sendReply` wrapper *before* calling composable's updateItem.
    // This is a bit of a workaround because `updateItem` is designed to update the item itself, not its children.
    // A more advanced Composable might handle "sub-item creation" as a specific type of update.
    // For now, we'll manage the `replies` array optimistically outside the direct `transformUpdateResponse` of the parent.
  ): EmailMessage => {
    // The main email thread item itself isn't changed by the API response here.
    // The optimistic update of its 'replies' array is handled in the sendReply wrapper.
    return itemInState;
  };

  const {
    updateItem: updateEmailOptimistic,
    isLoadingUpdate,
    error: crudError,
  } = useOptimisticCrud<
    EmailMessage,
    Record<string, never>, // TCreateDto (not used)
    EmailReplyDto,         // TUpdateDto for sending a reply (updates the parent thread)
    unknown,               // TApiCreateResponse (not used)
    SendReplyApiResponse
  >({
    itemsRef: emails,
    apiCreate: async () => { throw new Error('Create not implemented for emails store via composable'); },
    apiUpdate: _apiSendReply,
    apiDelete: async () => { throw new Error('Delete not implemented for emails store via composable'); },
    transformUpdateResponse: _transformEmailAfterReply,
  });

  const sendReply = async (threadId: string, body: string, recipientEmail: string) => {
    if (!threadId || !body || !recipientEmail || !userStore.isAdmin) return;

    const parentEmailIndex = emails.value.findIndex(e => e.id === threadId);
    const parentEmailInDetail = (currentEmail.value?.id === threadId) ? currentEmail.value : null;

    if (parentEmailIndex === -1 && !parentEmailInDetail) {
        toastStore.error(`Email thread with ID ${threadId} not found.`);
        return;
    }
    
    // This ref is for UI, can be mapped from isLoadingUpdate[threadId] from composable
    // sendingReply.value = true; // Replaced by isLoadingUpdate[threadId]
    // crudError will be set by composable

    const subject = `Re: ${parentEmailInDetail?.subject || emails.value[parentEmailIndex]?.subject || 'Support Inquiry'}`;
    const replyDto: EmailReplyDto = { body, recipientEmail, subject };

    // Optimistically create the reply and add it to the local state
    const tempReplyId = `temp-reply-${Date.now()}`; // Simplified tempId generation
    const now = getCurrentISOTimestamp();
    const userDisplayName = userStore.userDisplayName || 'You';
    const userEmailValue = userStore.userEmail || 'unknown@sender.com';

    const optimisticReply: EmailMessage = {
        id: tempReplyId,
        subject: subject,
        senderName: userDisplayName,
        senderEmail: userEmailValue,
        recipientEmail: recipientEmail,
        body: body,
        isRead: true,
        isArchived: false,
        receivedAt: now,
        createdAt: now, // from OptimisticItemBase
        replies: [],
    };

    let originalRepliesInList: EmailMessage[] | undefined;
    if (parentEmailIndex !== -1) {
        originalRepliesInList = emails.value[parentEmailIndex].replies ? [...(emails.value[parentEmailIndex].replies ?? [])] : []; // Shallow clone for rollback
        if (!emails.value[parentEmailIndex].replies) {
            emails.value[parentEmailIndex].replies = [];
        }
        // Ensure replies array exists before pushing
        (emails.value[parentEmailIndex].replies as EmailMessage[]).push(optimisticReply);
    }
  
    let originalRepliesInDetail: EmailMessage[] | undefined;
    if (parentEmailInDetail) {
        originalRepliesInDetail = parentEmailInDetail.replies ? [...(parentEmailInDetail.replies ?? [])] : []; // Shallow clone for rollback
        if (!parentEmailInDetail.replies) {
            parentEmailInDetail.replies = [];
        }
        // Ensure replies array exists before pushing
        (parentEmailInDetail.replies as EmailMessage[]).push(optimisticReply);
    }
  
    const result = await updateEmailOptimistic(threadId, replyDto);

    if (!result) { // If result is null, implies update failed
        if (parentEmailIndex !== -1) {
            emails.value[parentEmailIndex].replies = originalRepliesInList;
        }
        if (parentEmailInDetail) {
            parentEmailInDetail.replies = originalRepliesInDetail;
        }
        // Toast is handled by composable
    }
    // sendingReply.value = false; // isLoadingUpdate[threadId] will be false
  };

   // Generate AI Reply Suggestion
  const generateAIReply = async (emailBody: string): Promise<string | null> => {
      if (!emailBody || !userStore.isAdmin) return null;

      generatingReply.value = true; // This is a separate loading state
      fetchError.value = null;    // Use fetchError for this non-CRUD async op

      try {
          const token = await getIdToken();
          const response = await $fetch<{ suggestion: string }>('/api/ai/generate-email-reply', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: {
                  emailBody: emailBody,
                  // Add other context if needed
              }
          });
          return response.suggestion;
      } catch (err: unknown) {
          fetchError.value = getSafeErrorMessage(err);
          toastStore.error(`AI reply generation failed: ${fetchError.value}`);
          return null;
      } finally {
          generatingReply.value = false;
      }
  };


  // Watch for changes filters to refetch
  watch(filters, () => {
      fetchEmails(1); // Reset to page 1 when filters change
  }, { deep: true });


  return {
    emails,
    currentEmail,
    fetchListLoading, // Renamed
    fetchDetailLoading, // Renamed
    // sendingReply, // Replaced by isLoadingUpdate from composable
    generatingReply, // Kept for AI suggestions
    fetchError,   // For fetch operations
    crudError,    // For CUD operations (sendReply)
    isLoadingUpdate, // Specifically for sendReply loading state
    pagination,
    filters,
    fetchEmails,
    fetchEmailDetail,
    sendReply,
    generateAIReply,
  };
});