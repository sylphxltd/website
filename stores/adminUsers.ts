import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { useUserStore } from '~/stores/user'
// deepClone will be used by the composable
import { useOptimisticCrud, type OptimisticItemBase } from '~/composables/useOptimisticCrud';
import { getCurrentISOTimestamp } from '~/utils/optimisticUpdateHelpers';


// Define User interface based on API response, conforming to OptimisticItemBase
export interface ApiUser extends OptimisticItemBase { // OptimisticItemBase provides id, createdAt?, updatedAt?
  uid: string; // Keep uid as the primary identifier used by Firebase Auth
  // id will be an alias or managed by composable if itemIdKey is 'uid'
  email?: string;
  displayName?: string
  photoURL?: string;
  phoneNumber?: string; // Add phoneNumber
  disabled: boolean;
  emailVerified: boolean;
  customClaims?: { [key: string]: unknown };
  tenantId?: string | null; // Allow null for tenantId
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
  const fetchLoading = ref(false) // For fetchUsers and fetchUserById
  const fetchError = ref<string | null>(null)   // For fetchUsers and fetchUserById
  // settingRoleUid will be replaced by isLoadingUpdate from composable
  const pagination = ref<PaginationState>({ // Add pagination state
      currentPage: 1,
      pageSize: 10, // Default page size
      nextPageToken: null,
      totalUsers: null,
  })
  
  // Get dependencies
  const userStore = useUserStore()
  // const auth = getAuth(); // Removed: Will call getAuth() inside functions that need it
  
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

    fetchLoading.value = true
    fetchError.value = null
    
    // Determine page size and token for the request
    const requestedPageSize = options.pageSize ?? pagination.value.pageSize;
    // Use provided pageToken if available (for next/prev page), otherwise start fresh
    const requestedPageToken = options.pageToken;

    try {
      const auth = getAuth();
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
      fetchError.value = getErrorMessage(err)
      
      if (fetchError.value) {
        userStore.showToast(fetchError.value, 'error')
      }
    } finally {
      fetchLoading.value = false
    }
  }

  // --- CRUD Operations using Composable ---
  interface UserRoleUpdateDto {
    // DTO should reflect the part of ApiUser that is being updated.
    // In this case, it's the admin status within customClaims.
    customClaims: { admin: boolean };
  }
  // API returns void or simple success for setRole
  type SetRoleApiResponse = undefined;

  const _apiSetUserRole = async (uid: string, dto: UserRoleUpdateDto): Promise<SetRoleApiResponse> => {
    const auth = getAuth(); // Ensure auth is obtained here
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated for _apiSetUserRole");
    const idToken = await currentUser.getIdToken();
    if (!idToken) throw new Error("Could not retrieve user token for _apiSetUserRole");

    // The rolePayload sent to the API is { admin: boolean }
    const rolePayload = dto.customClaims;
    await $fetch('/api/users/setRole', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, role: rolePayload }),
    });
  };

  const _transformUserAfterRoleChange = (
    itemInState: ApiUser, // User object from users.value with optimistic claims
    _response: SetRoleApiResponse, // API response is void
  ): ApiUser => {
    return {
        ...itemInState,
        updatedAt: getCurrentISOTimestamp(), // Ensure updatedAt is fresh
    };
  };

  const {
    updateItem: updateUserRoleOptimistic,
    isLoadingUpdate,
    error: crudError,
  } = useOptimisticCrud<
    ApiUser,
    Record<string, never>, // TCreateDto (not used)
    UserRoleUpdateDto,
    unknown, // TApiCreateResponse (not used)
    SetRoleApiResponse
  >({
    itemsRef: users,
    apiCreate: async () => { throw new Error('Create not implemented for adminUsers store'); },
    apiUpdate: _apiSetUserRole,
    apiDelete: async () => { throw new Error('Delete not implemented for adminUsers store'); },
    transformUpdateResponse: _transformUserAfterRoleChange,
    itemIdKey: 'uid', // Firebase uses 'uid' as the identifier
  });


  const toggleAdminRole = async (user: ApiUser) => {
    const auth = getAuth();
    if (user.uid === auth.currentUser?.uid) {
      userStore.showToast("You cannot change your own role.", "warning");
      return;
    }

    const newAdminStatus = !user.customClaims?.admin;
    const dto: UserRoleUpdateDto = { customClaims: { admin: newAdminStatus } };
    
    const updatedUser = await updateUserRoleOptimistic(user.uid, dto);

    if (updatedUser) {
      userStore.showToast(
        `Successfully ${newAdminStatus ? 'granted' : 'revoked'} admin role for ${user.email || user.uid}.`,
        'success'
      );
    }
  };

  // Fetch a single user by ID
  const fetchUserById = async (userId: string): Promise<ApiUser | null> => {
      if (!userId || !userStore.isAdmin) return null;

      fetchLoading.value = true;
      fetchError.value = null;

      try {
          const auth = getAuth();
          const token = await auth.currentUser?.getIdToken();
          if (!token) {
              throw new Error("Could not retrieve user token");
          }
          const userData = await $fetch<ApiUser>(`/api/users/${userId}`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` },
          });

          const index = users.value.findIndex(u => u.uid === userId);
          if (index !== -1) {
              users.value[index] = { ...userData, id: userData.uid }; // Ensure 'id' for OptimisticItemBase
          }
          return { ...userData, id: userData.uid };
      } catch (err: unknown) {
          console.error(`Error fetching user ${userId}:`, err);
          fetchError.value = getErrorMessage(err);
          const toast = useToastStore();
          toast.error(fetchError.value || 'Failed to fetch user data.');
          return null;
      } finally {
          fetchLoading.value = false;
      }
  }

  // Return state and methods
  return {
    users,
    fetchLoading,
    fetchError,
    isLoadingUpdate, // For toggleAdminRole
    crudError,      // For toggleAdminRole errors
    pagination,
    fetchUsers,
    toggleAdminRole,
    fetchUserById,
  }
})