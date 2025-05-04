import { defineStore } from 'pinia';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';

// Interface for a connected media account
export interface MediaAccount {
  id: string; // Unique identifier (e.g., platform user ID)
  platform: 'medium' | 'x' | 'facebook' | string; // Platform identifier
  name: string; // Account name/handle
  // Add other relevant details like profile picture, connection status etc.
}

// Interface for content to be published
export interface MediaPostContent {
  title?: string; // For platforms like Medium
  body: string; // Base content (e.g., Markdown or HTML from editor)
  tags?: string[];
  // Add image/video URLs if needed
}

export const useMediaStore = defineStore('media', () => {
  // State
  const accounts = ref<MediaAccount[]>([]);
  const loadingAccounts = ref(false);
  const publishing = ref(false);
  const generatingVariation = ref(false);
  const error = ref<string | null>(null);

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
         // Define a type for the expected error data structure
         type ErrorData = { message?: string };
         const errorData = (error as { data?: unknown }).data;
         if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof (errorData as ErrorData).message === 'string') {
           return (errorData as ErrorData).message as string;
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

  // Fetch connected accounts
  const fetchAccounts = async () => {
    if (!userStore.isAdmin) return;
    loadingAccounts.value = true;
    error.value = null;
    try {
      const token = await getIdToken();
      // Assuming API endpoint exists
      const response = await $fetch<{ accounts: MediaAccount[] }>('/api/media/accounts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      accounts.value = response.accounts;
    } catch (err: unknown) {
      error.value = getSafeErrorMessage(err);
      toastStore.error(error.value);
      accounts.value = [];
    } finally {
      loadingAccounts.value = false;
    }
  };

  // Publish content
  const publishPost = async (content: MediaPostContent, platforms: string[]) => {
    if (!platforms || platforms.length === 0 || !content.body || !userStore.isAdmin) return;

    publishing.value = true;
    error.value = null;
    try {
      const token = await getIdToken();
      await $fetch('/api/media/post', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: {
          content: content,
          platforms: platforms,
        }
      });
      toastStore.success(`Post submitted for publishing to ${platforms.join(', ')}!`);
    } catch (err: unknown) {
      error.value = getSafeErrorMessage(err);
      toastStore.error(`Publishing failed: ${error.value}`);
    } finally {
      publishing.value = false;
    }
  };

  // Generate AI variation for a specific platform
  const generatePlatformVariation = async (baseContent: string, platform: string): Promise<string | null> => {
      if (!baseContent || !platform || !userStore.isAdmin) return null;

      generatingVariation.value = true; // Consider platform-specific loading?
      error.value = null;
      try {
          const token = await getIdToken();
          const response = await $fetch<{ suggestion: string }>('/api/ai/generate-social-post', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: {
                  baseContent: baseContent,
                  platform: platform, // e.g., 'x', 'facebook', 'medium'
              }
          });
          return response.suggestion;
      } catch (err: unknown) {
          error.value = getSafeErrorMessage(err);
          toastStore.error(`AI variation generation failed: ${error.value}`);
          return null;
      } finally {
          generatingVariation.value = false;
      }
  };


  return {
    accounts,
    loadingAccounts,
    publishing,
    generatingVariation,
    error,
    fetchAccounts,
    publishPost,
    generatePlatformVariation,
  };
});