<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-20">
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
    <div v-else-if="app" class="space-y-12">
      <!-- Back button and app title section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <span :class="getPlatformIcon(platform)"></span>
            <span>{{ getPlatformName(platform) }}</span>
          </a>
        </div>
      </div>

      <!-- App overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <!-- App info -->
        <div class="md:col-span-2 space-y-8">
          <!-- Description -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">About {{ app.name }}</h2>
            <div class="prose prose-indigo dark:prose-invert max-w-none">
              <p class="text-gray-700 dark:text-gray-300">{{ app.description || 'No description available' }}</p>
            </div>
          </div>

          <!-- Features -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="(feature, index) in getAppFeatures()" :key="index" class="flex items-start gap-3">
                <div class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                  <span class="i-carbon-checkmark text-indigo-600 dark:text-indigo-400"></span>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ feature.title }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Screenshots (mock) -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Screenshots</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="i in 3" :key="i" class="aspect-[3/2] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div class="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <span class="i-carbon-image text-4xl"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- App info card -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div class="p-6">
              <div class="flex items-center mb-6">
                <div class="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                  <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.name" class="h-12 w-12 object-contain">
                  <span v-else class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ app.name.charAt(0) }}</span>
                </div>
                <div class="ml-4">
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ app.name }}</h3>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-for="(tag, index) in getAppTags()" :key="index" class="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 -mx-6 px-6 py-4">
                <h4 class="font-medium text-gray-900 dark:text-white mb-3">App Information</h4>
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
                    <dd class="text-sm text-gray-900 dark:text-white">{{ getAppCategory() }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- Support card -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="font-medium text-gray-900 dark:text-white mb-3">Support</h3>
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
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Applications</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="relatedApp in relatedApps" :key="relatedApp.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-start gap-4">
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

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAppsStore } from '~/stores/apps';

// States
const route = useRoute();
const appsStore = useAppsStore();
const loading = ref(true);
const error = ref(null);
const app = ref(null);
const relatedApps = ref([]);

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
    
    // Get related apps (other apps from the same category)
    const category = getAppCategoryRaw();
    relatedApps.value = appsStore.apps
      .filter(a => a.id !== appId && getAppCategoryRaw(a) === category)
      .slice(0, 3); // Only get 3 related apps
    
    // If we don't have enough related apps, add some random ones
    if (relatedApps.value.length < 3) {
      const additionalApps = appsStore.apps
        .filter(a => a.id !== appId && !relatedApps.value.some(related => related.id === a.id))
        .slice(0, 3 - relatedApps.value.length);
      
      relatedApps.value = [...relatedApps.value, ...additionalApps];
    }
    
  } catch (err) {
    console.error('Error fetching app details:', err);
    error.value = 'Failed to load application details';
  } finally {
    loading.value = false;
  }
};

// Get app category
const getAppCategoryRaw = (currentApp = app.value) => {
  if (!currentApp) return 'other';
  
  const description = (currentApp.description || '').toLowerCase();
  const hasGooglePlay = !!currentApp.links?.googlePlay;
  const hasAppStore = !!currentApp.links?.appStore;
  const hasWebsite = !!currentApp.links?.website;
  const hasGithub = !!currentApp.links?.github;
  const hasNpm = !!currentApp.links?.npm;
  
  if (hasAppStore || hasGooglePlay || description.includes('mobile') || description.includes('ios') || description.includes('android')) {
    return 'mobile';
  }
  
  if (hasNpm || hasGithub || description.includes('library') || description.includes('package') || description.includes('framework')) {
    return 'tools';
  }
  
  if (hasWebsite || description.includes('web') || description.includes('browser')) {
    return 'web';
  }
  
  if (description.includes('desktop') || description.includes('windows') || description.includes('mac') || description.includes('linux')) {
    return 'desktop';
  }
  
  return 'other';
};

// Get formatted app category
const getAppCategory = () => {
  const categoryNames = {
    'mobile': 'Mobile Apps',
    'web': 'Web Applications',
    'desktop': 'Desktop Software',
    'tools': 'Developer Tools',
    'other': 'General Applications'
  };
  
  return categoryNames[getAppCategoryRaw()] || 'Applications';
};

// Get app tags
const getAppTags = () => {
  if (!app.value) return [];
  
  const tags = [];
  const category = getAppCategoryRaw();
  
  // Add category as tag
  switch (category) {
    case 'mobile':
      tags.push('Mobile');
      break;
    case 'web':
      tags.push('Web');
      break;
    case 'desktop':
      tags.push('Desktop');
      break;
    case 'tools':
      tags.push('Dev Tools');
      break;
  }
  
  // Add platform tags
  if (app.value.links?.googlePlay) tags.push('Android');
  if (app.value.links?.appStore) tags.push('iOS');
  if (app.value.links?.github) tags.push('Open Source');
  if (app.value.links?.npm) tags.push('NPM');
  
  return tags;
};

// Generate mock features based on app description and category
const getAppFeatures = () => {
  if (!app.value) return [];
  
  const features = [];
  const category = getAppCategoryRaw();
  
  // Base features by category
  switch (category) {
    case 'mobile':
      features.push(
        { title: 'Cross-Platform Support', description: 'Available on iOS and Android devices' },
        { title: 'Intuitive UI/UX', description: 'User-friendly interface designed for mobile' }
      );
      break;
    case 'web':
      features.push(
        { title: 'Responsive Design', description: 'Optimized for all screen sizes and devices' },
        { title: 'Fast Loading', description: 'Efficient code for quick page loads' }
      );
      break;
    case 'desktop':
      features.push(
        { title: 'Multi-Platform', description: 'Available for Windows, Mac, and Linux' },
        { title: 'Offline Support', description: 'Full functionality without internet connection' }
      );
      break;
    case 'tools':
      features.push(
        { title: 'Developer-Friendly', description: 'Designed with developers in mind' },
        { title: 'Extensive Documentation', description: 'Comprehensive guides and examples' }
      );
      break;
  }
  
  // Add AI feature if description mentions AI
  if (app.value.description?.toLowerCase().includes('ai') || app.value.description?.toLowerCase().includes('intelligence')) {
    features.push({ title: 'AI Integration', description: 'Powered by advanced artificial intelligence' });
  }
  
  // Add cloud feature if description mentions cloud
  if (app.value.description?.toLowerCase().includes('cloud') || app.value.description?.toLowerCase().includes('online')) {
    features.push({ title: 'Cloud Sync', description: 'Automatic synchronization across all your devices' });
  }
  
  // Always add these general features
  features.push(
    { title: 'Regular Updates', description: 'Continual improvements and new features' },
    { title: 'Customer Support', description: '24/7 support available for all users' }
  );
  
  return features;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Get platform icon
const getPlatformIcon = (platform) => {
  const iconMap = {
    'googlePlay': 'i-carbon-logo-google',
    'appStore': 'i-carbon-logo-apple',
    'github': 'i-carbon-logo-github',
    'npm': 'i-carbon-package',
    'website': 'i-carbon-globe'
  };
  
  return iconMap[platform] || 'i-carbon-application';
};

// Get platform name
const getPlatformName = (platform) => {
  const nameMap = {
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