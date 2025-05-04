import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { useUserStore } from '~/stores/user'

// Define User interface based on API response
export interface ApiUser {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string;
  phoneNumber?: string; // Add phoneNumber
  disabled: boolean;
  emailVerified: boolean;
  customClaims?: { [key: string]: unknown };
  tenantId?: string; // Add tenantId
  metadata: {
    creationTime?: string
    lastSignInTime?: string
  }
  providerData?: { // Added providerData array
    providerId: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    uid: string;
  }[]
}

// Define structure for pagination state
interface PaginationState {
  currentPage: number;
  pageSize: number;
  nextPageToken?: string | null; // Token for Firebase pagination
  totalUsers: number | null; // Note: Firebase listUsers doesn't easily provide total
}

export const useAdminUsersStore = defineStore('adminUsers', () => {
  // State
  const users = ref<ApiUser[]>([]) // Holds the users for the CURRENT page
  const loading = ref(false)
  const error = ref<string | null>(null)
  const settingRoleUid = ref<string | null>(null)
  const pagination = ref<PaginationState>({ // Add pagination state
      currentPage: 1,
      pageSize: 10, // Default page size
      nextPageToken: null,
      totalUsers: null,
  })
  
  // Get dependencies
  const userStore = useUserStore()
  
  // Helper to extract error messages from various error types
  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err !== null) {
      // Check for Nuxt $fetch error structure
      if ('data' in err && typeof err.data === 'object' && err.data !== null && 'message' in err.data && typeof err.data.message === 'string') {
        return err.data.message
      }
      // Check for standard Error object
      if ('message' in err && typeof err.message === 'string') {
        return (err as { message: string }).message
      }
    }
    return 'An unexpected error occurred'
  }

  // Fetch users from the API endpoint with pagination and filtering
  const fetchUsers = async (options: {
      page?: number;
      pageSize?: number;
      pageToken?: string | null; // Use pageToken for Firebase
      search?: string;
      role?: 'admin' | 'user' | '';
      status?: 'active' | 'inactive' | ''; // Maps to 'disabled' flag
    } = {}) => {
        
    // Skip if not admin
    if (!userStore.isAdmin) {
      console.warn("AdminUsersStore: User is not an admin")
      return
    }

    loading.value = true
    error.value = null
    
    // Determine page size and token for the request
    const requestedPageSize = options.pageSize ?? pagination.value.pageSize;
    // Use provided pageToken if available (for next/prev page), otherwise start fresh
    const requestedPageToken = options.pageToken;

    try {
      const auth = getAuth()
      const idToken = await auth.currentUser?.getIdToken()
      
      if (!idToken) {
        throw new Error("Could not retrieve user token")
      }

      // Construct query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('limit', requestedPageSize.toString());
      if (requestedPageToken) {
          queryParams.append('pageToken', requestedPageToken);
      }
      if (options.search) {
          queryParams.append('search', options.search);
      }
      if (options.role) {
          queryParams.append('role', options.role);
      }
      if (options.status) {
          // Map UI status ('active'/'inactive') to API parameter (e.g., 'disabled=false'/'disabled=true')
          queryParams.append('disabled', options.status === 'inactive' ? 'true' : 'false');
      }

      // Make the API call
      const response = await $fetch<{ users: ApiUser[]; nextPageToken?: string; total?: number }>('/api/users/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        query: queryParams // Pass constructed query params
      })
      
      // Update state
      users.value = response.users;
      pagination.value.nextPageToken = response.nextPageToken || null;
      pagination.value.pageSize = requestedPageSize;
      // Update total if provided by API, otherwise keep null
      pagination.value.totalUsers = response.total ?? pagination.value.totalUsers;
      // Update current page number based on whether we used a token
      // This is a simplification; true page number tracking needs more logic if jumping pages
      pagination.value.currentPage = options.page ?? (requestedPageToken ? pagination.value.currentPage + 1 : 1);

    } catch (err: unknown) {
      console.error("Error fetching users:", err)
      error.value = getErrorMessage(err)
      
      if (error.value) {
        userStore.showToast(error.value, 'error')
      }
    } finally {
      loading.value = false
    }
  }

  // Toggle admin role for a user
  const toggleAdminRole = async (user: ApiUser) => {
    const auth = getAuth()
    
    // Prevent changing your own role or if already processing another user
    if (settingRoleUid.value || user.uid === auth.currentUser?.uid) {
      return
    }

    settingRoleUid.value = user.uid
    const newAdminStatus = !user.customClaims?.admin
    const rolePayload = { admin: newAdminStatus }

    try {
      const idToken = await auth.currentUser?.getIdToken()
      
      if (!idToken) {
        throw new Error("Could not retrieve user token")
      }

      await $fetch('/api/users/setRole', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: user.uid, role: rolePayload })
      })

      userStore.showToast(
        `Successfully ${newAdminStatus ? 'granted' : 'revoked'} admin role for ${user.email || user.uid}.`,
        'success'
      )
      
      // Refresh the CURRENT page after role change
      await fetchUsers({
          // Use current pagination state, but reset pageToken to fetch the current view again
          pageSize: pagination.value.pageSize,
          // We need a way to get the token for the *current* page, not just next.
          // Simplification: Refetch page 1 for now, or implement more complex page token storage.
          // Let's refetch the current view based on filters/search without page token for simplicity now.
           search: /* Need current search query */ '',
           role: /* Need current role filter */ '',
           status: /* Need current status filter */ '',
           // pageToken: pagination.value.currentPageToken // Need to store current page token
      });
    } catch (err: unknown) {
      console.error("Error setting user role:", err)
      userStore.showToast(getErrorMessage(err), 'error')
    } finally {
      settingRoleUid.value = null
    }
  }

  // Return state and methods
  return {
    users, // Current page of users
    loading,
    error,
    settingRoleUid,
    pagination, // Expose pagination state
    fetchUsers,
    toggleAdminRole,
    // Consider adding actions for changing page size, going to next/prev page
  }
})