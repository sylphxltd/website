<template>
  <div>
    <!-- Page header with actions -->
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Resources Management</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Manage and organize resources for all your applications.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button 
          @click="uploadResource"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-upload mr-2"></span>
          Upload Resource
        </button>
      </div>
    </div>

    <!-- Placeholder content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <p class="text-gray-700 dark:text-gray-300 text-center py-10">
        Resources management dashboard is coming soon. Here you'll be able to upload, manage, and organize resources for all your applications.
      </p>
    </div>
  </div>
</template>

<script setup>
// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Upload Resource
const uploadResource = () => {
  // Implementation in future
  console.log('Upload resource');
};
</script>