<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"> <!-- Increased vertical padding -->
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-24"> <!-- Increased padding -->
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-lg text-center">
      <p class="flex items-center justify-center gap-2 text-lg">
        <span class="i-carbon-warning-filled"></span>
        <span>{{ error }}</span>
      </p>
      <NuxtLink to="/apps" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block">
        Back to Applications
      </NuxtLink>
    </div>

    <!-- App details -->
    <div v-else-if="app" class="space-y-16 md:space-y-20"> <!-- Increased spacing -->
      <!-- Back button and app title section -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-8"> <!-- Increased gap, align start -->
        <div>
          <NuxtLink to="/apps" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center mb-4">
            <span class="i-carbon-arrow-left mr-1"></span>
            Back to Applications
          </NuxtLink>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">{{ app.name }}</h1>
        </div>
        <div class="flex flex-wrap gap-3">
          <a 
            v-for="(url, platform) in app.links" 
            :key="platform" 
            :href="url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <!-- Explicitly cast platform key to string -->
            <span :class="getPlatformIcon(String(platform))" class="text-lg"></span>
            <span>{{ getPlatformName(String(platform)) }}</span>
          </a>
        </div>
      </div>

      <!-- App overview - Increased gap -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 items-start">
        <!-- App info -->
        <div class="md:col-span-2 space-y-10"> <!-- Increased spacing -->
          <!-- Description - Use rounded-xl, increased padding -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sm:p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">About {{ app.name }}</h2>
            <div class="prose prose-indigo dark:prose-invert max-w-none">
              <p class="text-gray-700 dark:text-gray-300">{{ app.description || 'No description available' }}</p>
            </div>
          </div>

          <!-- Features -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sm:p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"> <!-- Adjusted gap -->
              <!-- Display actual features -->
              <div v-if="app.features && app.features.length > 0">
                  <div v-for="(feature, index) in app.features" :key="index" class="flex items-start gap-4"> <!-- Consistent gap -->
                     <div class="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-1"> <!-- Adjusted size/margin -->
                       <span class="i-carbon-checkmark-outline text-indigo-600 dark:text-indigo-400 text-lg"></span> <!-- Adjusted size -->
                     </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ feature.title }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ feature.description }}</p>
                    </div>
                  </div>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-gray-400">No specific features listed.</p>
            </div>
          </div>
 
          <!-- Screenshots -->
          <div v-if="app.screenshotUrls && app.screenshotUrls.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sm:p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Screenshots</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div v-for="(url, index) in app.screenshotUrls" :key="index" class="aspect-[16/9] bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm">
                <img :src="url" :alt="`${app.name} Screenshot ${index + 1}`" class="h-full w-full object-cover">
              </div>
            </div>
          </div>
          <!-- Ensure correct closing tag for md:col-span-2 -->
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- App info card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div class="p-6">
              <div class="flex items-center mb-6">
                <div class="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                  <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.name" class="h-12 w-12 object-contain">
                  <span v-else class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ app.name.charAt(0) }}</span>
                </div>
                <div class="ml-4">
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ app.name }}</h3>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <!-- Display actual tags -->
                    <span v-if="app.tags && app.tags.length > 0" v-for="(tag, index) in app.tags" :key="index" class="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                      {{ tag }}
                    </span>
                    <span v-else class="text-xs text-gray-500 italic">No tags</span>
                  </div>
                </div>
              </div>

              <!-- App Info Details -->
              <div class="pt-6 border-t border-gray-200 dark:border-gray-700 -mx-6 px-6"> <!-- Keep border for visual separation -->
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">App Information</h4>
                <dl class="space-y-3">
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500 dark:text-gray-400">Released</dt>
                    <dd class="text-sm text-gray-900 dark:text-white">{{ formatDate(app.createdAt) }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500 dark:text-gray-400">Last Updated</dt>
                    <dd class="text-sm text-gray-900 dark:text-white">{{ formatDate(app.updatedAt) }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500 dark:text-gray-400">Category</dt>
                    <!-- Display category based on first tag or default -->
                    <dd class="text-sm text-gray-900 dark:text-white">{{ app.tags?.[0] || 'General' }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- Support card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <div class="space-y-4">
              <a href="mailto:support@sylphx.com" class="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                <span class="i-carbon-email mr-2"></span>
                <span>support@sylphx.com</span>
              </a>
              <a href="#" class="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                <span class="i-carbon-help mr-2"></span>
                <span>FAQ & Documentation</span>
              </a>
              <a href="#" class="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                <span class="i-carbon-chat mr-2"></span>
                <span>Community Forum</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Related apps section -->
      <div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Related Applications</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="relatedApp in relatedApps" :key="relatedApp.id" class="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div class="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              <img v-if="relatedApp.logoUrl" :src="relatedApp.logoUrl" :alt="relatedApp.name" class="h-10 w-10 object-contain">
              <span v-else class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{{ relatedApp.name.charAt(0) }}</span>
            </div>
            <div>
              <NuxtLink :to="`/apps/${relatedApp.id}`" class="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                {{ relatedApp.name }}
              </NuxtLink>
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                {{ relatedApp.description || 'No description available' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"> // Added lang="ts"
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAppsStore, type Application } from '~/stores/apps'; // Import Application type

// States
const route = useRoute();
const appsStore = useAppsStore();
const loading = ref(true);
const error = ref<string | null>(null); // Typed error
const app = ref<Application | null>(null); // Typed app
const relatedApps = ref<Application[]>([]); // Typed related apps

// Get app details
const fetchAppDetails = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const appId = route.params.id;
    
    // Fetch all apps if not already loaded
    if (appsStore.apps.length === 0) {
      await appsStore.fetchApps();
    }
    
    // Find app by ID
    const foundApp = appsStore.apps.find(a => a.id === appId);
    
    if (!foundApp) {
      error.value = 'Application not found';
      return;
    }
    
    app.value = foundApp;
    
    // TODO: Implement proper related apps logic based on tags/categories
    // For now, just show some other apps excluding the current one
    relatedApps.value = appsStore.apps
      .filter(a => a.id !== appId && a.status === 'active') // Filter active and different ID
      .slice(0, 3);
    
  } catch (err: unknown) { // Typed catch
    console.error('Error fetching app details:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load application details';
  } finally {
    loading.value = false;
  }
};

// Removed mock data generation functions:
// getAppCategoryRaw, getAppCategory, getAppTags, getAppFeatures

// Format date
const formatDate = (dateString: string | undefined | null): string => { // Typed input
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Get platform icon
const getPlatformIcon = (platform: string): string => { // Typed input
  const iconMap: Record<string, string> = { // Typed map
    'googlePlay': 'i-carbon-logo-google',
    'appStore': 'i-carbon-logo-apple',
    'github': 'i-carbon-logo-github',
    'npm': 'i-carbon-package',
    'website': 'i-carbon-globe'
  };
  
  return iconMap[platform] || 'i-carbon-application';
};

// Get platform name
const getPlatformName = (platform: string): string => { // Typed input
  const nameMap: Record<string, string> = { // Typed map
    'googlePlay': 'Google Play',
    'appStore': 'App Store',
    'github': 'GitHub',
    'npm': 'NPM Package',
    'website': 'Website'
  };
  
  return nameMap[platform] || platform;
};

// Fetch app on mount
onMounted(() => {
  fetchAppDetails();
});
</script>