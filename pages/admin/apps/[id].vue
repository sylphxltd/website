<template>
  <div>
    <!-- Back button and app title -->
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/apps" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1">
        <span class="i-carbon-arrow-left"></span>
        <span>Back to Apps</span>
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md mb-6">
      <p class="flex items-center">
        <span class="i-carbon-warning-filled mr-2"></span>
        <span>{{ error }}</span>
      </p>
      <button @click="fetchApp" class="text-sm text-red-600 dark:text-red-400 underline mt-2">Try again</button>
    </div>

    <div v-else-if="app" class="space-y-8">
      <!-- App header -->
      <div class="flex items-start gap-6 mb-8">
        <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
          <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.name" class="w-full h-full object-cover">
          <span v-else class="text-4xl text-gray-400 dark:text-gray-500">{{ app.name.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">{{ app.name }}</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">{{ app.description || 'No description provided' }}</p>
          
          <div class="flex flex-wrap gap-2 mt-4">
            <a v-if="app.links?.googlePlay" :href="app.links.googlePlay" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs">
              <span class="i-carbon-logo-google"></span>
              <span>Google Play</span>
            </a>
            <a v-if="app.links?.appStore" :href="app.links.appStore" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs">
              <span class="i-carbon-logo-apple"></span>
              <span>App Store</span>
            </a>
            <a v-if="app.links?.github" :href="app.links.github" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs">
              <span class="i-carbon-logo-github"></span>
              <span>GitHub</span>
            </a>
            <a v-if="app.links?.npm" :href="app.links.npm" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs">
              <span class="i-carbon-package"></span>
              <span>NPM</span>
            </a>
            <a v-if="app.links?.website" :href="app.links.website" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs">
              <span class="i-carbon-globe"></span>
              <span>Website</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-2 px-1 border-b-2 font-medium text-sm" 
            :class="[
              activeTab === tab.id 
                ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            ]"
          >
            <div class="flex items-center gap-2">
              <span :class="tab.icon"></span>
              <span>{{ tab.name }}</span>
            </div>
          </button>
        </nav>
      </div>

      <!-- Tab content -->
      <div>
        <!-- Details tab -->
        <div v-if="activeTab === 'details'" class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <AppDetailsEdit :app="app" @app-updated="fetchApp" />
        </div>

        <!-- Resources tab -->
        <div v-else-if="activeTab === 'resources'" class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <AppResources :app-id="app.id" />
        </div>

        <!-- Reviews tab -->
        <div v-else-if="activeTab === 'reviews'" class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <AppReviews :app-id="app.id" />
        </div>

        <!-- Emails tab -->
        <div v-else-if="activeTab === 'emails'" class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <AppEmails :app-id="app.id" />
        </div>

        <!-- Media tab -->
        <div v-else-if="activeTab === 'media'" class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <AppMediaPublisher :app-id="app.id" :app-name="app.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '~/stores/user';
import { useAppsStore, type Application } from '~/stores/apps'; // Import Application type

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Get route and stores
const route = useRoute();
const userStore = useUserStore();
const appsStore = useAppsStore();

// Local state
const app = ref<Application | null>(null); // Correct type for app
const loading = ref(true);
const error = ref<string | null>(null); // Correct type for error message
const activeTab = ref('details');

// Available tabs
const tabs = [
  { id: 'details', name: 'App Details', icon: 'i-carbon-application' },
  { id: 'resources', name: 'Resources', icon: 'i-carbon-document' },
  { id: 'reviews', name: 'Store Reviews', icon: 'i-carbon-star-review' },
  { id: 'emails', name: 'Email Support', icon: 'i-carbon-email' },
  { id: 'media', name: 'Social Media', icon: 'i-carbon-share-knowledge' }
];

// Fetch the app data using the dedicated store action
const fetchApp = async () => {
  loading.value = true;
  error.value = null;
  const appId = route.params.id as string; // Get appId from route

  if (!appId) {
      const msg = 'Application ID is missing from the route.';
      error.value = msg;
      loading.value = false;
      userStore.showToast(msg, 'error'); // Pass the string directly
      return;
  }

  try {
    // Call the new store action to fetch the specific app by ID
    const fetchedApp = await appsStore.fetchAppById(appId);

    if (!fetchedApp) {
      // The action itself should throw an error if not found, but double-check
      const msg = `Application with ID ${appId} not found.`;
      error.value = msg;
      userStore.showToast(msg, 'error'); // Pass the string directly
    } else {
      app.value = fetchedApp; // Assign the fetched app data to the local ref
    }

  } catch (err: unknown) { // Catch unknown type
    console.error('Error fetching app:', err);
    // Error message is likely already set by the store action's error handling
    // If not, or for extra safety:
    const message = err instanceof Error ? err.message : 'An error occurred while loading the application';
    error.value = message;
    // Toast might be redundant if store action already shows it
    // userStore.showToast(message, 'error');
  } finally {
    loading.value = false;
  }
};

// Load app on mount
onMounted(() => {
  fetchApp();
});
</script>