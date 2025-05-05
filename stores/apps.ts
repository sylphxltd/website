import { defineStore } from 'pinia'
// Removed client SDK imports for CUD: collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp
// Removed useFirestore import as it's no longer needed for CUD
import { getAuth } from 'firebase/auth'
import { useUserStore } from '~/stores/user'
import { createError } from '#imports' // Keep for potential client-side errors if needed

// Define the interface for an Application, including fields used in the UI
export interface Application {
  id: string; // Firestore document ID
  name: string;
  description?: string;
  links?: { [key: string]: string };
  logoUrl?: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  platforms?: string[];
  status?: 'active' | 'draft' | 'archived' | string;
  appId?: string;
  downloads?: number; // Placeholder
  rating?: number; // Placeholder
  tags?: string[];
  features?: { title: string; description: string }[];
  screenshotUrls?: string[];
}

// Define the structure for form data (without ID)
export interface AppFormData {
  name: string;
  description?: string;
  links?: { [key: string]: string };
  logoUrl?: string;
  platforms?: string[];
  status?: 'active' | 'draft' | 'archived' | string;
  appId?: string;
  tags?: string[];
  features?: { title: string; description: string }[];
  screenshotUrls?: string[];
}

// Define structure for pagination state using cursor
interface AppPaginationState {
  pageSize: number;
  nextPageCursor: string | null; // Store the cursor for the next page
  totalApps: number | null; // Total count remains useful
}

export const useAppsStore = defineStore('apps', () => {
  // State
  const apps = ref<Application[]>([]) // Holds apps for the CURRENT page/batch
  const loading = ref(false)
  const error = ref<Error | { message: string } | null>(null)
  const pagination = ref<AppPaginationState>({ // Updated pagination state
      pageSize: 10, // Default page size
      nextPageCursor: null, // Initialize cursor as null
      totalApps: null,
  })

  // Get dependencies
  // const db = useFirestore() // Removed - CUD operations moved to API
  const userStore = useUserStore()

  // Helper to extract error messages from various error types (including $fetch errors)
  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err !== null) {
      // Check for Nuxt $fetch error structure
      if ('data' in err && typeof err.data === 'object' && err.data !== null && 'statusMessage' in err.data && typeof err.data.statusMessage === 'string') {
        return err.data.statusMessage; // Use statusMessage from $fetch error
      }
      // Check for standard Error object
      if ('message' in err && typeof err.message === 'string') {
        return (err as { message: string }).message;
      }
    }
    return 'An unexpected error occurred';
  }


  // Fetch apps from the API endpoint with cursor pagination and filtering
  const fetchApps = async (options: {
      cursor?: string | null;
      pageSize?: number;
      search?: string;
      platform?: string;
      status?: string;
    } = {}) => {

    if (!userStore.isAuthenticated) {
      console.warn("AppsStore: User not authenticated")
      return
    }

    loading.value = true
    error.value = null
    const isFreshFetch = !options.cursor;
    const requestedPageSize = options.pageSize ?? pagination.value.pageSize;

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Could not retrieve user token");
      }

      const queryParams = new URLSearchParams();
      queryParams.append('limit', requestedPageSize.toString());
      if (options.cursor) {
          queryParams.append('cursor', options.cursor);
      }
      if (options.search) {
          queryParams.append('search', options.search);
      }
      if (options.platform) {
          queryParams.append('platform', options.platform);
      }
      if (options.status) {
          queryParams.append('status', options.status);
      }

      const response = await $fetch<{ apps: Application[]; total: number; nextPageCursor: string | null }>('/api/apps/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        query: queryParams
      });

      // Always replace data for now, simplifies pagination logic
      apps.value = response.apps;
      pagination.value.totalApps = response.total;
      pagination.value.nextPageCursor = response.nextPageCursor;
      pagination.value.pageSize = requestedPageSize;

    } catch (err: unknown) { // Use unknown type
      console.error("Error fetching apps:", err)
      const errorMessage = getErrorMessage(err); // Use helper
      error.value = { message: errorMessage }
      userStore.showToast(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }

  // Fetch a single application by ID
  const fetchAppById = async (appId: string): Promise<Application | null> => {
    // No need to check admin here, API endpoint handles authorization
    if (!userStore.isAuthenticated) {
      console.warn("AppsStore: User not authenticated for fetchAppById");
      throw new Error("User not authenticated");
    }

    loading.value = true; // Use the general loading state for simplicity
    error.value = null;

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Could not retrieve user token");
      }

      // Call the backend API to get a single app
      const response = await $fetch<Application>(`/api/apps/${appId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      // Optional: Update the app in the local list if it exists?
      // Or just return the fetched app data for the component to use.
      // Let's just return it for now.
      return response;

    } catch (err: unknown) {
      console.error(`Error fetching app with ID ${appId}:`, err);
      const errorMessage = getErrorMessage(err);
      error.value = { message: errorMessage };
      userStore.showToast(errorMessage, 'error');
      throw new Error(errorMessage); // Re-throw error
    } finally {
      loading.value = false;
    }
  }

  // Define options type for public fetching, even if empty for now
  interface FetchPublicAppsOptions {
      // Add public filters like category later if needed
      // category?: string;
      // cursor?: string | null; // Add pagination later if needed
      // pageSize?: number;
  }

  // Fetch public (active) apps - No auth needed for API call
  const fetchPublicApps = async (options: FetchPublicAppsOptions = {}) => {

    loading.value = true;
    error.value = null;
    // const requestedPageSize = options.pageSize ?? 20; // Example public page size

    try {
      const queryParams = new URLSearchParams();
      // queryParams.append('limit', requestedPageSize.toString());
      // if (options.cursor) queryParams.append('cursor', options.cursor);
      // if (options.category) queryParams.append('category', options.category);

      // Call the public API endpoint
      const response = await $fetch<{ apps: Partial<Application>[] /*, nextPageCursor: string | null */ }>('/api/apps/public', {
        method: 'GET',
        query: queryParams // Pass constructed query params
      });

      // Replace the apps state with public apps
      // Consider using a separate state property like `publicApps` if admin apps are also needed simultaneously
      apps.value = response.apps as Application[]; // Cast to Application[] for now
      pagination.value.nextPageCursor = null; // Reset cursor as public API doesn't support it yet
      pagination.value.totalApps = response.apps.length; // Total is just the fetched count for now

    } catch (err: unknown) {
      console.error("Error fetching public apps:", err);
      const errorMessage = getErrorMessage(err);
      error.value = { message: errorMessage };
      // Avoid showing toast for public errors unless critical?
      // userStore.showToast(errorMessage, 'error');
    } finally {
      loading.value = false;
    }
  }

  // Create a new application by calling the backend API
  const createApp = async (formData: AppFormData): Promise<string> => {
    if (!userStore.isAdmin) { // Check admin status from user store
      throw new Error('Unauthorized: Only admins can create applications.')
    }

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Could not retrieve user token");
      }

      // Call the backend API
      const response = await $fetch<{ success: boolean, id: string }>('/api/apps/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: formData // Send the form data directly
      });

      if (!response.success || !response.id) {
          throw new Error("API did not return a success status or new ID.");
      }

      userStore.showToast('Application created successfully!', 'success')

      // Refresh the list (fetch first page)
      await fetchApps({ pageSize: pagination.value.pageSize })
      return response.id // Return the new ID from the API response

    } catch (err: unknown) { // Use unknown type
      console.error("Error creating app via API:", err)
      const errorMessage = getErrorMessage(err); // Use helper
      userStore.showToast(errorMessage, 'error')
      throw new Error(errorMessage); // Re-throw error with message
    }
  }

  // Update an existing application by calling the backend API
  const updateApp = async (appId: string, formData: AppFormData): Promise<void> => {
    if (!userStore.isAdmin) {
      throw new Error('Unauthorized: Only admins can update applications.')
    }

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Could not retrieve user token");
      }

      // Call the backend API
      await $fetch<{ success: boolean, id: string }>(`/api/apps/${appId}`, { // Use template literal for URL
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: formData
      });

      userStore.showToast('Application updated successfully!', 'success')

      // Refresh the list (fetch first page)
      await fetchApps({ pageSize: pagination.value.pageSize });

    } catch (err: unknown) { // Use unknown type
      console.error("Error updating app via API:", err)
      const errorMessage = getErrorMessage(err); // Use helper
      userStore.showToast(errorMessage, 'error')
      throw new Error(errorMessage); // Re-throw error with message
    }
  }

  // Delete an application by calling the backend API
  const deleteApp = async (appId: string): Promise<void> => {
    if (!userStore.isAdmin) {
      throw new Error('Unauthorized: Only admins can delete applications.')
    }

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Could not retrieve user token");
      }

      // Call the backend API
      await $fetch<{ success: boolean, id: string }>(`/api/apps/${appId}`, { // Use template literal for URL
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      userStore.showToast('Application deleted successfully!', 'success')

      // Refresh the list (fetch first page)
      await fetchApps({ pageSize: pagination.value.pageSize });

    } catch (err: unknown) { // Use unknown type
      console.error("Error deleting app via API:", err)
      const errorMessage = getErrorMessage(err); // Use helper
      userStore.showToast(errorMessage, 'error')
      throw new Error(errorMessage); // Re-throw error with message
    }
  }

  // Return state and methods
  return {
    apps,
    loading,
    error,
    pagination,
    fetchApps,
    createApp, // Now calls API
    updateApp, // Now calls API
    deleteApp, // Now calls API
    fetchAppById,
    fetchPublicApps, // Add the new public fetch action
  }
})