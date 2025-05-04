import { defineStore } from 'pinia';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';

// Interface for Resource Metadata (adjust based on API response)
export interface Resource {
  id: string; // Firestore document ID or unique identifier
  name: string; // File name
  path: string; // Full path in Firebase Storage (e.g., apps/appId/resources/fileName.pdf)
  url?: string; // Optional: Download URL (e.g., signed URL)
  size: number; // File size in bytes
  contentType: string; // MIME type
  createdAt: string; // ISO timestamp string
  appId: string; // Associated application ID
}

// Interface for pagination state (if needed)
interface ResourcePaginationState {
  currentPage: number;
  pageSize: number;
  totalResources: number | null;
  // Add cursor/token if API uses it
}

export const useResourcesStore = defineStore('resources', () => {
  // State
  const resources = ref<Resource[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedAppId = ref<string | null>(null); // Track which app's resources are shown
  // Add pagination state if implementing pagination
  // const pagination = ref<ResourcePaginationState>({ ... });

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

  // --- Utility Function for Error Handling ---
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

  // Fetch resources for a specific app
  const fetchResources = async (appId: string | null) => {
    if (!appId) {
      resources.value = [];
      selectedAppId.value = null;
      return;
    }
    if (!userStore.isAdmin) return; // Basic check

    selectedAppId.value = appId;
    loading.value = true;
    error.value = null;

    try {
      const token = await getIdToken();
      const queryParams = new URLSearchParams({ appId });
      // Add pagination params if needed: queryParams.append('page', '1');

      const response = await $fetch<{ resources: Resource[]; total?: number }>('/api/resources/list', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        query: queryParams,
      });

      resources.value = response.resources;
      // Update pagination state if needed
      // pagination.value.totalResources = response.total ?? null;

    } catch (err: unknown) { // Use unknown
      console.error("Error fetching resources:", err);
      error.value = getSafeErrorMessage(err); // Use utility function
      if (error.value) {
          toastStore.error(error.value);
      }
      resources.value = []; // Clear list on error
    } finally {
      loading.value = false;
    }
  };

  // Upload a resource
  const uploadResource = async (appId: string, file: File) => {
    if (!appId || !file || !userStore.isAdmin) return;

    loading.value = true; // Consider a separate loading state for upload
    error.value = null;

    try {
      const token = await getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      // Pass appId in query params for the API endpoint
      const queryParams = new URLSearchParams({ appId });

      await $fetch(`/api/resources/upload?${queryParams.toString()}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      toastStore.success(`Successfully uploaded ${file.name}`);
      await fetchResources(appId); // Refresh list

    } catch (err: unknown) { // Use unknown
      console.error("Error uploading resource:", err);
      error.value = getSafeErrorMessage(err); // Use utility function
      if (error.value) {
          toastStore.error(error.value);
      }
    } finally {
      loading.value = false; // Reset general loading or specific upload loading
    }
  };

  // Delete a resource
  const deleteResource = async (resource: Resource) => {
    if (!resource || !userStore.isAdmin) return;

    loading.value = true; // Consider separate loading state
    error.value = null;

    try {
      const token = await getIdToken();
      await $fetch('/api/resources/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
         },
        body: { path: resource.path } // Send the full storage path for deletion
      });

      toastStore.success(`Successfully deleted ${resource.name}`);
      // Refresh list for the currently selected app
      if (selectedAppId.value) {
        await fetchResources(selectedAppId.value);
      }

    } catch (err: unknown) { // Use unknown
      console.error("Error deleting resource:", err);
      let message = 'Failed to delete resource';
      if (typeof err === 'object' && err !== null) {
        if ('data' in err && typeof err.data === 'object' && err.data !== null && 'message' in err.data && typeof err.data.message === 'string') {
          message = err.data.message;
        } else if ('statusMessage' in err && typeof err.statusMessage === 'string') {
          message = err.statusMessage;
        } else if (err instanceof Error) {
          message = err.message;
        }
      }
      error.value = message;
      if (error.value) {
          toastStore.error(error.value);
      }
    } finally {
      loading.value = false;
    }
  };

  // Get download URL
  const getDownloadUrl = async (resourcePath: string): Promise<string | null> => {
      if (!resourcePath || !userStore.isAdmin) return null;
      // Consider adding a loading state specific to download URL generation if needed
      error.value = null;
      try {
          const token = await getIdToken();
          const queryParams = new URLSearchParams({ path: resourcePath });
          const response = await $fetch<{ downloadUrl: string }>(`/api/resources/download?${queryParams.toString()}`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` },
          });
          return response.downloadUrl;
      } catch (err: unknown) {
          console.error(`Error getting download URL for ${resourcePath}:`, err);
          error.value = getSafeErrorMessage(err);
          toastStore.error(error.value || 'Failed to get download link.');
          return null;
      }
  };

  return {
    resources,
    loading,
    error,
    selectedAppId,
    // pagination, // if used
    fetchResources,
    uploadResource,
    deleteResource,
    getDownloadUrl, // Expose the new action
  };
});