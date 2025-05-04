<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Applications</h1>
      <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        Explore our suite of innovative applications designed to enhance productivity and streamline your workflow.
      </p>
    </div>

    <!-- Search and filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-8 p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label for="search" class="sr-only">Search applications</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="i-carbon-search text-gray-400 dark:text-gray-500"></span>
            </div>
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Search applications..."
            />
          </div>
        </div>
        <div class="flex gap-4">
          <div class="w-40">
            <label for="category" class="sr-only">Filter by category</label>
            <select
              id="category"
              v-model="selectedCategory"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="">All Categories</option>
              <option value="mobile">Mobile Apps</option>
              <option value="web">Web Apps</option>
              <option value="desktop">Desktop Apps</option>
              <option value="tools">Developer Tools</option>
            </select>
          </div>
          <div class="w-40">
            <label for="sortBy" class="sr-only">Sort by</label>
            <select
              id="sortBy"
              v-model="sortBy"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="name">Name</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>
    </div>

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
      <button @click="fetchApps" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Try Again</button>
    </div>

    <!-- No apps found -->
    <div v-else-if="filteredApps.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <div class="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
        <span class="i-carbon-application text-4xl text-gray-400 dark:text-gray-500"></span>
      </div>
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        {{ searchQuery ? `No applications match your search for "${searchQuery}"` : "We couldn't find any applications at the moment." }}
      </p>
      <button v-if="searchQuery" @click="resetFilters" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Clear Filters</button>
    </div>

    <!-- Apps grid -->
    <div v-else>
      <!-- Category groups -->
      <div v-for="(apps, category) in groupedApps" :key="category" class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span>{{ getCategoryName(category) }}</span>
          <span class="ml-3 text-sm font-normal text-gray-500 dark:text-gray-400">({{ apps.length }})</span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="app in apps" :key="app.id" class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <!-- App header with logo -->
            <div class="p-6 flex items-start gap-4">
              <div class="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.name" class="h-12 w-12 object-contain">
                <span v-else class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ app.name.charAt(0) }}</span>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">{{ app.name }}</h3>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(tag, index) in getAppTags(app)" :key="index" class="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>

            <!-- App description -->
            <div class="px-6 py-4 flex-grow">
              <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">{{ app.description || 'No description available' }}</p>
            </div>

            <!-- App links -->
            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div class="flex items-center justify-between">
                <div class="flex space-x-3">
                  <a v-if="app.links?.googlePlay" :href="app.links.googlePlay" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" title="Google Play">
                    <span class="i-carbon-logo-google text-xl"></span>
                  </a>
                  <a v-if="app.links?.appStore" :href="app.links.appStore" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" title="App Store">
                    <span class="i-carbon-logo-apple text-xl"></span>
                  </a>
                  <a v-if="app.links?.github" :href="app.links.github" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" title="GitHub">
                    <span class="i-carbon-logo-github text-xl"></span>
                  </a>
                  <a v-if="app.links?.website" :href="app.links.website" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" title="Website">
                    <span class="i-carbon-globe text-xl"></span>
                  </a>
                </div>
                <NuxtLink :to="`/apps/${app.id}`" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
                  View Details
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAppsStore } from '~/stores/apps';

// States
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('name');

// Store access
const appsStore = useAppsStore();

// Categories with fallback assignment
const getAppCategory = (app) => {
  if (!app) return 'other';
  
  // Determine category based on app links and description
  const hasGooglePlay = !!app.links?.googlePlay;
  const hasAppStore = !!app.links?.appStore;
  const hasWebsite = !!app.links?.website;
  const hasGithub = !!app.links?.github;
  const hasNpm = !!app.links?.npm;
  
  const description = (app.description || '').toLowerCase();
  
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

// Get tags for an app
const getAppTags = (app) => {
  const tags = [];
  const category = getAppCategory(app);
  
  // Add the category as a tag
  tags.push(getCategoryName(category));
  
  // Add platform tags based on links
  if (app.links?.googlePlay) tags.push('Android');
  if (app.links?.appStore) tags.push('iOS');
  if (app.links?.github) tags.push('Open Source');
  if (app.links?.npm) tags.push('NPM');
  
  return tags;
};

// Get readable category name
const getCategoryName = (category) => {
  const categoryNames = {
    'mobile': 'Mobile Apps',
    'web': 'Web Apps',
    'desktop': 'Desktop Apps',
    'tools': 'Developer Tools',
    'other': 'Other Apps'
  };
  
  return categoryNames[category] || 'Applications';
};

// Filtered and sorted apps
const filteredApps = computed(() => {
  if (!appsStore.apps) return [];
  
  let result = [...appsStore.apps];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(app => 
      app.name.toLowerCase().includes(query) || 
      app.description?.toLowerCase().includes(query)
    );
  }
  
  // Apply category filter
  if (selectedCategory.value) {
    result = result.filter(app => getAppCategory(app) === selectedCategory.value);
  }
  
  // Apply sorting
  switch (sortBy.value) {
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
  }
  
  return result;
});

// Group apps by category
const groupedApps = computed(() => {
  const groups = {};
  
  // If category filter is applied, only include that category
  if (selectedCategory.value) {
    groups[selectedCategory.value] = filteredApps.value;
    return groups;
  }
  
  // Group apps by category
  for (const app of filteredApps.value) {
    const category = getAppCategory(app);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(app);
  }
  
  return groups;
});

// Methods
const fetchApps = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await appsStore.fetchApps();
  } catch (err) {
    console.error('Error fetching apps:', err);
    error.value = 'Failed to load applications. Please try again.';
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  sortBy.value = 'name';
};

// Watch for filter changes to update results
watch([searchQuery, selectedCategory, sortBy], () => {
  // Nothing to do here as computed properties will handle the updates
});

// Fetch apps on mount
onMounted(() => {
  fetchApps();
});
</script>