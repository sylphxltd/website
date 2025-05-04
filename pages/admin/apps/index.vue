<template>
  <div>
    <!-- Page header with actions -->
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Applications</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Manage all your applications in one place.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex gap-3">
        <NuxtLink 
          to="/apps/new"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-add mr-2"></span>
          New Application
        </NuxtLink>
        <button 
          @click="openImportModal"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-upload mr-2"></span>
          Import
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
              placeholder="Search applications..."
            />
          </div>
        </div>
        
        <!-- Platform filter -->
        <div>
          <select 
            v-model="platformFilter"
            class="block w-full py-2 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value="">All Platforms</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
            <option value="web">Web</option>
            <option value="desktop">Desktop</option>
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
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Applications table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-750">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Application
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Platform
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Updated
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Downloads
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700" v-if="!loading">
            <tr v-for="app in filteredApps" :key="app.id" class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div 
                      v-if="!app.logoUrl" 
                      :class="[
                        'h-10 w-10 rounded-md flex items-center justify-center text-white',
                        app.gradientClass || 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      ]"
                    >
                      {{ app.name.charAt(0) }}
                    </div>
                    <img v-else :src="app.logoUrl" :alt="app.name" class="h-10 w-10 rounded-md">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ app.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ app.appId || 'com.sylphx.' + app.id }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-1">
                  <span
                    v-for="platform in app.platforms"
                    :key="platform"
                    :class="[
                      platformBadgeClass(platform),
                      'px-2 py-1 rounded-full text-xs'
                    ]"
                  >
                    {{ platform }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    statusBadgeClass(app.status),
                    'px-2 py-1 rounded-full text-xs'
                  ]"
                >
                  {{ app.status.charAt(0).toUpperCase() + app.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(app.updatedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ app.downloads?.toLocaleString() || '0' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="i-carbon-star-filled text-amber-500 mr-1 text-sm"></span>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ app.rating || '0.0' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button 
                    @click="editApp(app)" 
                    class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                  >
                    <span class="i-carbon-edit"></span>
                    <span class="sr-only">Edit {{ app.name }}</span>
                  </button>
                  <button 
                    @click="viewStats(app)" 
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    <span class="i-carbon-chart-line"></span>
                    <span class="sr-only">Stats for {{ app.name }}</span>
                  </button>
                  <button 
                    @click="showDeleteConfirm(app)" 
                    class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  >
                    <span class="i-carbon-trash-can"></span>
                    <span class="sr-only">Delete {{ app.name }}</span>
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Empty state -->
            <tr v-if="filteredApps.length === 0">
              <td colspan="7" class="px-6 py-12 text-center">
                <span class="i-carbon-no-image text-5xl text-gray-300 dark:text-gray-600 block mx-auto mb-3"></span>
                <p class="text-gray-500 dark:text-gray-400 mb-4">No applications found matching your filters.</p>
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
                <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              Showing <span class="font-medium">1</span> to <span class="font-medium">{{ Math.min(filteredApps.length, 10) }}</span> of <span class="font-medium">{{ filteredApps.length }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <span class="sr-only">Previous</span>
                <span class="i-carbon-chevron-left"></span>
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                1
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/30 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                2
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                3
              </button>
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                ...
              </span>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                8
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAppsStore } from '~/stores/apps';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Get real apps data from the store
const appsStore = useAppsStore();
const loading = ref(false);
const apps = computed(() => appsStore.apps);

// Add platform information based on links
const appsWithPlatforms = computed(() => {
  return apps.value.map(app => {
    // Extract platforms from app links
    const platforms = [];
    const links = app.links || {};
    
    if (links.appStore) platforms.push('iOS');
    if (links.googlePlay) platforms.push('Android');
    if (links.web) platforms.push('Web');
    if (links.github) platforms.push('GitHub');
    if (links.npm) platforms.push('NPM');
    if (links.windows) platforms.push('Windows');
    if (links.mac) platforms.push('macOS');
    if (links.linux) platforms.push('Linux');
    
    // Default platform if none detected
    if (platforms.length === 0) platforms.push('Web');
    
    // Generate a status based on app fields (this would come from real data in a real app)
    const status = app.isArchived ? 'archived' : app.isDraft ? 'draft' : 'active';
    
    // Generate a gradient class based on app name (just for visual variety)
    const nameHash = hashString(app.name);
    const gradientClasses = [
      'bg-gradient-to-br from-blue-500 to-indigo-600',
      'bg-gradient-to-br from-purple-500 to-pink-600',
      'bg-gradient-to-br from-green-500 to-teal-600',
      'bg-gradient-to-br from-indigo-500 to-blue-600',
      'bg-gradient-to-br from-amber-500 to-orange-600',
      'bg-gradient-to-br from-gray-700 to-gray-900',
      'bg-gradient-to-br from-red-500 to-pink-600'
    ];
    const gradientClass = gradientClasses[nameHash % gradientClasses.length];
    
    // Generate download count and rating for UI (would come from analytics in real app)
    const downloads = (nameHash % 9 + 1) * 10000 + (nameHash % 100) * 100;
    const rating = 3.5 + (nameHash % 25) / 10; // Rating between 3.5 and 6.0
    
    return {
      ...app,
      platforms,
      status,
      gradientClass,
      downloads,
      rating: rating > 5 ? 5 : rating, // Cap at 5
      updatedAt: app.updatedAt ? new Date(app.updatedAt) : new Date()
    };
  });
});

// Simple hash function to generate consistent numbers from strings
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Filter states
const searchQuery = ref('');
const platformFilter = ref('');
const statusFilter = ref('');

// Computed filtered apps
const filteredApps = computed(() => {
  let result = appsWithPlatforms.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(app => 
      app.name.toLowerCase().includes(query) || 
      app.id.toLowerCase().includes(query)
    );
  }
  
  // Apply platform filter
  if (platformFilter.value) {
    const platform = platformFilter.value.toLowerCase();
    result = result.filter(app => 
      app.platforms.some(p => p.toLowerCase() === platform)
    );
  }
  
  // Apply status filter
  if (statusFilter.value) {
    result = result.filter(app => app.status === statusFilter.value);
  }
  
  return result;
});

// Helper functions
const formatDate = (date) => {
  if (!date) return 'Unknown';
  
  // Format date as 'Apr 15, 2025'
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
};

const platformBadgeClass = (platform) => {
  const platformMap = {
    'iOS': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'Android': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    'Web': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    'PC': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'Console': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    'macOS': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'Windows': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'Linux': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    'Oculus': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'SteamVR': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'GitHub': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'NPM': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
  };
  
  return platformMap[platform] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const statusBadgeClass = (status) => {
  const statusMap = {
    'active': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    'draft': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    'archived': 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

// Action handlers
const clearFilters = () => {
  searchQuery.value = '';
  platformFilter.value = '';
  statusFilter.value = '';
};

const editApp = (app) => {
  // Navigate to edit page
  navigateTo(`/apps/${app.id}/edit`);
};

const viewStats = (app) => {
  // Navigate to stats page
  navigateTo(`/admin/apps/${app.id}/stats`);
};

const showDeleteConfirm = (app) => {
  if (confirm(`Are you sure you want to delete ${app.name}?`)) {
    deleteApp(app);
  }
};

const deleteApp = async (app) => {
  try {
    await appsStore.deleteApp(app.id);
    alert(`${app.name} has been deleted`);
  } catch (error) {
    console.error('Error deleting app:', error);
    alert('Failed to delete app. Please try again.');
  }
};

const openImportModal = () => {
  alert('Import functionality coming soon');
};

// Initialize data
onMounted(async () => {
  loading.value = true;
  await appsStore.fetchApps();
  loading.value = false;
});
</script>