<template>
  <div>
    <!-- Page header with actions -->
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Reviews Management</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Monitor and respond to reviews across all app stores in one place.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button 
          @click="generateAIResponses"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="i-carbon-ai-status mr-2"></span>
          AI Generate Responses
        </button>
      </div>
    </div>

    <!-- Placeholder content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <p class="text-gray-700 dark:text-gray-300 text-center py-10">
        Reviews management dashboard is coming soon. Here you'll be able to manage reviews from various app stores.
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

// AI Generate Responses
const generateAIResponses = () => {
  // Implementation in future
  console.log('Generate AI responses');
};
</script>