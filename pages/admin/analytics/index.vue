<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
      <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Monitor performance metrics for all your applications.
      </p>
    </div>
    
    <!-- Analytics cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      <!-- Total users card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</h3>
          <span class="i-carbon-user-multiple text-indigo-600 dark:text-indigo-400 text-xl"></span>
        </div>
        <div class="flex items-baseline">
          <span class="text-3xl font-bold text-gray-900 dark:text-white">124.4K</span>
          <span class="ml-2 text-green-600 dark:text-green-400 text-sm font-medium flex items-center">
            <span class="i-carbon-arrow-up text-xs mr-1"></span>
            8.2%
          </span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Compared to last month</p>
      </div>
      
      <!-- Downloads card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Downloads</h3>
          <span class="i-carbon-download text-blue-600 dark:text-blue-400 text-xl"></span>
        </div>
        <div class="flex items-baseline">
          <span class="text-3xl font-bold text-gray-900 dark:text-white">28.6K</span>
          <span class="ml-2 text-green-600 dark:text-green-400 text-sm font-medium flex items-center">
            <span class="i-carbon-arrow-up text-xs mr-1"></span>
            12.5%
          </span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Compared to last month</p>
      </div>
      
      <!-- Rating card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Rating</h3>
          <span class="i-carbon-star text-amber-500 text-xl"></span>
        </div>
        <div class="flex items-baseline">
          <span class="text-3xl font-bold text-gray-900 dark:text-white">4.8</span>
          <span class="ml-2 text-green-600 dark:text-green-400 text-sm font-medium flex items-center">
            <span class="i-carbon-arrow-up text-xs mr-1"></span>
            0.3
          </span>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Compared to last month</p>
      </div>
    </div>
    
    <!-- Chart placeholders -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <!-- User growth chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 class="text-gray-700 dark:text-gray-300 font-medium mb-4">User Growth</h3>
        <div class="h-64 w-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <p class="text-gray-500 dark:text-gray-400">User growth chart will appear here</p>
        </div>
      </div>
      
      <!-- Platform distribution chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 class="text-gray-700 dark:text-gray-300 font-medium mb-4">Platform Distribution</h3>
        <div class="h-64 w-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <p class="text-gray-500 dark:text-gray-400">Platform distribution chart will appear here</p>
        </div>
      </div>
    </div>
    
    <!-- Recent activities -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-gray-700 dark:text-gray-300 font-medium">Recent Activity</h3>
        <button class="text-indigo-600 dark:text-indigo-400 text-sm">View All</button>
      </div>
      
      <div class="space-y-5">
        <div class="flex">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span class="i-carbon-notification"></span>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">New review on SylphChat</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">A new 5-star review was posted for SylphChat on App Store</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
          </div>
        </div>
        
        <div class="flex">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
              <span class="i-carbon-application"></span>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">New version released</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">SylphNote v2.3.0 was released to App Store and Google Play</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">5 hours ago</p>
          </div>
        </div>
        
        <div class="flex">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <span class="i-carbon-user"></span>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">New admin user</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Jane Doe (jane@example.com) was added as admin</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});
</script>