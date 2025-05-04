<template>
  <div>
    <!-- Page header with actions -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-3">
          <button @click="navigateBack" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <span class="i-carbon-arrow-left text-xl"></span>
          </button>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ app ? app.name : 'Application' }} Stats</h1>
        </div>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Performance metrics and analytics for this application.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          @click="refreshData"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-refresh mr-2"></span>
          Refresh
        </button>
        <button
          @click="exportData"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-download mr-2"></span>
          Export Data
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-white transition ease-in-out duration-150">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading application statistics...
      </div>
    </div>

    <!-- Main content -->
    <div v-else class="space-y-8">
      <!-- Summary stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Downloads Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">Total Downloads</h3>
            <span class="i-carbon-download text-indigo-600 dark:text-indigo-400 text-xl"></span>
          </div>
          <div class="mt-2 flex items-baseline">
            <p class="text-3xl font-semibold text-gray-900 dark:text-white">{{ formatNumber(statistics.totalDownloads) }}</p>
            <p class="ml-2 text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
              <span class="i-carbon-arrow-up text-xs mr-1"></span>
              {{ statistics.downloadsGrowth }}%
            </p>
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Compared to last month</p>
        </div>
        
        <!-- Active Users Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">Active Users</h3>
            <span class="i-carbon-user-multiple text-blue-600 dark:text-blue-400 text-xl"></span>
          </div>
          <div class="mt-2 flex items-baseline">
            <p class="text-3xl font-semibold text-gray-900 dark:text-white">{{ formatNumber(statistics.activeUsers) }}</p>
            <p class="ml-2 text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
              <span class="i-carbon-arrow-up text-xs mr-1"></span>
              {{ statistics.activeUsersGrowth }}%
            </p>
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Compared to last month</p>
        </div>
        
        <!-- Average Rating Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">Average Rating</h3>
            <span class="i-carbon-star text-amber-500 text-xl"></span>
          </div>
          <div class="mt-2 flex items-baseline">
            <p class="text-3xl font-semibold text-gray-900 dark:text-white">{{ statistics.averageRating.toFixed(1) }}</p>
            <div class="ml-2 flex items-center">
              <span v-for="i in 5" :key="i" 
                :class="[
                  i <= Math.round(statistics.averageRating) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600',
                  'i-carbon-star-filled text-sm'
                ]"
              ></span>
            </div>
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Based on {{ formatNumber(statistics.totalReviews) }} reviews</p>
        </div>
        
        <!-- Crashes Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-500 dark:text-gray-400">Crash Rate</h3>
            <span class="i-carbon-warning text-red-600 dark:text-red-400 text-xl"></span>
          </div>
          <div class="mt-2 flex items-baseline">
            <p class="text-3xl font-semibold text-gray-900 dark:text-white">{{ statistics.crashRate.toFixed(2) }}%</p>
            <p class="ml-2 text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
              <span class="i-carbon-arrow-down text-xs mr-1"></span>
              0.5%
            </p>
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Compared to last version</p>
        </div>
      </div>
      
      <!-- Charts section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Downloads Over Time Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Downloads Over Time</h3>
          <div class="h-80 bg-gray-50 dark:bg-gray-750 rounded-lg flex items-center justify-center">
            <p class="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>
        
        <!-- User Retention Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">User Retention</h3>
          <div class="h-80 bg-gray-50 dark:bg-gray-750 rounded-lg flex items-center justify-center">
            <p class="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
      
      <!-- Platform breakdown -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6">Platform Distribution</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div v-for="platform in statistics.platforms" :key="platform.name">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center">
                <span :class="getPlatformIcon(platform.name)" class="text-lg mr-2"></span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ platform.name }}</span>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ platform.percentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                class="h-2.5 rounded-full" 
                :class="getPlatformColor(platform.name)"
                :style="{ width: platform.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Version breakdown -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Version Distribution</h3>
          <select class="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-indigo-500 focus:border-indigo-500">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
            <option>All time</option>
          </select>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Version</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Release Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Users</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Crash Rate</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="version in statistics.versions" :key="version.number">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ version.number }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(version.releaseDate) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatNumber(version.activeUsers) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2 w-24">
                      <div class="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" :style="{ width: version.percentage + '%' }"></div>
                    </div>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ version.percentage }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ version.crashRate.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppsStore } from '~/stores/apps';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Get router and route
const router = useRouter();
const route = useRoute();
const appsStore = useAppsStore();

// Local state
const loading = ref(true);
const appId = computed(() => route.params.appId);
const app = computed(() => appsStore.apps.find(a => a.id === appId.value));

// Mock statistics for demo purposes
// In a real app, this would come from an API
const statistics = ref({
  totalDownloads: 128450,
  downloadsGrowth: 12.8,
  activeUsers: 43250,
  activeUsersGrowth: 5.2,
  averageRating: 4.7,
  totalReviews: 3285,
  crashRate: 0.45,
  
  platforms: [
    { name: 'iOS', percentage: 56, color: 'bg-blue-600' },
    { name: 'Android', percentage: 38, color: 'bg-green-600' },
    { name: 'Web', percentage: 6, color: 'bg-purple-600' }
  ],
  
  versions: [
    { number: 'v2.5.0', releaseDate: new Date('2025-03-25'), activeUsers: 20850, percentage: 48.2, crashRate: 0.32 },
    { number: 'v2.4.2', releaseDate: new Date('2025-02-18'), activeUsers: 12480, percentage: 28.9, crashRate: 0.41 },
    { number: 'v2.4.1', releaseDate: new Date('2025-01-30'), activeUsers: 5620, percentage: 13.0, crashRate: 0.55 },
    { number: 'v2.4.0', releaseDate: new Date('2025-01-05'), activeUsers: 2450, percentage: 5.7, crashRate: 0.62 },
    { number: 'v2.3.5', releaseDate: new Date('2024-12-12'), activeUsers: 1850, percentage: 4.2, crashRate: 0.75 }
  ]
});

// Fetch app data
onMounted(async () => {
  if (appsStore.apps.length === 0) {
    await appsStore.fetchApps();
  }
  
  // In a real app, this would fetch statistics from an API
  // For now, just simulate a loading delay
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

// Helper functions
const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const getPlatformIcon = (platform) => {
  const iconMap = {
    'iOS': 'i-carbon-logo-apple text-blue-600 dark:text-blue-400',
    'Android': 'i-carbon-logo-android text-green-600 dark:text-green-400',
    'Web': 'i-carbon-globe text-purple-600 dark:text-purple-400',
    'macOS': 'i-carbon-laptop text-gray-600 dark:text-gray-400',
    'Windows': 'i-carbon-logo-windows text-blue-600 dark:text-blue-400',
    'Linux': 'i-carbon-terminal text-orange-600 dark:text-orange-400'
  };
  
  return iconMap[platform] || 'i-carbon-application text-gray-600 dark:text-gray-400';
};

const getPlatformColor = (platform) => {
  const colorMap = {
    'iOS': 'bg-blue-600',
    'Android': 'bg-green-600',
    'Web': 'bg-purple-600',
    'macOS': 'bg-gray-600',
    'Windows': 'bg-blue-600',
    'Linux': 'bg-orange-600'
  };
  
  return colorMap[platform] || 'bg-gray-600';
};

// Navigation
const navigateBack = () => {
  router.back();
};

// Actions
const refreshData = () => {
  loading.value = true;
  
  // In a real app, this would refetch data from an API
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

const exportData = () => {
  alert('Export functionality coming soon');
};
</script>