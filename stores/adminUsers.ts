import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { useUserStore } from '~/stores/user'

// Define User interface based on API response
export interface ApiUser {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string
  disabled: boolean
  emailVerified: boolean
  customClaims?: { [key: string]: unknown }
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

export const useAdminUsersStore = defineStore('adminUsers', () => {
  // State
  const users = ref<ApiUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const settingRoleUid = ref<string | null>(null)
  
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

  // Fetch users from the API endpoint
  const fetchUsers = async () => {
    // Skip if not admin
    if (!userStore.isAdmin) {
      console.warn("AdminUsersStore: User is not an admin")
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const auth = getAuth()
      const idToken = await auth.currentUser?.getIdToken()
      
      if (!idToken) {
        throw new Error("Could not retrieve user token")
      }

      const response = await $fetch<{ users: ApiUser[] }>('/api/users/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      users.value = response.users
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
      
      // Refresh user list to show updated status
      await fetchUsers()
    } catch (err: unknown) {
      console.error("Error setting user role:", err)
      userStore.showToast(getErrorMessage(err), 'error')
    } finally {
      settingRoleUid.value = null
    }
  }

  // Return state and methods
  return {
    users,
    loading,
    error,
    settingRoleUid,
    fetchUsers,
    toggleAdminRole
  }
})