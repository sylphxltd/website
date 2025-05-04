import { defineStore } from 'pinia'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { getAuth } from 'firebase/auth' // Import getAuth
import { useFirestore } from 'vuefire'
import { useUserStore } from '~/stores/user'
import { createError } from '#imports'

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
  // gradientClass?: string; // Removed - UI concern, not core data
  downloads?: number; // Placeholder
  rating?: number; // Placeholder
  // New fields for richer data
  tags?: string[]; // e.g., ['Productivity', 'AI', 'Cross-Platform']
  features?: { title: string; description: string }[]; // List of key features
  screenshotUrls?: string[]; // URLs for app screenshots
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
  // New fields
  tags?: string[];
  features?: { title: string; description: string }[];
  screenshotUrls?: string[];
}

// Define structure for pagination state (can be shared or redefined)
interface AppPaginationState {
  currentPage: number;
  pageSize: number;
  // Firestore uses DocumentSnapshot for cursors, harder to manage client-side directly.
  // We might rely on page number or offset, or handle cursors if API returns them.
  // Let's use page number for simplicity for now, assuming API supports it.
  totalApps: number | null;
}

export const useAppsStore = defineStore('apps', () => {
  // State
  const apps = ref<Application[]>([]) // Holds apps for the CURRENT page
  const loading = ref(false)
  const error = ref<Error | { message: string } | null>(null)
  const pagination = ref<AppPaginationState>({ // Add pagination state
      currentPage: 1,
      pageSize: 10, // Default page size
      totalApps: null,
  })

  // Get dependencies
  const db = useFirestore() // Firestore instance
  const userStore = useUserStore()

  // Fetch apps from the API endpoint with pagination and filtering
  const fetchApps = async (options: {
      page?: number;
      pageSize?: number;
      search?: string;
      platform?: string;
      status?: string;
    } = {}) => {

    // Skip if not authenticated (API endpoint will also check admin status)
    if (!userStore.isAuthenticated) {
      console.warn("AppsStore: User not authenticated")
      return
    }

    loading.value = true
    error.value = null

    const requestedPage = options.page ?? 1;
    const requestedPageSize = options.pageSize ?? pagination.value.pageSize;

    try {
      // Get ID token for authorization
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Could not retrieve user token");
      }

      // Construct query parameters for the API call
      const queryParams = new URLSearchParams();
      queryParams.append('page', requestedPage.toString());
      queryParams.append('limit', requestedPageSize.toString());
      if (options.search) {
          queryParams.append('search', options.search);
      }
      if (options.platform) {
          queryParams.append('platform', options.platform);
      }
      if (options.status) {
          queryParams.append('status', options.status);
      }

      // Make the API call to a new/updated endpoint
      // Assuming API returns { apps: Application[], total: number }
      const response = await $fetch<{ apps: Application[]; total: number }>('/api/apps/list', { // Updated API path
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        query: queryParams
      });

      // Update state
      apps.value = response.apps;
      pagination.value.totalApps = response.total;
      pagination.value.currentPage = requestedPage;
      pagination.value.pageSize = requestedPageSize;
    } catch (err) {
      console.error("Error fetching apps:", err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications'
      error.value = { message: errorMessage }
      userStore.showToast(errorMessage, 'error')
    } finally {
      loading.value = false
    }
  }

  // Create a new application
  const createApp = async (formData: AppFormData) => {
    if (!db || !userStore.isAdmin) {
      throw new Error('Unauthorized or DB not available')
    }

    try {
      const appsCollection = collection(db, "apps")
      const appData = {
        name: formData.name,
        description: formData.description || '',
        links: formData.links || {},
        logoUrl: formData.logoUrl || '',
        platforms: formData.platforms || [],
        status: formData.status || 'draft',
        appId: formData.appId || '',
        tags: formData.tags || [], // Save tags
        features: formData.features || [], // Save features
        screenshotUrls: formData.screenshotUrls || [], // Save screenshots
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(appsCollection, appData)
      userStore.showToast('Application created successfully!', 'success')

      // Refresh the list (go back to page 1)
      await fetchApps({ page: 1, pageSize: pagination.value.pageSize })
      return docRef.id
    } catch (err) {
      console.error("Error creating app:", err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create application'
      userStore.showToast(errorMessage, 'error')
      throw err
    }
  }

  // Update an existing application
  const updateApp = async (appId: string, formData: AppFormData) => {
    if (!db || !userStore.isAdmin) {
      throw new Error('Unauthorized or DB not available')
    }

    try {
      const appRef = doc(db, "apps", appId)
      // Construct the update payload, including new fields
      const updateData = {
        name: formData.name,
        description: formData.description || '',
        links: formData.links || {},
        logoUrl: formData.logoUrl || '',
        platforms: formData.platforms || [],
        status: formData.status || 'draft',
        appId: formData.appId || '',
        tags: formData.tags || [], // Update tags
        features: formData.features || [], // Update features
        screenshotUrls: formData.screenshotUrls || [], // Update screenshots
        updatedAt: serverTimestamp()
      };

      // Pass the object to updateDoc
      await updateDoc(appRef, updateData)
      userStore.showToast('Application updated successfully!', 'success')

      // Refresh the current page view
      await fetchApps({
          page: pagination.value.currentPage,
          pageSize: pagination.value.pageSize,
          // Include current filters if needed for consistency
      });
    } catch (err) {
      console.error("Error updating app:", err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application'
      userStore.showToast(errorMessage, 'error')
      throw err
    }
  }

  // Delete an application
  const deleteApp = async (appId: string) => {
    if (!db || !userStore.isAdmin) {
      throw new Error('Unauthorized or DB not available')
    }

    try {
      const appRef = doc(db, "apps", appId)
      await deleteDoc(appRef)
      userStore.showToast('Application deleted successfully!', 'success')

      // Refresh the current page view
      // Consider edge case: if deleting last item on a page > 1, should go to previous page
      const currentPage = pagination.value.currentPage;
      const pageSize = pagination.value.pageSize;
      const totalApps = pagination.value.totalApps;
      let pageToFetch = currentPage;

      if (totalApps !== null && apps.value.length === 1 && currentPage > 1) {
         // If it was the last item on a page > 1, fetch the previous page
         pageToFetch = currentPage - 1;
      }

      await fetchApps({
          page: pageToFetch,
          pageSize: pageSize,
          // Include current filters if needed for consistency
      });
    } catch (err) {
      console.error("Error deleting app:", err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete application'
      userStore.showToast(errorMessage, 'error')
      throw err
    }
  }

  // Return state and methods
  return {
    apps, // Current page of apps
    loading,
    error,
    pagination, // Expose pagination state
    fetchApps,
    createApp,
    updateApp,
    deleteApp,
    // Consider adding actions for changing page, page size etc.
  }
})