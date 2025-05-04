<template>
  <div>
    <!-- Page header with actions -->
    <div class="mb-8 sm:flex sm:items-center sm:justify-between">
      <div class="flex items-center">
        <NuxtLink 
          to="/admin/users" 
          class="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" 
          title="Back to users list"
        >
          <span class="i-carbon-arrow-left text-xl text-gray-500 dark:text-gray-400"></span>
        </NuxtLink>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">User Details</h1>
          <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
            View and manage user account information
          </p>
        </div>
      </div>
      
      <!-- Navigation controls -->
      <div class="mt-4 sm:mt-0 flex gap-3">
        <button
          @click="navigateToPrevUser"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="!prevUserId"
        >
          <span class="i-carbon-chevron-left mr-2"></span>
          Previous User
        </button>
        <button
          @click="navigateToNextUser"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="!nextUserId"
        >
          Next User
          <span class="i-carbon-chevron-right ml-2"></span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="flex flex-col items-center">
        <div class="h-12 w-12 rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading user data...</p>
      </div>
    </div>

    <div v-else-if="!userStore.isAuthenticated || !userStore.isAdmin" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <span class="i-carbon-locked text-6xl text-gray-400 dark:text-gray-500 mx-auto block mb-4"></span>
      <h2 class="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">You must be an administrator to view this page.</p>
      <NuxtLink 
        to="/" 
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span class="i-carbon-home mr-2"></span>
        Go to Home
      </NuxtLink>
    </div>

    <div v-else-if="error" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-red-200 dark:border-red-900">
      <div class="flex items-center text-red-500 dark:text-red-400 mb-4">
        <span class="i-carbon-warning-filled text-2xl mr-2"></span>
        <h3 class="text-lg font-medium">Error Loading User</h3>
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error }}</p>
      <div class="flex gap-4">
        <button 
          @click="tryAgain" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-restart mr-2"></span>
          Try Again
        </button>
        <NuxtLink 
          to="/admin/users" 
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-list mr-2"></span>
          Back to Users List
        </NuxtLink>
      </div>
    </div>
    
    <div v-else-if="!currentUser" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
      <span class="i-carbon-user-profile text-5xl text-gray-300 dark:text-gray-600 mx-auto block mb-4"></span>
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">User Not Found</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">The requested user could not be found.</p>
      <NuxtLink 
        to="/admin/users" 
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span class="i-carbon-list mr-2"></span>
        View All Users
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- User profile card -->
      <div class="md:col-span-1 order-2 md:order-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 sticky top-20">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex flex-col items-center mb-4">
              <!-- User avatar (larger) -->
              <div class="mb-4 relative">
                <img 
                  v-if="currentUser.photoURL" 
                  :src="currentUser.photoURL" 
                  :alt="`${currentUser.displayName || 'User'}'s avatar`"
                  class="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                >
                <div 
                  v-else 
                  class="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-4xl font-medium border-2 border-gray-200 dark:border-gray-700"
                >
                  {{ getInitials(currentUser) }}
                </div>
                <div v-if="currentUser.emailVerified" class="absolute bottom-0 right-0 h-6 w-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <span class="i-carbon-checkmark text-white text-xs"></span>
                </div>
              </div>
              
              <!-- User basic info -->
              <h4 class="text-xl font-semibold text-gray-900 dark:text-white text-center">
                {{ currentUser.displayName || 'Unnamed User' }}
              </h4>
              <div class="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
                {{ currentUser.email }}
                <span 
                  v-if="!currentUser.emailVerified && currentUser.email" 
                  class="ml-2 px-1.5 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                >
                  Unverified
                </span>
              </div>
              <div class="flex space-x-2 mb-2">
                <span
                  :class="[
                    currentUser.customClaims?.admin 
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  ]"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ currentUser.customClaims?.admin ? 'Administrator' : 'Regular User' }}
                </span>
                <span
                  :class="[
                    currentUser.disabled 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  ]"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ currentUser.disabled ? 'Disabled' : 'Active' }}
                </span>
              </div>
            </div>

            <!-- User ID -->
            <div class="w-full bg-gray-50 dark:bg-gray-750 py-2 px-3 rounded text-xs text-gray-500 dark:text-gray-400 truncate mb-4 text-center">
              <span class="i-carbon-id text-sm align-text-bottom mr-1"></span>
              {{ currentUser.uid }}
            </div>
          </div>
          
          <!-- Authentication methods -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Authentication Methods</h5>
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="provider in getProviders(currentUser)" 
                :key="`detail-${provider}`"
                class="flex items-center rounded-md bg-gray-50 dark:bg-gray-750 px-3 py-1.5"
              >
                <div 
                  :class="providerIconClass(provider)"
                  class="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs mr-2"
                >
                  <span :class="providerIcon(provider)"></span>
                </div>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ providerName(provider) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- User details sections -->
      <div class="md:col-span-2 order-1 md:order-2">
        <!-- Action bar -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div class="flex flex-wrap gap-3">
            <button 
              v-if="!isCurrentUser"
              @click="adminUsersStore.toggleAdminRole(currentUser)"
              :disabled="isTogglingAdmin"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span v-if="isTogglingAdmin" class="i-carbon-circle-dash animate-spin mr-2"></span>
              <span v-else :class="[currentUser.customClaims?.admin ? 'i-carbon-user-admin-remove' : 'i-carbon-user-admin', 'mr-2']"></span>
              {{ currentUser.customClaims?.admin ? 'Revoke Admin' : 'Make Admin' }}
            </button>
            
            <button 
              v-if="!isCurrentUser"
              @click="sendPasswordReset"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="i-carbon-password mr-2"></span>
              Reset Password
            </button>
            
            <button 
              v-if="!isCurrentUser && !currentUser.disabled"
              @click="promptDisableUser"
              class="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span class="i-carbon-user-block mr-2"></span>
              Disable Account
            </button>
            
            <button 
              v-if="!isCurrentUser && currentUser.disabled"
              @click="promptEnableUser"
              class="inline-flex items-center px-4 py-2 border border-green-300 dark:border-green-700 rounded-md shadow-sm text-sm font-medium text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span class="i-carbon-user mr-2"></span>
              Enable Account
            </button>
          </div>
        </div>
        
        <!-- Account information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Contact Info -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span class="i-carbon-email mr-2 text-gray-400 dark:text-gray-500"></span>
              Contact Information
            </h3>
            
            <div class="space-y-4">
              <div>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</div>
                <div class="mt-1 text-gray-900 dark:text-white flex items-center">
                  {{ currentUser.email || 'Not provided' }}
                  <span 
                    v-if="currentUser.emailVerified && currentUser.email" 
                    class="ml-2 text-xs text-green-600 dark:text-green-400 flex items-center"
                  >
                    <span class="i-carbon-checkmark-filled mr-1"></span>
                    Verified
                  </span>
                </div>
              </div>
              
              <div>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</div>
                <div class="mt-1 text-gray-900 dark:text-white">
                  {{ currentUser.phoneNumber || 'Not provided' }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Account Details -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span class="i-carbon-user-profile mr-2 text-gray-400 dark:text-gray-500"></span>
              Account History
            </h3>
            
            <div class="space-y-4">
              <div>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Created</div>
                <div class="mt-1 text-gray-900 dark:text-white">
                  {{ formatDetailedDate(currentUser.metadata?.creationTime) }}
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ timeAgo(currentUser.metadata?.creationTime) }}
                  </div>
                </div>
              </div>
              
              <div>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Sign In</div>
                <div class="mt-1 text-gray-900 dark:text-white">
                  {{ formatDetailedDate(currentUser.metadata?.lastSignInTime) }}
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ timeAgo(currentUser.metadata?.lastSignInTime) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Custom Data -->
          <div 
            v-if="hasCustomClaims || currentUser.tenantId"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:col-span-2"
          >
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span class="i-carbon-data-enrichment mr-2 text-gray-400 dark:text-gray-500"></span>
              Custom Data
            </h3>
            
            <div class="space-y-4">
              <div v-if="currentUser.tenantId">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Tenant ID</div>
                <div class="mt-1 text-gray-900 dark:text-white">
                  {{ currentUser.tenantId }}
                </div>
              </div>
              
              <div v-if="hasCustomClaims">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Custom Claims</div>
                <div class="mt-1">
                  <pre class="text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-750 p-3 rounded overflow-auto max-h-64">{{ JSON.stringify(customClaimsForDisplay, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { useUserStore } from '~/stores/user'
import { useAdminUsersStore, type ApiUser } from '~/stores/adminUsers'
import { useToastStore } from '~/stores/toast'

// Define page meta
definePageMeta({
  middleware: ['auth', 'admin-only'],
  layout: 'admin'
})

// Router and route
const route = useRoute()
const router = useRouter()

// Get stores
const userStore = useUserStore()
const adminUsersStore = useAdminUsersStore()
const toastStore = useToastStore()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const currentUser = ref<ApiUser | null>(null)

// Computed properties
const userId = computed(() => route.query.id?.toString() || '')

const isCurrentUser = computed(() => {
  return currentUser.value?.uid === getAuth().currentUser?.uid
})

const isTogglingAdmin = computed(() => {
  return adminUsersStore.settingRoleUid === currentUser.value?.uid
})

const hasCustomClaims = computed(() => {
  if (!currentUser.value?.customClaims) return false
  const claims = { ...currentUser.value.customClaims }
  delete claims.admin // Don't show admin flag in custom claims
  return Object.keys(claims).length > 0
})

const customClaimsForDisplay = computed(() => {
  if (!currentUser.value?.customClaims) return {}
  return currentUser.value.customClaims
})

// Navigation between users
const usersList = computed(() => adminUsersStore.users || [])

const currentUserIndex = computed(() => {
  if (!currentUser.value) return -1
  return usersList.value.findIndex(user => user.uid === currentUser.value?.uid)
})

const prevUserId = computed(() => {
  if (currentUserIndex.value <= 0) return null
  return usersList.value[currentUserIndex.value - 1]?.uid
})

const nextUserId = computed(() => {
  if (currentUserIndex.value === -1 || currentUserIndex.value >= usersList.value.length - 1) return null
  return usersList.value[currentUserIndex.value + 1]?.uid
})

// Helper functions
const getInitials = (user: any) => {
  if (user.displayName) {
    return user.displayName
      .split(' ')
      .map((name: string) => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  if (user.email) {
    return user.email.charAt(0).toUpperCase()
  }
  
  return 'U'
}

// Helper function to get user providers
const getProviders = (user: any) => {
  if (!user.providerData || user.providerData.length === 0) return ['unknown']
  return [...new Set(user.providerData.map((provider: any) => provider.providerId))]
}

// Provider icon helper
const providerIcon = (provider: string) => {
  const icons: Record<string, string> = {
    'password': 'i-carbon-email',
    'google.com': 'i-carbon-logo-google',
    'github.com': 'i-carbon-logo-github',
    'facebook.com': 'i-carbon-logo-facebook',
    'twitter.com': 'i-carbon-logo-twitter',
    'microsoft.com': 'i-carbon-logo-microsoft',
    'apple.com': 'i-carbon-logo-apple',
    'yahoo.com': 'i-carbon-logo-yahoo',
    'phone': 'i-carbon-phone',
    'anonymous': 'i-carbon-user-anonymous',
    'unknown': 'i-carbon-unknown'
  }
  
  return icons[provider] || 'i-carbon-unknown'
}

// Provider name helper
const providerName = (provider: string) => {
  const names: Record<string, string> = {
    'password': 'Email/Password',
    'google.com': 'Google',
    'github.com': 'GitHub',
    'facebook.com': 'Facebook',
    'twitter.com': 'Twitter',
    'microsoft.com': 'Microsoft',
    'apple.com': 'Apple',
    'yahoo.com': 'Yahoo',
    'phone': 'Phone',
    'anonymous': 'Anonymous',
    'unknown': 'Unknown'
  }
  
  return names[provider] || 'Unknown Provider'
}

// Provider icon background color
const providerIconClass = (provider: string) => {
  const classes: Record<string, string> = {
    'password': 'bg-blue-600',
    'google.com': 'bg-red-600',
    'github.com': 'bg-gray-800 dark:bg-gray-600',
    'facebook.com': 'bg-blue-800',
    'twitter.com': 'bg-blue-400',
    'microsoft.com': 'bg-blue-700',
    'apple.com': 'bg-gray-800 dark:bg-gray-600',
    'yahoo.com': 'bg-purple-600',
    'phone': 'bg-green-600',
    'anonymous': 'bg-gray-500',
    'unknown': 'bg-gray-400'
  }
  
  return classes[provider] || 'bg-gray-400'
}

// Format detailed date helper
const formatDetailedDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// Time ago helper
const timeAgo = (dateString: string | undefined) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffMonth / 12)
  
  if (diffYear > 0) {
    return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`
  }
  
  if (diffMonth > 0) {
    return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`
  }
  
  if (diffDay > 0) {
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
  }
  
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`
  }
  
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  }
  
  return 'Just now'
}

// Actions
const fetchUserData = async () => {
  if (!userId.value) {
    error.value = 'No user ID provided'
    loading.value = false
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // If users aren't loaded yet, fetch them
    if (!adminUsersStore.users.length) {
      await adminUsersStore.fetchUsers()
    }
    
    // Find the user by ID
    const user = adminUsersStore.users.find(u => u.uid === userId.value)
    
    if (user) {
      currentUser.value = user
    } else {
      error.value = 'User not found'
    }
  } catch (err) {
    console.error('Error fetching user:', err)
    error.value = 'Failed to load user data'
  } finally {
    loading.value = false
  }
}

const tryAgain = () => {
  fetchUserData()
}

const navigateToPrevUser = () => {
  if (prevUserId.value) {
    router.push(`/admin/user-detail?id=${prevUserId.value}`)
  }
}

const navigateToNextUser = () => {
  if (nextUserId.value) {
    router.push(`/admin/user-detail?id=${nextUserId.value}`)
  }
}

const sendPasswordReset = async () => {
  if (!currentUser.value || !currentUser.value.email) return
  
  try {
    // This would call a server API endpoint
    alert(`Password reset would be sent to ${currentUser.value.email}`)
    toastStore.add({
      message: `Password reset email sent to ${currentUser.value.email}`,
      type: 'success'
    })
  } catch (error) {
    console.error('Error sending password reset:', error)
    toastStore.add({
      message: 'Failed to send password reset email',
      type: 'error'
    })
  }
}

const promptDisableUser = () => {
  if (!currentUser.value) return
  
  if (confirm(`Are you sure you want to disable ${currentUser.value.displayName || currentUser.value.email || 'this user'}?`)) {
    disableUser()
  }
}

const promptEnableUser = () => {
  if (!currentUser.value) return
  
  if (confirm(`Are you sure you want to enable ${currentUser.value.displayName || currentUser.value.email || 'this user'}?`)) {
    enableUser()
  }
}

const disableUser = async () => {
  if (!currentUser.value) return
  
  try {
    // This function would call a server API endpoint
    alert(`User ${currentUser.value.email} would be disabled`)
    // Manually update the local user object for demo purposes
    currentUser.value = { ...currentUser.value, disabled: true }
    toastStore.add({
      message: 'User account disabled',
      type: 'success'
    })
  } catch (error) {
    console.error('Error disabling user:', error)
    toastStore.add({
      message: 'Failed to disable user account', 
      type: 'error'
    })
  }
}

const enableUser = async () => {
  if (!currentUser.value) return
  
  try {
    // This function would call a server API endpoint
    alert(`User ${currentUser.value.email} would be enabled`)
    // Manually update the local user object for demo purposes
    currentUser.value = { ...currentUser.value, disabled: false }
    toastStore.add({
      message: 'User account enabled',
      type: 'success'
    })
  } catch (error) {
    console.error('Error enabling user:', error)
    toastStore.add({
      message: 'Failed to enable user account',
      type: 'error'
    })
  }
}

// Initial data loading
onMounted(() => {
  fetchUserData()
})

// Watch for changes to the user ID
watch(userId, () => {
  fetchUserData()
})

// Watch for changes to the adminUsersStore.users array
// This helps keep our currentUser in sync with any changes made from the store
watch(() => adminUsersStore.users, () => {
  if (currentUser.value && userId.value) {
    const updatedUser = adminUsersStore.users.find(u => u.uid === userId.value)
    if (updatedUser) {
      currentUser.value = updatedUser
    }
  }
}, { deep: true })
</script>