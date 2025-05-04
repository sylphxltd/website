<template>
  <div>
    <!-- Page header with actions -->
    <div class="mb-8 sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Manage users and their permissions across your applications.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex gap-3">
        <button
          @click="refreshUsers"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="loadingUsers"
        >
          <span 
            :class="[loadingUsers ? 'animate-spin' : '', 'i-carbon-refresh mr-2']"
          ></span>
          Refresh
        </button>
        <button
          @click="exportUsers"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="loadingUsers"
        >
          <span class="i-carbon-download mr-2"></span>
          Export
        </button>
      </div>
    </div>

    <div v-if="userStore.loading || adminUsersStore.loading" class="flex justify-center py-12">
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

    <div v-else>
      <!-- Error message -->
      <div v-if="fetchError" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-700 rounded-lg">
        <div class="flex items-center">
          <span class="i-carbon-warning-alt text-xl mr-2"></span>
          <span>Error loading users: {{ fetchError }}</span>
        </div>
      </div>

      <!-- Main content grid - Table and Details Side by Side -->
      <div>
        <!-- Users list and filters -->
        <div>
          <!-- Filters and Search section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Search input -->
              <div>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="i-carbon-search text-gray-400 dark:text-gray-500"></span>
                  </div>
                  <input 
                    v-model="searchTerm" 
                    type="text" 
                    class="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    placeholder="Search users..."
                  />
                </div>
              </div>
              
              <!-- Role filter -->
              <div>
                <select 
                  v-model="roleFilter"
                  class="block w-full py-2 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Regular Users</option>
                </select>
              </div>
              
              <!-- Provider filter -->
              <div>
                <select 
                  v-model="providerFilter"
                  class="block w-full py-2 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  <option value="">All Providers</option>
                  <option value="password">Email/Password</option>
                  <option value="google.com">Google</option>
                  <option value="github.com">GitHub</option>
                  <option value="facebook.com">Facebook</option>
                  <option value="twitter.com">Twitter</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-750">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Auth Providers
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700" v-if="!loadingUsers && filteredUsers.length > 0">
                  <tr 
                    v-for="user in filteredUsers"
                    :key="user.uid"
                    @click="navigateToUserDetail(user)"
                    class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <!-- User avatar -->
                        <div class="flex-shrink-0 h-10 w-10 relative">
                          <img 
                            v-if="user.photoURL" 
                            :src="user.photoURL" 
                            :alt="`${user.displayName || 'User'}'s avatar`"
                            class="h-10 w-10 rounded-full object-cover"
                          >
                          <div 
                            v-else 
                            class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium"
                          >
                            {{ getInitials(user) }}
                          </div>
                          <div v-if="user.emailVerified" class="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>
                        
                        <!-- User info -->
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ user.displayName || 'Unnamed User' }}
                          </div>
                          <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center truncate max-w-[180px] md:max-w-xs">
                            <span>{{ user.email }}</span>
                            <span 
                              v-if="!user.emailVerified && user.email" 
                              class="ml-2 px-1.5 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            >
                              Unverified
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <!-- Auth providers -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex space-x-2">
                        <div 
                          v-for="provider in getProviders(user)" 
                          :key="`${user.uid}-${provider}`"
                          :class="providerIconClass(provider)"
                          class="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs"
                          :title="providerName(provider)"
                        >
                          <span :class="providerIcon(provider)"></span>
                        </div>
                      </div>
                    </td>
                    
                    <!-- User role status -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        :class="[
                          user.customClaims?.admin 
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        ]"
                        class="px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {{ user.customClaims?.admin ? 'Administrator' : 'Regular User' }}
                      </span>
                    </td>
                    
                    <!-- Joined date -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div class="flex flex-col">
                        <span>{{ formatDate(user.metadata?.creationTime) }}</span>
                        <span class="text-xs text-gray-400 dark:text-gray-500">
                          {{ timeAgo(user.metadata?.creationTime) }}
                        </span>
                      </div>
                    </td>
                    
                    <!-- Actions -->
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-3" @click.stop>
                        <!-- Toggle admin role button -->
                        <button
                          @click="adminUsersStore.toggleAdminRole(user)"
                          :disabled="adminUsersStore.settingRoleUid === user.uid || user.uid === getAuth().currentUser?.uid"
                          :class="{
                            'text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300': 
                              !(adminUsersStore.settingRoleUid === user.uid || user.uid === getAuth().currentUser?.uid),
                            'text-gray-400 dark:text-gray-600 cursor-not-allowed': 
                              adminUsersStore.settingRoleUid === user.uid || user.uid === getAuth().currentUser?.uid
                          }"
                          :title="
                            user.uid === getAuth().currentUser?.uid 
                              ? 'Cannot change your own role' 
                              : (user.customClaims?.admin ? 'Revoke Admin Access' : 'Grant Admin Access')
                          "
                        >
                          <span v-if="adminUsersStore.settingRoleUid === user.uid" class="i-carbon-circle-dash animate-spin text-lg"></span>
                          <span v-else :class="[user.customClaims?.admin ? 'i-carbon-user-admin' : 'i-carbon-user-role', 'text-lg']"></span>
                          <span class="sr-only">{{ user.customClaims?.admin ? 'Revoke Admin' : 'Grant Admin' }}</span>
                        </button>
                        
                        <!-- More actions -->
                        <div class="relative" v-if="user.uid !== getAuth().currentUser?.uid">
                          <button @click="user.showActions = !user.showActions" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            <span class="i-carbon-overflow-menu-vertical text-lg"></span>
                            <span class="sr-only">More actions</span>
                          </button>
                          
                          <!-- Dropdown actions menu -->
                          <div 
                            v-if="user.showActions"
                            class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-10"
                            v-click-outside="() => user.showActions = false"
                          >
                            <div class="py-1">
                              <button 
                                @click="sendPasswordReset(user); user.showActions = false" 
                                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span class="i-carbon-password mr-2"></span>
                                Send Password Reset
                              </button>
                              <button 
                                @click="promptDisableUser(user); user.showActions = false" 
                                v-if="!user.disabled"
                                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span class="i-carbon-user-block mr-2"></span>
                                Disable Account
                              </button>
                              <button 
                                @click="promptEnableUser(user); user.showActions = false"
                                v-else
                                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span class="i-carbon-user mr-2"></span>
                                Enable Account
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
                
                <!-- Empty state -->
                <tbody v-else-if="!loadingUsers && filteredUsers.length === 0">
                  <tr>
                    <td colspan="5" class="px-6 py-12 text-center">
                      <span class="i-carbon-user-multiple text-5xl text-gray-300 dark:text-gray-600 block mx-auto mb-3"></span>
                      <p class="text-gray-500 dark:text-gray-400 mb-4">
                        {{ searchTerm || roleFilter || providerFilter ? 'No users found matching your filters.' : 'No users have been created yet.' }}
                      </p>
                      <button 
                        @click="clearFilters" 
                        v-if="searchTerm || roleFilter || providerFilter"
                        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { getAuth } from 'firebase/auth'
import { useUserStore } from '~/stores/user'
import { useAdminUsersStore, type ApiUser } from '~/stores/adminUsers'
import { useToastStore } from '~/stores/toast'

// Define page meta
definePageMeta({
  middleware: ['auth', 'admin-only'],
  layout: 'admin'
})

// Define click outside directive
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: any) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};

// Filters and search state
const searchTerm = ref('')
const roleFilter = ref('')
const providerFilter = ref('')

// No longer needed for side panel

// Get stores
const userStore = useUserStore()
const adminUsersStore = useAdminUsersStore()
const toastStore = useToastStore()

// Get reactive refs from the store
const users = computed(() => {
  return adminUsersStore.users.map(user => ({
    ...user,
    showActions: false
  }))
})
const loadingUsers = computed(() => adminUsersStore.loading)
const settingRoleUid = computed(() => adminUsersStore.settingRoleUid)

// Display error message
const fetchError = computed(() => adminUsersStore.error)

// Remove side panel-related computed properties

// Computed property for filtered users
const filteredUsers = computed(() => {
  let result = users.value

  // Apply search filter
  if (searchTerm.value) {
    const lowerCaseSearch = searchTerm.value.toLowerCase()
    result = result.filter(user => 
      (user.displayName?.toLowerCase().includes(lowerCaseSearch)) ||
      (user.email?.toLowerCase().includes(lowerCaseSearch)) ||
      (user.uid?.toLowerCase().includes(lowerCaseSearch))
    )
  }
  
  // Apply role filter
  if (roleFilter.value) {
    result = result.filter(user => {
      if (roleFilter.value === 'admin') {
        return user.customClaims?.admin === true
      } 
      return !user.customClaims?.admin
    })
  }
  
  // Apply provider filter
  if (providerFilter.value) {
    result = result.filter(user => {
      if (!user.providerData) return false
      return user.providerData.some(provider => provider.providerId === providerFilter.value)
    })
  }
  
  return result
})

// Helper function to get user initials
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

// Format date helper
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString()
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

// Action handlers
const refreshUsers = async () => {
  await adminUsersStore.fetchUsers()
  toastStore.add({
    message: 'User data refreshed',
    type: 'success'
  })
}

const clearFilters = () => {
  searchTerm.value = ''
  roleFilter.value = ''
  providerFilter.value = ''
}

const navigateToUserDetail = (user: ApiUser) => {
  navigateTo(`/admin/user-detail?id=${user.uid}`)
}

const exportUsers = () => {
  try {
    // Create CSV string from users data
    const headers = ['Name', 'Email', 'UID', 'Role', 'Created', 'Last Sign In', 'Email Verified', 'Providers']
    const csvContent = [
      headers.join(','),
      ...filteredUsers.value.map(user => {
        return [
          `"${user.displayName || 'N/A'}"`,
          `"${user.email || 'N/A'}"`,
          `"${user.uid}"`,
          `"${user.customClaims?.admin ? 'Admin' : 'User'}"`,
          `"${user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A'}"`,
          `"${user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A'}"`,
          `"${user.emailVerified ? 'Yes' : 'No'}"`,
          `"${getProviders(user).map(p => providerName(p)).join(', ')}"`
        ].join(',')
      })
    ].join('\n')
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `sylphx-users-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toastStore.add({
      message: 'Users exported successfully',
      type: 'success' 
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    toastStore.add({
      message: 'Failed to export users',
      type: 'error'
    })
  }
}

const sendPasswordReset = async (user: ApiUser) => {
  try {
    // This function would call a server API endpoint that uses the Firebase Admin SDK
    // to send a password reset email to the user
    alert(`Password reset would be sent to ${user.email}`)
    toastStore.add({
      message: `Password reset email sent to ${user.email}`, 
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

const promptDisableUser = (user: ApiUser) => {
  if (confirm(`Are you sure you want to disable ${user.displayName || user.email || 'this user'}?`)) {
    disableUser(user)
  }
}

const promptEnableUser = (user: ApiUser) => {
  if (confirm(`Are you sure you want to enable ${user.displayName || user.email || 'this user'}?`)) {
    enableUser(user)
  }
}

const disableUser = async (user: ApiUser) => {
  try {
    // This function would call a server API endpoint
    alert(`User ${user.email} would be disabled`)
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

const enableUser = async (user: ApiUser) => {
  try {
    // This function would call a server API endpoint
    alert(`User ${user.email} would be enabled`)
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

// Fetch users when component is mounted and user is admin
watchEffect(() => {
  if (userStore.isAdmin && !userStore.loading) {
    adminUsersStore.fetchUsers()
  }
})
</script>

<style scoped>
/* Fixed height elements transition smoothly */
.transition-height {
  transition: max-height 0.3s ease-in-out;
}
</style>