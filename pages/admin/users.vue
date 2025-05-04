<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">User Management</h1>

    <div v-if="userStore.loading || adminUsersStore.loading" class="text-center py-10">
      <p>Loading data...</p>
      <!-- Add a spinner or loading indicator here -->
    </div>

    <div v-else-if="!userStore.isAuthenticated || !userStore.isAdmin" class="text-center py-10">
      <p class="text-red-500">Access Denied. You must be an administrator to view this page.</p>
      <NuxtLink to="/" class="text-blue-500 hover:underline">Go to Home</NuxtLink>
    </div>

    <div v-else>
      <div v-if="fetchError" class="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
        Error loading users: {{ fetchError }}
      </div>

      <!-- Search Input -->
      <div class="mb-4">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Search by name or email..."
          class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                UID
              </th>
               <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Provider
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Sign In
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Admin Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <!-- Use filteredUsers instead of users -->
            <tr v-for="user in filteredUsers" :key="user.uid">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img v-if="user.photoURL" class="h-10 w-10 rounded-full" :src="user.photoURL" alt="User avatar">
                     <span v-else class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                       {{ (user.displayName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase() }}
                     </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.displayName || 'N/A' }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ user.uid }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 <!-- Display first provider ID -->
                 {{ user.providerData?.[0]?.providerId || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 {{ user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 {{ user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="user.customClaims?.admin ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ user.customClaims?.admin ? 'Admin' : 'User' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="adminUsersStore.toggleAdminRole(user)"
                  :disabled="adminUsersStore.settingRoleUid === user.uid || user.uid === getAuth().currentUser?.uid"
                  :class="{
                    'opacity-50 cursor-not-allowed': user.uid === getAuth().currentUser?.uid,
                    'hover:text-indigo-900 dark:hover:text-indigo-300': user.uid !== getAuth().currentUser?.uid
                  }"
                  class="text-indigo-600 dark:text-indigo-400 disabled:text-gray-400 dark:disabled:text-gray-500"
                  :title="user.uid === getAuth().currentUser?.uid ? 'Cannot change your own role' : (user.customClaims?.admin ? 'Revoke Admin' : 'Grant Admin')"
                >
                  <span v-if="adminUsersStore.settingRoleUid === user.uid">Updating...</span>
                  <span v-else>{{ user.customClaims?.admin ? 'Revoke Admin' : 'Grant Admin' }}</span>
                </button>
              </td>
            </tr>
             <!-- Update empty state check with correct colspan -->
             <tr v-if="filteredUsers.length === 0 && !loadingUsers">
                <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {{ searchTerm ? 'No users match your search.' : 'No users found.' }}
                </td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue' // Import ref
import { getAuth } from 'firebase/auth'
import { useUserStore } from '~/stores/user'
import { useAdminUsersStore, type ApiUser } from '~/stores/adminUsers'

definePageMeta({
  middleware: ['auth', 'admin-only'] // Use standard admin-only middleware
  // roles: ['admin'] // Remove custom roles metadata if admin-only handles it
})

// Search term state
const searchTerm = ref('')

// Get stores
const userStore = useUserStore()
const adminUsersStore = useAdminUsersStore()

// Get reactive refs from the store
const users = computed(() => adminUsersStore.users)
const loadingUsers = computed(() => adminUsersStore.loading)
const settingRoleUid = computed(() => adminUsersStore.settingRoleUid)

// Display error message
const fetchError = computed(() => adminUsersStore.error)

// Computed property for filtered users
const filteredUsers = computed(() => {
  if (!searchTerm.value) {
    return users.value // Return all users if search term is empty
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase()
  return users.value.filter(user =>
    (user.displayName?.toLowerCase().includes(lowerCaseSearch)) ||
    (user.email?.toLowerCase().includes(lowerCaseSearch))
  )
})

// Fetch users when component is mounted and user is admin
watchEffect(() => {
  if (userStore.isAdmin && !userStore.loading) {
    adminUsersStore.fetchUsers()
  }
})

</script>

<style scoped>
/* Add any page-specific styles here */
</style>