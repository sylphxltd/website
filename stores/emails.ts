import { defineStore } from 'pinia';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';

// Interface for an Email Thread/Message (adjust based on actual API)
export interface EmailMessage {
  id: string; // Unique ID for the email/thread
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
  const currentEmail = ref<EmailMessage | null>(null); // For detail view
  const loadingList = ref(false);
  const loadingDetail = ref(false);
  const sendingReply = ref(false);
  const generatingReply = ref(false);
  const error = ref<string | null>(null);
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

  // Fetch email list
  const fetchEmails = async (page = 1) => {
    if (!userStore.isAdmin) return;

    loadingList.value = true;
    error.value = null;

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
      error.value = getSafeErrorMessage(err);
      toastStore.error(error.value);
      emails.value = [];
    } finally {
      loadingList.value = false;
    }
  };

  // Fetch single email detail (if needed)
  const fetchEmailDetail = async (id: string) => {
      if (!id || !userStore.isAdmin) return;
      loadingDetail.value = true;
      error.value = null;
      currentEmail.value = null;
      try {
          const token = await getIdToken();
          // Assuming an endpoint like /api/emails/{id} exists
          const response = await $fetch<EmailMessage>(`/api/emails/${id}`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` },
          });
          currentEmail.value = response;
      } catch (err: unknown) {
          error.value = getSafeErrorMessage(err);
          toastStore.error(error.value);
      } finally {
          loadingDetail.value = false;
      }
  };

  // Send reply
  const sendReply = async (threadId: string, body: string, recipientEmail: string) => {
      if (!threadId || !body || !recipientEmail || !userStore.isAdmin) return;
      sendingReply.value = true;
      error.value = null;
      try {
          const token = await getIdToken();
          await $fetch('/api/emails/send', { // Assuming one endpoint handles new/reply
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: {
                  threadId: threadId, // Indicate it's a reply
                  to: recipientEmail,
                  subject: `Re: ${currentEmail.value?.subject || 'Support Inquiry'}`, // Generate subject
                  body: body,
              }
          });
          toastStore.success('Reply sent successfully!');
          // Refresh detail view or list?
          if (currentEmail.value?.id === threadId) {
              await fetchEmailDetail(threadId); // Refresh detail
          } else {
              await fetchEmails(pagination.value.currentPage); // Refresh list
          }
      } catch (err: unknown) {
          error.value = getSafeErrorMessage(err);
          toastStore.error(`Failed to send reply: ${error.value}`);
      } finally {
          sendingReply.value = false;
      }
  };

   // Generate AI Reply Suggestion
  const generateAIReply = async (emailBody: string): Promise<string | null> => {
      if (!emailBody || !userStore.isAdmin) return null;

      generatingReply.value = true;
      error.value = null;

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
          error.value = getSafeErrorMessage(err);
          toastStore.error(`AI reply generation failed: ${error.value}`);
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
    loadingList,
    loadingDetail,
    sendingReply,
    generatingReply,
    error,
    pagination,
    filters,
    fetchEmails,
    fetchEmailDetail,
    sendReply,
    generateAIReply,
  };
});