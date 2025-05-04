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
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-refresh mr-2"></span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Filter and search section -->
    <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search input -->
        <div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="i-carbon-search text-gray-400 dark:text-gray-500"></span>
            </div>
            <input 
              v-model="searchQuery" 
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
        
        <!-- Status filter -->
        <div>
          <select 
            v-model="statusFilter"
            class="block w-full py-2 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Users table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
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
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700" v-if="!loading">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
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
                    user.isAdmin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                  ]"
                >
                  {{ user.isAdmin ? 'Admin' : 'User' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    user.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                  ]"
                >
                  {{ user.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.lastLogin) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span 
                  :class="[
                    authMethodClass(user.authMethod),
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                  ]"
                >
                  {{ user.authMethod || 'Email/Password' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-3">
                  <button 
                    @click="toggleAdminRole(user)"
                    :class="[
                      user.isAdmin ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300' : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                    ]"
                  >
                    <span v-if="user.isAdmin" class="i-carbon-subtract-alt"></span>
                    <span v-else class="i-carbon-add-alt"></span>
                    <span class="sr-only">{{ user.isAdmin ? 'Remove Admin' : 'Make Admin' }}</span>
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
            
            <!-- Empty state -->
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="px-6 py-12 text-center">
                <span class="i-carbon-user-profile-alt text-5xl text-gray-300 dark:text-gray-600 block mx-auto mb-3"></span>
                <p class="text-gray-500 dark:text-gray-400 mb-4">No users found matching your filters.</p>
                <button 
                  @click="clearFilters" 
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
              </td>
            </tr>
          </tbody>
          
          <!-- Loading skeleton -->
          <tbody v-else class="divide-y divide-gray-200 dark:divide-gray-700">
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
        <div class="flex-1 flex justify-between sm:hidden">
          <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            Previous
          </button>
          <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Showing <span class="font-medium">1</span> to <span class="font-medium">{{ Math.min(filteredUsers.length, 10) }}</span> of <span class="font-medium">{{ filteredUsers.length }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <span class="sr-only">Previous</span>
                <span class="i-carbon-chevron-left"></span>
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/30 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                1
              </button>
              <button v-if="allUsers.length > 10" class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                2
              </button>
              <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <span class="sr-only">Next</span>
                <span class="i-carbon-chevron-right"></span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- User details modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl transform transition-all">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">User Details</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-500 focus:outline-none">
              <span class="i-carbon-close text-xl"></span>
            </button>
          </div>
        </div>
        
        <div class="px-6 py-4">
          <div v-if="selectedUser" class="space-y-4">
            <div class="flex justify-center">
              <div class="relative">
                <div v-if="!selectedUser.photoURL" class="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-medium">
                  {{ getInitials(selectedUser.displayName || selectedUser.email || 'User') }}
                </div>
                <img v-else :src="selectedUser.photoURL" :alt="`${selectedUser.displayName}'s avatar`" class="h-20 w-20 rounded-full">
                <span 
                  :class="[
                    selectedUser.isAdmin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                    'absolute bottom-0 right-0 px-2 py-1 text-xs leading-5 font-semibold rounded-full'
                  ]"
                >
                  {{ selectedUser.isAdmin ? 'Admin' : 'User' }}
                </span>
              </div>
            </div>
            
            <div class="text-center">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">{{ selectedUser.displayName || 'Unnamed User' }}</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedUser.email }}</p>
            </div>
            
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white break-all">{{ selectedUser.id }}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Auth Method</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser.authMethod || 'Email/Password' }}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                    <span 
                      :class="[
                        selectedUser.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                      ]"
                    >
                      {{ selectedUser.active ? 'Active' : 'Inactive' }}
                    </span>
                  </dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(selectedUser.lastLogin) }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verified</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser.emailVerified ? 'Yes' : 'No' }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(selectedUser.createdAt) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button 
            @click="showModal = false" 
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
          <button 
            v-if="selectedUser"
            @click="toggleAdminRole(selectedUser)"
            :class="[
              selectedUser?.isAdmin 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
              'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2'
            ]"
          >
            {{ selectedUser?.isAdmin ? 'Remove Admin Role' : 'Make Admin' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminUsersStore } from '~/stores/adminUsers';
import { useUserStore } from '~/stores/user';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Get stores
const adminUsersStore = useAdminUsersStore();
const userStore = useUserStore();

// Set up local state
const searchQuery = ref('');
const roleFilter = ref('');
const statusFilter = ref('');
const showModal = ref(false);
const selectedUser = ref(null);

// Fetch users data
const loading = computed(() => adminUsersStore.loading);
const allUsers = computed(() => adminUsersStore.users);

// Filtered users based on search and filters
const filteredUsers = computed(() => {
  let result = allUsers.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(user => 
      (user.displayName?.toLowerCase().includes(query) || false) || 
      user.email.toLowerCase().includes(query)
    );
  }
  
  // Apply role filter
  if (roleFilter.value === 'admin') {
    result = result.filter(user => user.isAdmin);
  } else if (roleFilter.value === 'user') {
    result = result.filter(user => !user.isAdmin);
  }
  
  // Apply status filter
  if (statusFilter.value === 'active') {
    result = result.filter(user => user.active);
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(user => !user.active);
  }
  
  return result;
});

// Helper functions
const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Never';
  
  // If it's a string, convert to Date object
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate();
  
  // Format the date
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

const authMethodClass = (method) => {
  const classes = {
    'Google': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'Facebook': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Apple': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    'Twitter': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    'Email/Password': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Magic Link': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'GitHub': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  };
  
  return classes[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const clearFilters = () => {
  searchQuery.value = '';
  roleFilter.value = '';
  statusFilter.value = '';
};

const showUserDetails = (user) => {
  selectedUser.value = user;
  showModal.value = true;
};

const toggleAdminRole = async (user) => {
  if (!user) return;
  
  try {
    const newRole = user.isAdmin ? 'user' : 'admin';
    await adminUsersStore.setUserRole(user.id, newRole);
    
    if (showModal.value) {
      // Update the selected user in the modal
      selectedUser.value = adminUsersStore.users.find(u => u.id === user.id);
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};

const refreshUsers = async () => {
  await adminUsersStore.fetchUsers();
};

// Fetch users on component mount
onMounted(async () => {
  await adminUsersStore.fetchUsers();
});
</script>