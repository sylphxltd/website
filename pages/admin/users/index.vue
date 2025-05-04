<template>
  <div>
    <!-- Page header with actions -->
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Manage user accounts and permissions.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button 
          @click="refreshUsers"
          class="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-refresh mr-1.5"></span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Filter and search section - Increased padding and margin -->
    <div class="mb-10 bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Search input -->
        <div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="i-carbon-search text-gray-400 dark:text-gray-500"></span>
            </div>
            <input 
              v-model="searchQuery" 
              type="text"
              class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="Search users..."
            />
          </div>
        </div>
        
        <!-- Role filter -->
        <div>
          <select
            v-model="roleFilter"
            class="block w-full py-2.5 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value="">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Regular Users</option>
          </select>
        </div>
        
        <!-- Status filter -->
        <div>
          <select
            v-model="statusFilter"
            class="block w-full py-2.5 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Users table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Auth Method
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <!-- Use users directly from the store (already filtered/paginated by API) -->
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700" v-if="!loading && users.length > 0">
            <tr v-for="user in users" :key="user.uid" class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div v-if="!user.photoURL" class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg font-medium">
                      {{ getInitials(user.displayName || user.email || 'User') }}
                    </div>
                    <img v-else :src="user.photoURL" :alt="`${user.displayName}'s avatar`" class="h-10 w-10 rounded-full">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.displayName || 'Unnamed User' }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    user.customClaims?.admin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                  ]"
                >
                  {{ user.customClaims?.admin ? 'Admin' : 'User' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    !user.disabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', // Use !user.disabled
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                  ]"
                >
                  {{ !user.disabled ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.metadata?.lastSignInTime) }} <!-- Access via metadata -->
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 <!-- Display multiple auth methods if available -->
                 <div class="flex flex-wrap gap-1">
                    <span
                      v-for="provider in user.providerData"
                      :key="provider.providerId"
                      :class="[
                        authMethodClass(provider.providerId),
                        'px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full'
                      ]"
                    >
                      {{ formatProviderId(provider.providerId) }}
                    </span>
                    <!-- Fallback if providerData is empty -->
                    <span
                      v-if="!user.providerData || user.providerData.length === 0"
                      :class="[
                        authMethodClass('password'), // Assume password if no providerData
                        'px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full'
                      ]"
                    >
                      Email/Password
                    </span>
                 </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-3">
                  <button 
                    :disabled="adminUsersStore.settingRoleUid === user.uid"
                    @click="toggleAdminRole(user)"
                    :class="[
                      user.customClaims?.admin ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300' : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300',
                      adminUsersStore.settingRoleUid === user.uid ? 'opacity-50 cursor-not-allowed' : ''
                    ]"
                  >
                    <!-- Show loading spinner if processing this user -->
                    <span v-if="adminUsersStore.settingRoleUid === user.uid" class="i-carbon-circle-dash w-4 h-4 animate-spin"></span>
                    <span v-else-if="user.customClaims?.admin" class="i-carbon-subtract-alt"></span>
                    <span v-else class="i-carbon-add-alt"></span>
                    <span class="sr-only">{{ user.customClaims?.admin ? 'Remove Admin' : 'Make Admin' }}</span>
                  </button>
                  <button 
                    @click="showUserDetails(user)"
                    class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                  >
                    <span class="i-carbon-view"></span>
                    <span class="sr-only">View {{ user.displayName }}</span>
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Empty state (handled separately below loading check) -->
          </tbody>
          
          <!-- Empty state (when not loading but no users) -->
          <tbody v-if="!loading && users.length === 0">
             <tr>
               <td colspan="6" class="px-6 py-12 text-center">
                 <span class="i-carbon-search text-5xl text-gray-300 dark:text-gray-600 block mx-auto mb-3"></span>
                 <p class="text-gray-500 dark:text-gray-400 mb-4">No users found matching your criteria.</p>
                <button 
                  @click="clearFilters"
                  class="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
              </td>
            </tr>
          </tbody>
          
          <!-- Loading skeleton -->
          <tbody v-if="loading" class="divide-y divide-gray-200 dark:divide-gray-700"> <!-- Corrected v-if/v-else -->
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div class="ml-4 space-y-2">
                    <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div class="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded float-right"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <!-- Mobile Pagination (Simplified) -->
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="previousPage"
            :disabled="!pagination || pagination.currentPage <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="nextPage"
            :disabled="!pagination || !pagination.nextPageToken"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <!-- Desktop Pagination -->
          <div>
            <p v-if="pagination" class="text-sm text-gray-700 dark:text-gray-300">
              Page <span class="font-medium">{{ pagination.currentPage }}</span>.
              Showing <span class="font-medium">{{ users.length }}</span> users
              <!-- Total results is tricky with Firebase listUsers -->
              <!-- <span v-if="pagination.totalUsers"> of <span class="font-medium">{{ pagination.totalUsers }}</span> results</span> -->
            </p>
          </div>
          <div v-if="pagination">
            <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="previousPage"
                :disabled="pagination.currentPage <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <span class="i-carbon-chevron-left"></span>
              </button>
              <!-- Page number display (simplified) -->
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ pagination.currentPage }}
              </span>
              <button
                @click="nextPage"
                :disabled="!pagination.nextPageToken"
                class="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <span class="i-carbon-chevron-right"></span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- User details modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 sm:p-6">
      <!-- Consider adding backdrop-blur-sm class here -->
      <div class="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-xl transform transition-all">
        <!-- Modal Header -->
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">User Details</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-500 focus:outline-none">
              <span class="i-carbon-close text-xl"></span>
            </button>
          </div>
        </div>
        
        <!-- Modal Body -->
        <div class="px-6 py-6">
          <div v-if="selectedUser" class="space-y-6">
            <div class="flex justify-center">
              <div class="relative">
                <div v-if="!selectedUser.photoURL" class="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-medium">
                  {{ getInitials(selectedUser.displayName || selectedUser.email || 'User') }}
                </div>
                <img v-else :src="selectedUser.photoURL" :alt="`${selectedUser.displayName}'s avatar`" class="h-20 w-20 rounded-full">
                <span 
                  :class="[
                    selectedUser.customClaims?.admin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                    'absolute bottom-0 right-0 px-2 py-1 text-xs leading-5 font-semibold rounded-full'
                  ]"
                >
                  {{ selectedUser.customClaims?.admin ? 'Admin' : 'User' }}
                </span>
              </div>
            </div>
            
            <div class="text-center">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">{{ selectedUser.displayName || 'Unnamed User' }}</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedUser.email }}</p>
            </div>
            
            <!-- Details Section -->
            <div class="pt-2">
              <dl class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white break-all">{{ selectedUser.uid }}</dd> <!-- Use uid -->
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Auth Method</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                     <span
                       v-for="provider in selectedUser.providerData"
                       :key="provider.providerId"
                       class="mr-1"
                     >
                       {{ formatProviderId(provider.providerId) }}
                     </span>
                     <span v-if="!selectedUser.providerData || selectedUser.providerData.length === 0">
                       Email/Password
                     </span>
                  </dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                    <span 
                      :class="[
                        !selectedUser.disabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                      ]"
                    >
                      {{ !selectedUser.disabled ? 'Active' : 'Inactive' }} <!-- Use disabled flag -->
                    </span>
                  </dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(selectedUser.metadata?.lastSignInTime) }}</dd> <!-- Access via metadata -->
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verified</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser.emailVerified ? 'Yes' : 'No' }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(selectedUser.metadata?.creationTime) }}</dd> <!-- Access via metadata -->
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="px-6 py-5 bg-gray-50 dark:bg-gray-850 rounded-b-xl flex justify-between items-center">
          <button
            @click="showModal = false"
            class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
          <button
            v-if="selectedUser"
            @click="toggleAdminRole(selectedUser)"
            :class="[
              selectedUser?.customClaims?.admin
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
              'inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2',
              adminUsersStore.settingRoleUid === selectedUser?.uid ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            :disabled="adminUsersStore.settingRoleUid === selectedUser?.uid"
          >
            <span v-if="adminUsersStore.settingRoleUid === selectedUser?.uid" class="i-carbon-circle-dash w-4 h-4 animate-spin mr-2"></span>
            {{ selectedUser?.customClaims?.admin ? 'Remove Admin Role' : 'Make Admin' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCurrentUser } from 'vuefire'; // Import useCurrentUser
import { useAdminUsersStore, type ApiUser as AdminUser } from '~/stores/adminUsers';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// --- Get stores & current user ---
const adminUsersStore = useAdminUsersStore();
const userStore = useUserStore(); // Keep for isAdmin check etc.
const toastStore = useToastStore();
const currentAuthUser = useCurrentUser(); // Get the currently authenticated user

// --- Local state ---
const searchQuery = ref<string>('');
const roleFilter = ref<'admin' | 'user' | ''>('');
const statusFilter = ref<'active' | 'inactive' | ''>(''); // UI state, maps to 'disabled'
const showModal = ref<boolean>(false);
const selectedUser = ref<AdminUser | null>(null);

// --- Store state refs ---
const loading = computed<boolean>(() => adminUsersStore.loading);
const users = computed<AdminUser[]>(() => adminUsersStore.users);
const pagination = computed(() => adminUsersStore.pagination);

// --- Helper functions ---
const getInitials = (name: string | undefined | null): string => { // Handle undefined/null name
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n?.[0] ?? '') // Add nullish coalescing for safety
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Type for Firebase Timestamp-like objects
type TimestampLike = {
  toDate: () => Date;
};

const formatDate = (timestamp: string | Date | TimestampLike | undefined | null): string => {
  if (!timestamp) return 'Never';

  let date: Date;
  try {
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp && typeof (timestamp as TimestampLike).toDate === 'function') {
      // Handle Firebase Timestamp objects (or similar)
      date = (timestamp as TimestampLike).toDate();
    } else {
      console.warn("Unsupported timestamp format:", timestamp);
      return 'Invalid Date';
    }

    // Check if date is valid after conversion using Number.isNaN
    if (Number.isNaN(date.getTime())) {
      console.warn("Failed to parse timestamp into valid date:", timestamp);
      return 'Invalid Date';
    }

    // Format the date
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  } catch (e) {
      console.error("Error formatting date:", e, "Input:", timestamp);
      return 'Format Error';
  }
};

const authMethodClass = (method: string | undefined | null): string => {
  // Default class if method is unknown or null/undefined
  const defaultClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  if (!method) return defaultClass;

  // Map provider IDs (Firebase standard) to classes
  const classes: Record<string, string> = {
    'google.com': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'facebook.com': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'apple.com': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', // Use apple.com
    'twitter.com': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300', // Use twitter.com
    'password': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', // Use 'password' for email/pass
    'emailLink': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', // Use 'emailLink' for magic link
    'github.com': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' // Use github.com
    // Add other providers as needed (e.g., phone)
  };
  
  // Find the class based on the provider ID in the method string (might contain multiple)
  const foundClass = Object.keys(classes).find(providerId => method.includes(providerId));
  
  return foundClass ? classes[foundClass] : defaultClass;
};

// Helper to format provider ID string for display
const formatProviderId = (providerId: string): string => {
    if (providerId === 'password') return 'Email/Password';
    if (providerId === 'emailLink') return 'Magic Link';
    if (providerId.endsWith('.com')) {
        // Capitalize first letter and remove '.com'
        return providerId.charAt(0).toUpperCase() + providerId.slice(1, -4);
    }
    return providerId; // Fallback
};


// --- Actions ---
const clearFilters = () => {
  searchQuery.value = '';
  roleFilter.value = '';
  statusFilter.value = '';
  // Refetch users with cleared filters (goes to page 1)
  fetchUsersWithFilters();
};

const showUserDetails = (user: AdminUser) => {
  selectedUser.value = user;
  showModal.value = true;
};

const toggleAdminRole = async (user: AdminUser | null) => {
  if (!user) return;
  
  // Prevent admin from removing their own role via this UI action
  if (currentAuthUser.value?.uid === user.uid && user.customClaims?.admin) { // Use currentAuthUser.value.uid
      toastStore.error("You cannot remove your own admin role.");
      return;
  }

  const currentIsAdmin = user.customClaims?.admin === true;
  const action = currentIsAdmin ? 'Removing' : 'Granting';
  const newRole = currentIsAdmin ? 'user' : 'admin';
  
  try {
    toastStore.info(`${action} admin role for ${user.email}...`);
    // Assuming setUserRole exists in the store and handles the API call
    await adminUsersStore.toggleAdminRole(user); // Use the existing store action if it handles API call + refresh
    // If toggleAdminRole doesn't exist or doesn't refresh, call API directly + refresh:
    // await adminUsersStore.setUserRoleAPI(user.uid, newRole); // Hypothetical API call function
    // await fetchUsersWithFilters(); // Refresh current view
    
    // Toast success is likely handled within toggleAdminRole now
    // toastStore.success(`Successfully ${newRole === 'admin' ? 'granted' : 'removed'} admin role for ${user.email}.`);
    
    // Update user in modal if open
    if (showModal.value && selectedUser.value?.uid === user.uid) { // Check uid
      // Find the updated user data from the store list
      const updatedUser = adminUsersStore.users.find(u => u.uid === user.uid); // Check uid
      if (updatedUser) {
          selectedUser.value = { ...updatedUser };
      } else {
          // If user somehow disappeared from list, close modal
          showModal.value = false;
          selectedUser.value = null;
      }
    }
  } catch (err: unknown) { // Use unknown type for catch block
    console.error('Error updating user role:', err);
    // Use the store's error formatting and display
    const formattedError = userStore.formatErrorMessage(err); // Assuming formatErrorMessage is accessible or move it to a util
    toastStore.error(`Failed to update role: ${formattedError}`);
  }
};

// --- Actions ---

// Function to fetch users based on current filters and page
const fetchUsersWithFilters = async (pageToken?: string) => {
  // Pass the status filter directly to the store action
  await adminUsersStore.fetchUsers({
    search: searchQuery.value,
    role: roleFilter.value,
    status: statusFilter.value, // Pass the status filter value
    pageToken: pageToken,
    // pageSize can be added if needed, defaults to store's default
  });
};

// Pagination Actions
const nextPage = () => {
  if (pagination.value?.nextPageToken) {
    fetchUsersWithFilters(pagination.value.nextPageToken);
  }
};

const previousPage = () => {
  // Firebase Admin SDK listUsers pagination is forward-only with page tokens.
  // Going "back" requires refetching from the beginning or implementing
  // more complex state management (e.g., storing previous page tokens).
  // For simplicity, going back will refetch the first page with current filters.
  toastStore.info("Going back resets to the first page with current filters.");
  fetchUsersWithFilters(); // Refetch first page
};

// Watch filters and trigger refetch
watch([searchQuery, roleFilter, statusFilter], () => {
    fetchUsersWithFilters();
});

// Refresh button action
const refreshUsers = () => { // No need for async here if fetchUsersWithFilters isn't async
  // Fetch page 1 with current filters
  fetchUsersWithFilters();
};

// Initial fetch on component mount (page 1, no filters)
onMounted(() => {
  fetchUsersWithFilters();
});
</script>