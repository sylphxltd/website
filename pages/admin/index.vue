<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Admin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- User Management -->
      <NuxtLink
        to="/admin/users"
        class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
      >
        <h2 class="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">User Management</h2>
        <p class="text-gray-600 dark:text-gray-300">Manage user accounts and roles.</p>
      </NuxtLink>

      <!-- App Management -->
      <NuxtLink
        to="/apps"
        class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
      >
        <h2 class="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">App Management</h2>
        <p class="text-gray-600 dark:text-gray-300">Manage application listings and details.</p>
        <!-- Note: Consider moving /apps to /admin/apps for consistency -->
      </NuxtLink>

      <!-- Removed Instructions, Settings, Email, Media, and Placeholders -->

    </div>
  </div>
</template>

<script setup lang="ts">
// Define middleware for this page and potentially all under /admin
definePageMeta({
  middleware: ['auth', 'admin-only'] // Add 'admin-only' middleware
});

// Optional: Add any specific logic for the dashboard here
</script>

<style scoped>
/* Add any specific styles for the dashboard here */
</style>