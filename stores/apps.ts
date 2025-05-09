import { defineStore } from 'pinia'
// Removed client SDK imports for CUD: collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp
// Removed useFirestore import as it's no longer needed for CUD
import { getAuth } from 'firebase/auth'
import { useUserStore } from '~/stores/user'
// import { createError } from '#imports' // No longer directly used in this store after refactor
import { useOptimisticCrud, type OptimisticItemBase } from '~/composables/useOptimisticCrud'
// generateTempId, deepClone, getCurrentISOTimestamp are now used within useOptimisticCrud

// Ensure Application interface conforms to OptimisticItemBase
export interface Application extends OptimisticItemBase {
// Define the interface for an Application, including fields used in the UI
  // id, createdAt, updatedAt are from OptimisticItemBase
  name: string;
  description?: string;
  links?: { [key: string]: string };
  logoUrl?: string;
  platforms?: string[];
  status?: 'active' | 'draft' | 'archived' | string;
  appId?: string; // Specific app identifier, different from Firestore doc id
  downloads?: number;
  rating?: number;
  tags?: string[];
  features?: { title: string; description: string }[];
  screenshotUrls?: string[];
}

// AppFormData should omit id, createdAt, updatedAt as these are managed
export type AppFormData = Omit<Partial<Application>, 'id' | 'createdAt' | 'updatedAt'> & { name: string }; // Name is required

// Define structure for pagination state using cursor
interface AppPaginationState {
  pageSize: number;
  nextPageCursor: string | null; // Store the cursor for the next page
  totalApps: number | null; // Total count remains useful
}

export const useAppsStore = defineStore('apps', () => {
  // State
  const apps = ref<Application[]>([])
  // loading and error will be handled by useOptimisticCrud or separate refs if needed for fetch
  const fetchLoading = ref(false);
  const fetchError = ref<Error | null>(null);
  const pagination = ref<AppPaginationState>({
    pageSize: 10,
    nextPageCursor: null,
    totalApps: null,
  })

  // Get dependencies
  const userStore = useUserStore()
  // const auth = getAuth(); // Removed: Will call getAuth() inside functions that need it

  // API call wrappers for the composable
  const _apiCreateApp = async (formData: AppFormData): Promise<{ success: boolean, id: string }> => {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Could not retrieve user token");
    return $fetch<{ success: boolean, id: string }>('/api/apps/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: formData,
    });
  };

  const _apiUpdateApp = async (id: string, formData: AppFormData): Promise<{ success: boolean, id: string }> => {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Could not retrieve user token");
    return $fetch<{ success: boolean, id: string }>(`/api/apps/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: formData,
    });
  };

  const _apiDeleteApp = async (id: string): Promise<void> => {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Could not retrieve user token");
    await $fetch<{ success: boolean, id: string }>(`/api/apps/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${idToken}` },
    });
  };

  const _transformCreateResponseForApp = (
    optimisticItem: Application,
    response: { success: boolean, id: string },
    tempId: string | number
  ): Application => {
    if (!response.success || !response.id) {
      throw new Error("API did not return a success status or new ID for app creation.");
    }
    // Ensure response.id is a clean string
    const cleanId = String(response.id).replace(/<!--.*?-->/g, "").trim();
    if (!cleanId) {
        throw new Error("API returned an empty or invalid ID after cleaning for app creation.");
    }
    return {
      ...optimisticItem,
      id: cleanId, // Update with the cleaned ID
    };
  };
  
  const {
    createItem: createAppOptimistic,
    updateItem: updateAppOptimistic,
    deleteItem: deleteAppOptimistic,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    error: crudError,
  } = useOptimisticCrud<Application, AppFormData, AppFormData, { success: boolean, id: string }, { success: boolean, id: string }>({
    itemsRef: apps,
    apiCreate: _apiCreateApp,
    apiUpdate: _apiUpdateApp,
    apiDelete: _apiDeleteApp,
    transformCreateResponse: _transformCreateResponseForApp,
    // No specific transformUpdateResponse needed if API just returns success
    // itemIdKey: 'id', // Default is 'id'
    tempIdPrefix: 'app-temp',
  });

  // Wrapper functions to match existing store method signatures if needed, or expose directly
  const createApp = async (formData: AppFormData): Promise<string | null> => {
    if (!userStore.isAdmin) {
      throw new Error('Unauthorized: Only admins can create applications.');
    }
    const result = await createAppOptimistic(formData);
    // The actual created/updated item is in result.item
    // The API response (e.g., { success: boolean, id: string }) is in result.apiResponse
    return result.item ? result.item.id : null;
  };

  const updateApp = async (appId: string, formData: AppFormData): Promise<void> => {
    if (!userStore.isAdmin) {
      throw new Error('Unauthorized: Only admins can update applications.');
    }
    const updatedApp = await updateAppOptimistic(appId, formData);
    if (!updatedApp) {
      // Error is handled by composable and toast is shown, re-throw if needed by caller
      // throw crudError.value || new Error('Failed to update application');
    }
  };

  const deleteApp = async (appId: string): Promise<void> => {
    if (!userStore.isAdmin) {
      throw new Error('Unauthorized: Only admins can delete applications.');
    }
    const success = await deleteAppOptimistic(appId);
    if (!success) {
      // Error is handled by composable and toast is shown
      // throw crudError.value || new Error('Failed to delete application');
    }
  };

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

    fetchLoading.value = true; // Use specific loading state for fetch
    fetchError.value = null;   // Use specific error state for fetch
    // const isFreshFetch = !options.cursor; // Not directly used anymore
    const requestedPageSize = options.pageSize ?? pagination.value.pageSize;

    try {
      // const auth = getAuth(); // Already called within this scope if needed, or call it fresh
      const authInstance = getAuth(); // Call it fresh to be safe
      const idToken = await authInstance.currentUser?.getIdToken();
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

      // Safely update state based on API response
      if (Array.isArray(response.apps)) {
        apps.value = response.apps;
      } else {
        console.warn("fetchApps: API response.apps is not an array. Setting apps to []. Response:", response);
        apps.value = [];
      }

      if (typeof response.total === 'number' && !Number.isNaN(response.total)) { // Use Number.isNaN
        pagination.value.totalApps = response.total;
      } else {
        console.warn(`fetchApps: API response.total is not a valid number (value: ${response.total}). Setting totalApps to null. Response:`, response);
        pagination.value.totalApps = null;
      }
      
      pagination.value.nextPageCursor = response.nextPageCursor ?? null; // Ensure null if undefined
      pagination.value.pageSize = requestedPageSize;

    } catch (err: unknown) {
      console.error("Error fetching apps:", err);
      const message = crudError.value?.message || (err instanceof Error ? err.message : 'Failed to fetch apps');
      fetchError.value = new Error(message);
      userStore.showToast(message, 'error');
    } finally {
      fetchLoading.value = false;
    }
  }

  // Fetch a single application by ID
  const fetchAppById = async (appId: string): Promise<Application | null> => {
    // No need to check admin here, API endpoint handles authorization
    if (!userStore.isAuthenticated) {
      console.warn("AppsStore: User not authenticated for fetchAppById");
      throw new Error("User not authenticated");
    }
    // This loading state might conflict with fetchLoading or CRUD loading.
    // Consider if this needs its own loading state or if it should use fetchLoading.
    fetchLoading.value = true;
    fetchError.value = null;

    try {
      // const auth = getAuth(); // Already called within this scope if needed, or call it fresh
      const authInstance = getAuth(); // Call it fresh to be safe
      const idToken = await authInstance.currentUser?.getIdToken();
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
      const message = crudError.value?.message || (err instanceof Error ? err.message : `Failed to fetch app ${appId}`);
      fetchError.value = new Error(message);
      userStore.showToast(message, 'error');
      throw fetchError.value; // Re-throw error
    } finally {
      fetchLoading.value = false;
    }
  }

  // Define options type for public fetching, even if empty for now
  // This type alias explicitly defines an object with no properties, satisfying linters.
  type FetchPublicAppsOptions = Record<string, never>;
    // Add public filters like category later if needed
    // category?: string;
    // cursor?: string | null; // Add pagination later if needed
    // pageSize?: number;

  // Fetch public (active) apps - No auth needed for API call
  const fetchPublicApps = async (options: FetchPublicAppsOptions = {}) => {
    fetchLoading.value = true;
    fetchError.value = null;
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
      const message = crudError.value?.message || (err instanceof Error ? err.message : 'Failed to fetch public apps');
      fetchError.value = new Error(message);
      // userStore.showToast(message, 'error'); // Avoid toast for public errors unless critical
    } finally {
      fetchLoading.value = false;
    }
  }

  // Return state and methods
  return {
    apps,
    // Expose specific loading states from composable
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    // Expose specific error from composable for CUD operations
    crudError,
    // Keep fetch-specific loading and error for fetch operations
    fetchLoading,
    fetchError,
    pagination,
    fetchApps,
    createApp,
    updateApp,
    deleteApp,
    fetchAppById,
    fetchPublicApps,
  }
})