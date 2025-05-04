<template>
  <div>
    <!-- Page header with actions -->
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Media Publishing</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Create and publish media content across multiple platforms.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button 
          @click="createPost"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-document-add mr-2"></span>
          Create Post
        </button>
      </div>
    </div>

    <!-- Placeholder content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <p class="text-gray-700 dark:text-gray-300 text-center py-10">
        Media publishing dashboard is coming soon. Here you'll be able to create and publish content across various platforms with AI assistance.
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

// Create Post
const createPost = () => {
  // Implementation in future
  console.log('Create post');
};
</script>