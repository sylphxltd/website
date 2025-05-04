<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

    <!-- Dashboard overview cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Apps card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <span class="i-carbon-application text-2xl text-indigo-600 dark:text-indigo-400"></span>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Applications</h3>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ appsStore.apps.length }}</p>
          </div>
        </div>
        <div class="mt-4">
          <NuxtLink to="/admin/apps" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
            Manage Applications
          </NuxtLink>
        </div>
      </div>

      <!-- Users card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span class="i-carbon-user-multiple text-2xl text-green-600 dark:text-green-400"></span>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Users</h3>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ userCount }}</p>
          </div>
        </div>
        <div class="mt-4">
          <NuxtLink to="/admin/users" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
            Manage Users
          </NuxtLink>
        </div>
      </div>

      <!-- Reviews card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
            <span class="i-carbon-star-review text-2xl text-yellow-600 dark:text-yellow-400"></span>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Reviews</h3>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ pendingReviews }}</p>
          </div>
        </div>
        <div class="mt-4">
          <NuxtLink to="/admin/reviews" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
            Manage Reviews
          </NuxtLink>
        </div>
      </div>

      <!-- Emails card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span class="i-carbon-email text-2xl text-blue-600 dark:text-blue-400"></span>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Emails</h3>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ unreadEmails }}</p>
          </div>
        </div>
        <div class="mt-4">
          <NuxtLink to="/admin/emails" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
            Manage Emails
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Recent activity and quick actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent activity -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        
        <div class="space-y-4">
          <div v-for="(activity, index) in recentActivity" :key="index" class="flex items-start pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
            <div :class="getActivityIcon(activity.type)" class="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-white"></div>
            <div class="ml-3">
              <p class="text-sm text-gray-900 dark:text-white">{{ activity.message }}</p>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(activity.timestamp) }}</span>
            </div>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <button class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
            View All Activity
          </button>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        
        <div class="space-y-3">
          <NuxtLink to="/admin/apps/create" class="block w-full py-3 px-4 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-md transition-colors text-sm font-medium">
            <span class="flex items-center">
              <span class="i-carbon-add mr-2"></span>
              Add New Application
            </span>
          </NuxtLink>
          
          <NuxtLink to="/admin/emails" class="block w-full py-3 px-4 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md transition-colors text-sm font-medium">
            <span class="flex items-center">
              <span class="i-carbon-email mr-2"></span>
              Compose Email
            </span>
          </NuxtLink>
          
          <NuxtLink to="/admin/media" class="block w-full py-3 px-4 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-md transition-colors text-sm font-medium">
            <span class="flex items-center">
              <span class="i-carbon-share-knowledge mr-2"></span>
              Create Social Post
            </span>
          </NuxtLink>
          
          <NuxtLink to="/admin/resources" class="block w-full py-3 px-4 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-md transition-colors text-sm font-medium">
            <span class="flex items-center">
              <span class="i-carbon-cloud-upload mr-2"></span>
              Upload Resource
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppsStore } from '~/stores/apps';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Get apps store
const appsStore = useAppsStore();

// Mock data for dashboard
const userCount = ref(25);
const pendingReviews = ref(12);
const unreadEmails = ref(8);

// Example activity data
const recentActivity = ref([
  {
    type: 'app',
    message: 'New application "SylphChat" was added',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    type: 'review',
    message: 'New 5-star review for "SylphNote" on App Store',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    type: 'user',
    message: 'John Doe was granted admin access',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    type: 'email',
    message: 'Support request from customer@example.com',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    type: 'media',
    message: 'Social media post published to Twitter and LinkedIn',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
]);

// Get appropriate icon for activity type
const getActivityIcon = (type) => {
  const classes = {
    app: 'bg-indigo-500 i-carbon-application',
    user: 'bg-green-500 i-carbon-user',
    review: 'bg-yellow-500 i-carbon-star',
    email: 'bg-blue-500 i-carbon-email',
    media: 'bg-purple-500 i-carbon-share-knowledge',
    resource: 'bg-pink-500 i-carbon-document'
  };
  
  return classes[type] || 'bg-gray-500 i-carbon-notification';
};

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  }
  
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
  
  return date.toLocaleDateString();
};

// Fetch data on mount
onMounted(async () => {
  if (appsStore.apps.length === 0) {
    await appsStore.fetchApps();
  }
});
</script>