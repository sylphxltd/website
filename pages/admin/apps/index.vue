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
          to="/admin/apps/create"
          class="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-add mr-1.5"></span>
          New Application
        </NuxtLink>
        <button
          @click="openImportModal"
          class="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-upload mr-1.5"></span>
          Import
        </button>
      </div>
    </div>

    <!-- Filter and search section -->
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
              placeholder="Search applications..."
            />
          </div>
        </div>

        <!-- Platform filter -->
        <div>
          <select
            v-model="platformFilter"
            class="block w-full py-2.5 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value="">All Platforms</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
            <option value="web">Web</option>
            <option value="windows">Windows</option>
            <option value="macos">macOS</option>
            <option value="linux">Linux</option>
            <option value="github">GitHub</option>
            <option value="npm">NPM</option>
            <!-- Add other platforms as needed -->
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
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Applications table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
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
           <!-- Table Body: Display apps or loading/empty states -->
           <tbody class="divide-y divide-gray-200 dark:divide-gray-700" v-if="!loading && apps.length > 0">
             <tr v-for="app in apps" :key="app.id" class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
               <td class="px-6 py-4 whitespace-nowrap">
                 <div class="flex items-center">
                   <div class="flex-shrink-0 h-10 w-10">
                     <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.name" class="h-10 w-10 rounded-md object-cover">
                     <div v-else class="h-10 w-10 rounded-md flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                       {{ app.name?.charAt(0)?.toUpperCase() || '?' }}
                     </div>
                   </div>
                   <div class="ml-4">
                     <div class="text-sm font-medium text-gray-900 dark:text-white">
                       {{ app.name }}
                     </div>
                     <div class="text-sm text-gray-500 dark:text-gray-400">
                       {{ app.id }} <!-- Display Firestore ID -->
                     </div>
                   </div>
                 </div>
               </td>
               <td class="px-6 py-4 whitespace-nowrap">
                 <!-- Assuming app.platforms is an array -->
                 <div class="flex flex-wrap gap-1">
                   <span
                     v-for="platform in app.platforms"
                     :key="platform"
                     :class="[platformBadgeClass(platform), 'px-2 py-0.5 rounded-full text-xs']"
                   >
                     {{ platform }}
                   </span>
                 </div>
               </td>
               <td class="px-6 py-4 whitespace-nowrap">
                 <span
                   :class="[statusBadgeClass(app.status || 'unknown'), 'px-2 py-1 rounded-full text-xs font-semibold leading-5']" <!-- Provide default for undefined status -->
                 >
                   {{ app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Unknown' }}
                 </span>
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 {{ formatDate(app.updatedAt) }}
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 {{ app.downloads?.toLocaleString() || 'N/A' }} <!-- Placeholder -->
               </td>
               <td class="px-6 py-4 whitespace-nowrap">
                 <div class="flex items-center">
                   <span class="i-carbon-star-filled text-amber-500 mr-1 text-sm"></span>
                   <span class="text-sm text-gray-700 dark:text-gray-300">{{ app.rating?.toFixed(1) || 'N/A' }}</span> <!-- Placeholder -->
                 </div>
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                 <div class="flex justify-end space-x-2">
                   <button
                     @click="editApp(app)"
                     class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                     title="Edit"
                   >
                     <span class="i-carbon-edit"></span>
                     <span class="sr-only">Edit {{ app.name }}</span>
                   </button>
                   <button
                     @click="viewStats(app)"
                     class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                     title="View Stats"
                   >
                     <span class="i-carbon-chart-line"></span>
                     <span class="sr-only">Stats for {{ app.name }}</span>
                   </button>
                   <button
                     @click="showDeleteConfirm(app)"
                     class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                     title="Delete"
                   >
                     <span class="i-carbon-trash-can"></span>
                     <span class="sr-only">Delete {{ app.name }}</span>
                   </button>
                 </div>
               </td>
             </tr>
           </tbody>
           <tbody v-if="!loading && apps.length === 0">
             <tr>
               <td colspan="7" class="px-6 py-12 text-center">
                 <span class="i-carbon-search text-5xl text-gray-300 dark:text-gray-600 block mx-auto mb-3"></span>
                 <p class="text-gray-500 dark:text-gray-400 mb-4">No applications found matching your criteria.</p>
                 <button
                   @click="clearFilters"
                   class="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                 >
                   Clear Filters
                 </button>
               </td>
             </tr>
           </tbody>
           <tbody v-if="loading" class="divide-y divide-gray-200 dark:divide-gray-700">
             <!-- Loading Skeleton Rows -->
             <tr v-for="i in pagination?.pageSize || 5" :key="`skel-${i}`" class="animate-pulse">
               <td class="px-6 py-4 whitespace-nowrap">
                 <div class="flex items-center">
                   <div class="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                   <div class="ml-4 space-y-2">
                     <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                     <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                   </div>
                 </div>
               </td>
               <td class="px-6 py-4 whitespace-nowrap"><div class="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
               <td class="px-6 py-4 whitespace-nowrap"><div class="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
               <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
               <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
               <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
               <td class="px-6 py-4 whitespace-nowrap text-right"><div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded float-right"></div></td>
             </tr>
           </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <!-- Mobile Pagination -->
        <div class="flex-1 flex justify-between sm:hidden">
          <!-- Disable based on if it's the first fetch -->
          <button
            @click="previousPage"
            :disabled="isFirstPage"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous (First Page)
          </button>
          <!-- Disable based on cursor -->
          <button
            @click="nextPage"
            :disabled="!pagination.nextPageCursor"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <!-- Desktop Pagination -->
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p v-if="pagination" class="text-sm text-gray-700 dark:text-gray-300">
              Showing <span class="font-medium">{{ apps.length }}</span> applications
              <span v-if="pagination.totalApps !== null"> of ~<span class="font-medium">{{ pagination.totalApps }}</span> total</span>
            </p>
          </div>
          <div>
            <nav v-if="pagination" class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
              <!-- Disable based on if it's the first fetch -->
              <button
                @click="previousPage"
                :disabled="isFirstPage"
                class="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous (First Page)</span>
                <span class="i-carbon-chevron-left"></span>
              </button>
              <!-- Page number display removed as it's not accurate with cursors -->
              <!-- Disable based on cursor -->
              <button
                @click="nextPage"
                :disabled="!pagination.nextPageCursor"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAppsStore, type Application as App } from '~/stores/apps'; // Use Application alias
import { useToastStore } from '~/stores/toast';
import { navigateTo } from '#app';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// --- Stores ---
const appsStore = useAppsStore();
const toastStore = useToastStore();

// --- Local State ---
const searchQuery = ref<string>('');
const platformFilter = ref<string>('');
const statusFilter = ref<string>('');
// Keep track if the current view is the result of the initial fetch or filter change (i.e., page 1 / no cursor used)
const isFirstPage = ref(true);

// --- Store State Refs ---
const loading = computed<boolean>(() => appsStore.fetchLoading);
const apps = computed<App[]>(() => appsStore.apps);
const pagination = computed(() => appsStore.pagination);

// --- Computed Properties ---
// Removed hasNextPage - use pagination.nextPageCursor directly

// --- Helper Functions ---
const formatDate = (timestamp: string | undefined | null): string => {
  if (!timestamp) return 'Unknown';
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid Date';
  }
};

const platformBadgeClass = (platform: string): string => {
  const platformMap: Record<string, string> = {
    'ios': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'android': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    'web': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    'windows': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'macos': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'linux': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    'github': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'npm': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };
  return platformMap[platform.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const statusBadgeClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    'draft': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    'archived': 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

// --- Action Handlers ---
const clearFilters = () => {
  searchQuery.value = '';
  platformFilter.value = '';
  statusFilter.value = '';
  // fetchAppsWithFilters will be called by the watcher, fetching the first page
};

const editApp = (app: App) => {
  navigateTo(`/admin/apps/${app.id}`);
};

const viewStats = (app: App) => {
  navigateTo(`/admin/apps/${app.id}/stats`);
};

const showDeleteConfirm = (app: App) => {
  // TODO: Replace confirm with a Nuxt UI modal component (UModal)
  if (confirm(`Are you sure you want to delete "${app.name}"? This action cannot be undone.`)) {
    deleteApp(app);
  }
};

const deleteApp = async (app: App) => {
  if (!app) return;
  try {
    toastStore.info(`Deleting ${app.name}...`);
    await appsStore.deleteApp(app.id); // Store action handles refresh
    toastStore.success(`"${app.name}" has been deleted.`);
  } catch (error: unknown) {
    console.error('Error deleting app:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete app.';
    toastStore.error(message);
  }
};

const openImportModal = () => {
  // TODO: Implement import modal using UModal
  toastStore.info('Import functionality coming soon');
};

// --- Pagination Actions ---
const nextPage = () => {
    if (pagination.value?.nextPageCursor) {
        fetchAppsWithFilters(pagination.value.nextPageCursor); // Pass the cursor
    }
};

const previousPage = () => {
    // Go back to the first page (simplification for cursor pagination)
    fetchAppsWithFilters(); // Fetch without cursor
};

// --- Data Fetching ---
const fetchAppsWithFilters = async (cursor?: string | null) => {
    // Update isFirstPage based on whether a cursor is provided
    isFirstPage.value = !cursor;
    await appsStore.fetchApps({
        cursor: cursor, // Pass cursor to store action
        pageSize: pagination.value?.pageSize || 10,
        search: searchQuery.value,
        platform: platformFilter.value,
        status: statusFilter.value,
    });
};

// --- Watchers ---
// Watch filters and trigger refetch (fetching the first page, no cursor)
watch([searchQuery, platformFilter, statusFilter], () => {
    fetchAppsWithFilters(); // Fetch first page when filters change
});

// --- Lifecycle Hooks ---
// Initial fetch on component mount (first page, no cursor)
onMounted(() => {
  fetchAppsWithFilters(); // Fetch first page
});
</script>