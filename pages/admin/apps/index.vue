<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">Applications</h1>
      <NuxtLink to="/admin/apps/create" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
        <span class="i-carbon-add"></span>
        Add New App
      </NuxtLink>
    </div>

    <!-- Filter and search -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-grow">
        <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
        <div class="relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="i-carbon-search text-gray-400 dark:text-gray-600"></span>
          </div>
          <input
            type="text"
            id="search"
            v-model="searchQuery"
            placeholder="Search by name or description..."
            class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      <div class="w-full sm:w-48">
        <label for="sortBy" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
        <select
          id="sortBy"
          v-model="sortBy"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="name">Name (A-Z)</option>
          <option value="nameDesc">Name (Z-A)</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="lastUpdated">Last Updated</option>
        </select>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="appsStore.loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="appsStore.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md mb-6">
      <p class="flex items-center">
        <span class="i-carbon-warning-filled mr-2"></span>
        <span>{{ appsStore.error.message }}</span>
      </p>
      <button @click="appsStore.fetchApps" class="text-sm text-red-600 dark:text-red-400 underline mt-2">Try again</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredApps.length === 0 && !searchQuery" class="bg-white dark:bg-gray-800 rounded-lg shadow p-10 text-center">
      <div class="mx-auto h-20 w-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <span class="i-carbon-application-web text-4xl text-gray-400 dark:text-gray-500"></span>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No applications yet</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first application.</p>
      <NuxtLink to="/admin/apps/create" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
        <span class="i-carbon-add mr-2"></span>
        Add New App
      </NuxtLink>
    </div>

    <!-- No search results -->
    <div v-else-if="filteredApps.length === 0 && searchQuery" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
      <p class="text-gray-500 dark:text-gray-400">No applications found matching "{{ searchQuery }}"</p>
      <button @click="searchQuery = ''" class="text-indigo-600 dark:text-indigo-400 text-sm mt-2">Clear search</button>
    </div>

    <!-- Apps grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="app in filteredApps" :key="app.id" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-md transition-shadow">
        <div class="p-6">
          <div class="flex items-start gap-4">
            <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.name" class="w-16 h-16 object-cover rounded-md bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            <div v-else class="w-16 h-16 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-lg flex-shrink-0">
              {{ app.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-grow">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">{{ app.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 h-10">{{ app.description || 'No description provided' }}</p>
            </div>
          </div>
          
          <!-- App stats/links -->
          <div class="mt-6 grid grid-cols-2 gap-4 text-xs">
            <div v-if="app.links?.googlePlay" class="flex items-center text-gray-500 dark:text-gray-400">
              <span class="i-carbon-logo-google mr-1"></span>
              <span>Google Play</span>
            </div>
            <div v-if="app.links?.appStore" class="flex items-center text-gray-500 dark:text-gray-400">
              <span class="i-carbon-logo-apple mr-1"></span>
              <span>App Store</span>
            </div>
            <div v-if="app.links?.github" class="flex items-center text-gray-500 dark:text-gray-400">
              <span class="i-carbon-logo-github mr-1"></span>
              <span>GitHub</span>
            </div>
            <div v-if="app.links?.npm" class="flex items-center text-gray-500 dark:text-gray-400">
              <span class="i-carbon-package mr-1"></span>
              <span>NPM Package</span>
            </div>
          </div>
          
          <!-- Updated date -->
          <div class="mt-6 text-xs text-gray-500 dark:text-gray-400">
            Updated {{ new Date(app.updatedAt).toLocaleDateString() }}
          </div>
        </div>
        
        <!-- Actions -->
        <div class="mt-auto border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between bg-gray-50 dark:bg-gray-750">
          <NuxtLink :to="`/admin/apps/${app.id}`" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            Manage App
          </NuxtLink>
          <button @click="confirmDelete(app)" class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Confirm Delete</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            Are you sure you want to delete <span class="font-semibold">{{ appToDelete?.name }}</span>? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-4 mt-6">
            <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md">
              Cancel
            </button>
            <button @click="handleDeleteApp" :disabled="isDeleting" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAppsStore } from '~/stores/apps';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'vue-router';

// Page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Stores
const appsStore = useAppsStore();
const userStore = useUserStore();
const router = useRouter();

// Local state
const searchQuery = ref('');
const sortBy = ref('name');
const showDeleteModal = ref(false);
const appToDelete = ref(null);
const isDeleting = ref(false);

// Filter and sort apps
const filteredApps = computed(() => {
  let result = [...appsStore.apps];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(app => 
      app.name.toLowerCase().includes(query) || 
      app.description?.toLowerCase().includes(query)
    );
  }
  
  // Apply sorting
  switch (sortBy.value) {
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'nameDesc':
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'lastUpdated':
      result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      break;
  }
  
  return result;
});

// Load apps on mount
onMounted(async () => {
  if (!appsStore.apps.length) {
    await appsStore.fetchApps();
  }
});

// Watch for changes in sort or search to refresh filtered list
watch([sortBy, searchQuery], () => {
  // No action needed, computed will recalculate
}, { immediate: true });

// Delete confirmation
const confirmDelete = (app) => {
  appToDelete.value = app;
  showDeleteModal.value = true;
};

// Handle delete
const handleDeleteApp = async () => {
  if (!appToDelete.value) return;
  
  isDeleting.value = true;
  try {
    await appsStore.deleteApp(appToDelete.value.id);
    userStore.showToast(`Application "${appToDelete.value.name}" deleted successfully.`, 'success');
    showDeleteModal.value = false;
  } catch (error) {
    console.error("Error deleting app:", error);
    userStore.showToast('Failed to delete application.', 'error');
  } finally {
    isDeleting.value = false;
    appToDelete.value = null;
  }
};
</script>