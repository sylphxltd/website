<template>
  <div class="min-h-screen">
    <!-- Loading state -->
    <div v-if="loading" class="py-32 flex justify-center items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="py-32 max-w-4xl mx-auto px-4">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-8 rounded-2xl text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <span class="i-carbon-warning-filled text-3xl"></span>
          <h3 class="text-xl font-semibold">Something went wrong</h3>
        </div>
        <p class="mb-6">{{ error }}</p>
        <NuxtLink to="/apps" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Back to Applications
        </NuxtLink>
      </div>
    </div>
    
    <!-- App not found -->
    <div v-else-if="!app" class="py-32 max-w-4xl mx-auto px-4">
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-8 rounded-2xl text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <span class="i-carbon-warning text-3xl"></span>
          <h3 class="text-xl font-semibold">Application Not Found</h3>
        </div>
        <p class="mb-6">The application you're looking for doesn't exist or has been removed.</p>
        <NuxtLink to="/apps" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Browse Applications
        </NuxtLink>
      </div>
    </div>
    
    <!-- App details content -->
    <template v-else>
      <!-- App hero section with gradient header -->
      <section class="relative bg-gradient-to-br from-indigo-600 to-purple-700 pt-20 pb-8 mb-8">
        <!-- Light grid background -->
        <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
        
        <!-- App info container -->
        <div class="container mx-auto px-4 relative z-10">
          <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
            <!-- App logo/icon -->
            <div class="h-24 w-24 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg flex items-center justify-center p-1 ring-4 ring-white/30">
              <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.name" class="h-20 w-20 object-contain">
              <span v-else class="text-4xl font-bold text-indigo-600">{{ app.name.charAt(0) }}</span>
            </div>
            
            <!-- App title and metadata -->
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <h1 class="text-3xl md:text-4xl font-bold text-white">{{ app.name }}</h1>
                <span v-if="app.status === 'new'" class="px-2 py-0.5 bg-green-400/20 text-green-100 rounded-full text-xs font-medium">
                  NEW
                </span>
              </div>
              
              <div class="flex flex-wrap items-center gap-4 text-indigo-100">
                <div class="flex items-center gap-1">
                  <span class="i-carbon-user-multiple"></span>
                  <span>{{ app.users || '10K+' }} Users</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="i-carbon-star"></span>
                  <span>{{ app.rating || '4.8' }} Rating</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="i-carbon-calendar"></span>
                  <span>Updated {{ formatDate(app.updatedAt || new Date()) }}</span>
                </div>
              </div>
              
              <!-- App category tags -->
              <div class="mt-4 flex flex-wrap gap-2">
                <span 
                  v-for="tag in getAppTags(app)" 
                  :key="tag" 
                  class="px-3 py-1 bg-white/15 rounded-full text-sm text-white"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <!-- Action buttons -->
            <div class="flex flex-wrap gap-3 mt-4 md:mt-0">
              <a 
                v-for="(url, platform) in getPlatformLinks(app)" 
                :key="platform" 
                :href="url" 
                target="_blank" 
                rel="noopener noreferrer" 
                :class="getButtonClass(platform)"
                class="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm font-medium transition-colors"
              >
                <span :class="getPlatformIcon(platform)"></span>
                <span>{{ getPlatformName(platform) }}</span>
              </a>
              
              <button v-if="userStore.isAdmin" @click="openEditModal" class="flex items-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg shadow-sm font-medium transition-colors">
                <span class="i-carbon-edit"></span>
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Main content area -->
      <div class="container mx-auto px-4 pb-16">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main content column -->
          <div class="lg:col-span-2 space-y-8">
            <!-- App description -->
            <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
              <div class="prose dark:prose-invert max-w-none" v-html="formattedDescription"></div>
            </section>
            
            <!-- Screenshots gallery -->
            <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Screenshots</h2>
              
              <!-- Placeholder screenshots (would be actual app screenshots) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="i in 3" :key="i" class="rounded-lg bg-gray-100 dark:bg-gray-700 aspect-[9/16] overflow-hidden">
                  <div class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <span class="i-carbon-image text-3xl"></span>
                  </div>
                </div>
              </div>
            </section>
            
            <!-- Reviews section -->
            <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Reviews</h2>
                <NuxtLink to="#" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
                  View all reviews
                </NuxtLink>
              </div>
              
              <!-- Rating summary -->
              <div class="flex flex-col md:flex-row items-center gap-8 mb-8 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                <div class="text-center">
                  <div class="text-5xl font-bold text-gray-900 dark:text-white mb-2">{{ app.rating || '4.8' }}</div>
                  <div class="flex gap-1 justify-center text-amber-500 mb-2">
                    <span v-for="i in 5" :key="i" class="i-carbon-star-filled"></span>
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Based on {{ app.reviewCount || '1,024' }} reviews</div>
                </div>
                
                <!-- Rating breakdown -->
                <div class="flex-1 space-y-2">
                  <div v-for="i in 5" :key="i" class="flex items-center gap-3">
                    <div class="w-16 text-right text-sm text-gray-700 dark:text-gray-300">{{ 6-i }} stars</div>
                    <div class="flex-1 bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div 
                        class="bg-amber-500 h-full rounded-full" 
                        :style="`width: ${getRatingPercentage(6-i)}%`"
                      ></div>
                    </div>
                    <div class="w-12 text-sm text-gray-500 dark:text-gray-400">{{ getRatingPercentage(6-i) }}%</div>
                  </div>
                </div>
              </div>
              
              <!-- Sample reviews -->
              <div class="space-y-6">
                <div v-for="i in 3" :key="i" class="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {{ ['JD', 'AK', 'MB'][i-1] }}
                      </div>
                      <div class="ml-3">
                        <p class="font-medium text-gray-900 dark:text-white">{{ ['Jane Doe', 'Alex Kim', 'Mike Brown'][i-1] }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ getRandomDate() }}</p>
                      </div>
                    </div>
                    <div class="flex gap-1 text-amber-500">
                      <span v-for="star in 5" :key="star" class="i-carbon-star-filled"></span>
                    </div>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ [
                      "This app is amazing! It has helped me stay organized and focused. The interface is intuitive and I love the dark mode option.",
                      "Great app with lots of useful features. Customer support is responsive and helpful. Highly recommended!",
                      "I've been using this app for months and it keeps getting better with each update. The latest version is fantastic."
                    ][i-1] }}
                  </p>
                </div>
              </div>
            </section>
          </div>
          
          <!-- Sidebar column -->
          <div class="space-y-8">
            <!-- App metadata card -->
            <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Information</h2>
              
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Provider
                  </dt>
                  <dd class="mt-1 text-gray-900 dark:text-white">
                    SylphX
                  </dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Size
                  </dt>
                  <dd class="mt-1 text-gray-900 dark:text-white">
                    {{ app.size || '24.5 MB' }}
                  </dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Category
                  </dt>
                  <dd class="mt-1 text-gray-900 dark:text-white">
                    {{ app.category || 'Productivity' }}
                  </dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Compatibility
                  </dt>
                  <dd class="mt-1 text-gray-900 dark:text-white">
                    {{ app.compatibility || 'iOS 14.0+, Android 8.0+' }}
                  </dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Languages
                  </dt>
                  <dd class="mt-1 text-gray-900 dark:text-white">
                    {{ app.languages || 'English, Spanish, Chinese, Japanese' }}
                  </dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    First Released
                  </dt>
                  <dd class="mt-1 text-gray-900 dark:text-white">
                    {{ formatDate(app.createdAt || new Date('2023-01-15'), 'full') }}
                  </dd>
                </div>
                
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </dt>
                  <dd class="mt-1 text-gray-900 dark:text-white">
                    {{ formatDate(app.updatedAt || new Date(), 'full') }}
                  </dd>
                </div>
              </dl>
            </section>
            
            <!-- Related apps -->
            <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Similar Apps</h2>
                <NuxtLink to="/apps" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
                  View all
                </NuxtLink>
              </div>
              
              <div class="space-y-4">
                <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors">
                  <div class="h-12 w-12 bg-gradient-to-br rounded-lg overflow-hidden shadow-sm flex-shrink-0" :class="[
                    i === 1 ? 'from-blue-500 to-indigo-600' : 
                    i === 2 ? 'from-purple-500 to-pink-600' : 
                    'from-green-500 to-teal-600'
                  ]">
                    <div class="h-full w-full flex items-center justify-center text-white font-bold">
                      {{ ['A', 'B', 'C'][i-1] }}
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ ['AppOne', 'AppTwo', 'AppThree'][i-1] }}
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ ['4.9 ★', '4.7 ★', '4.8 ★'][i-1] }} · {{ ['Productivity', 'Utilities', 'Creativity'][i-1] }}
                    </p>
                  </div>
                  <NuxtLink :to="`/apps/app${i}`" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    <span class="i-carbon-arrow-right"></span>
                  </NuxtLink>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute } from '#app';
import { useAppsStore } from '~/stores/apps';
import { useUserStore } from '~/stores/user';
import { marked } from 'marked';

// Define page meta
definePageMeta({
  layout: 'default'
});

// Store access
const appsStore = useAppsStore();
const userStore = useUserStore();
const route = useRoute();

// State
const loading = ref(true);
const error = ref(null);
const app = ref(null);

// Format description with Markdown
const formattedDescription = computed(() => {
  if (!app.value?.description) {
    return '<p>No description available.</p>';
  }
  
  return marked(app.value.description);
});

// Get app tags for display
const getAppTags = (app) => {
  const tags = [];
  
  // Map categories to tags
  if (app.category) {
    tags.push(app.category);
  }
  
  // Add platform tags
  if (app.links?.googlePlay) tags.push('Android');
  if (app.links?.appStore) tags.push('iOS');
  if (app.links?.github) tags.push('Open Source');
  
  return tags;
};

// Get platform links for display
const getPlatformLinks = (app) => {
  if (!app.links) return {};
  
  const platforms = {};
  
  if (app.links.googlePlay) platforms.googlePlay = app.links.googlePlay;
  if (app.links.appStore) platforms.appStore = app.links.appStore;
  if (app.links.github) platforms.github = app.links.github;
  if (app.links.website) platforms.website = app.links.website;
  if (app.links.npm) platforms.npm = app.links.npm;
  
  return platforms;
};

// Get platform icon for display
const getPlatformIcon = (platform) => {
  const iconMap = {
    'googlePlay': 'i-carbon-logo-google',
    'appStore': 'i-carbon-logo-apple',
    'github': 'i-carbon-logo-github',
    'npm': 'i-carbon-package',
    'website': 'i-carbon-globe'
  };
  
  return iconMap[platform] || 'i-carbon-link';
};

// Get platform name for display
const getPlatformName = (platform) => {
  const nameMap = {
    'googlePlay': 'Google Play',
    'appStore': 'App Store',
    'github': 'GitHub',
    'npm': 'NPM',
    'website': 'Website'
  };
  
  return nameMap[platform] || platform;
};

// Get button class for platform links
const getButtonClass = (platform) => {
  const classMap = {
    'googlePlay': 'bg-white text-gray-900 hover:bg-gray-50',
    'appStore': 'bg-black text-white hover:bg-gray-900',
    'github': 'bg-gray-900 text-white hover:bg-gray-800',
    'npm': 'bg-red-600 text-white hover:bg-red-700',
    'website': 'bg-indigo-600 text-white hover:bg-indigo-700'
  };
  
  return classMap[platform] || 'bg-indigo-600 text-white hover:bg-indigo-700';
};

// Format date
const formatDate = (dateString, format = 'short') => {
  const date = new Date(dateString);
  
  if (format === 'full') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Get relative time description
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  }
  
  if (diffDays === 1) {
    return 'Yesterday';
  }
  
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

// Get random date for reviews
const getRandomDate = () => {
  const dates = [
    '2 days ago',
    '1 week ago',
    '3 weeks ago',
    'Last month'
  ];
  
  return dates[Math.floor(Math.random() * dates.length)];
};

// Get rating percentage distribution
const getRatingPercentage = (rating) => {
  const percentages = {
    5: 68,
    4: 20,
    3: 8,
    2: 3,
    1: 1
  };
  
  return percentages[rating] || 0;
};

// Open edit modal
const openEditModal = () => {
  // Implementation would depend on your modal system
  console.log('Open edit modal for app:', app.value);
};

// Fetch app data
const fetchApp = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // If the apps haven't been loaded yet, load them
    if (appsStore.apps.length === 0) {
      await appsStore.fetchApps();
    }
    
    // Find the app with the matching ID
    const appId = route.params.appId;
    const foundApp = appsStore.apps.find(a => a.id === appId);
    
    if (foundApp) {
      app.value = foundApp;
    } else {
      // Mock data for demonstration (in a real app, this would be a 404)
      app.value = {
        id: appId,
        name: 'Sample App',
        description: `
# ${appId} - Sample Application

This is a sample application for demonstration purposes. In a real application, this content would be loaded from the database.

## Features

* Feature one with some details
* Another important feature
* A third feature that users love

## Requirements

* iOS 14.0 or later
* Android 8.0 or later

## Privacy Policy

This application respects your privacy and does not collect personal information.
        `,
        logoUrl: '',
        links: {
          appStore: 'https://apps.apple.com',
          googlePlay: 'https://play.google.com',
          website: 'https://example.com',
          github: 'https://github.com'
        },
        category: 'Productivity',
        updatedAt: new Date().toISOString(),
        createdAt: new Date('2023-01-15').toISOString()
      };
    }
  } catch (err) {
    console.error('Error fetching app:', err);
    error.value = 'Failed to load application. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Watch for route changes and refetch data
watchEffect(() => {
  if (route.params.appId) {
    fetchApp();
  }
});

// Fetch data on mount
onMounted(() => {
  fetchApp();
});
</script>

<style>
/* Custom utility classes */
.bg-grid-white {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
}

/* Fix for prose content in dark mode */
.dark .prose {
  color: rgb(209 213 219);
}
</style>