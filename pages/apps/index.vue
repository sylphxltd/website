<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Application Management</h1>

    <!-- Main content -->
    <div v-if="!userStore.isAuthenticated" class="text-center py-10">
      <p class="text-red-500">Please log in to manage applications.</p>
      <NuxtLink to="/login" class="text-blue-500 hover:underline">Go to Login</NuxtLink>
    </div>
    <div v-else-if="loadingApps" class="text-center py-10">
      <p>Loading applications...</p>
    </div>
    <div v-else>
      <p class="mb-4">Welcome, {{ userStore.userDisplayName }}!</p>
      <!-- Admin-only Add button -->
      <div v-if="userStore.isAdmin" class="mb-6">
        <button
          @click="showAddAppModal = true"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Application
        </button>
      </div>

      <!-- Application List -->
      <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-3">Application List</h2>
        <div v-if="appsStore.error" class="text-red-500 mb-4">
          Error loading applications: {{ appsStore.error.message }}
        </div>
        <ul v-if="appsList.length > 0" class="space-y-3">
          <!-- Make list item a link -->
          <NuxtLink
            v-for="app in appsList"
            :key="app.id"
            :to="`/apps/${app.id}`"
            class="block p-3 bg-white dark:bg-gray-700 rounded shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-lg text-gray-900 dark:text-white">{{ app.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ app.description || 'No description' }}</p>
                <!-- Display Links -->
                <div v-if="app.links && Object.keys(app.links).length > 0" class="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                   <template v-for="(url, platform) in app.links" :key="platform">
                      <a :href="url" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-500 hover:underline flex items-center gap-1" @click.stop> <!-- Add @click.stop to prevent link navigation -->
                        <!-- Basic icon mapping -->
                        <span v-if="platform === 'googlePlay'" class="i-carbon-logo-google"></span>
                        <span v-else-if="platform === 'appStore'" class="i-carbon-logo-apple"></span>
                        <span v-else-if="platform === 'github'" class="i-carbon-logo-github"></span>
                        <span v-else-if="platform === 'npm'" class="i-carbon-logo-npm"></span>
                        <span v-else-if="platform === 'website'" class="i-carbon-link"></span>
                        <span class="capitalize">{{ String(platform).replace(/([A-Z])/g, ' $1').trim() }}</span>
                      </a>
                   </template>
                </div>
              </div>
              <!-- View Details Arrow -->
              <div class="flex items-center text-gray-400 dark:text-gray-500 ml-4 flex-shrink-0">
                 <span class="i-carbon-chevron-right text-xl"></span>
              </div>
            </div>
          </NuxtLink> <!-- Close NuxtLink -->
        </ul>
        <p v-else class="text-gray-600 dark:text-gray-400">
          No applications found.
        </p>
      </div>

      <!-- Add Application Modal -->
      <div v-if="showAddAppModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white dark:bg-gray-900">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
            Add New Application
          </h3>
          <form @submit.prevent="handleSaveApp">
             <div class="mb-4">
               <label for="addAppName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
               <input type="text" id="addAppName" v-model="appForm.name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white">
             </div>
             <div class="mb-4">
               <label for="addAppDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
               <textarea id="addAppDescription" v-model="appForm.description" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"></textarea>
             </div>
             <!-- Simplified Links for Add Modal -->
             <div v-if="appForm.links" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label for="addLinkGooglePlay" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Play URL</label>
                  <input type="url" id="addLinkGooglePlay" v-model="appForm.links.googlePlay" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="https://play.google.com/...">
                </div>
                <div>
                  <label for="addLinkAppStore" class="block text-sm font-medium text-gray-700 dark:text-gray-300">App Store URL</label>
                  <input type="url" id="addLinkAppStore" v-model="appForm.links.appStore" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="https://apps.apple.com/...">
                </div>
                 <div>
                   <label for="addLinkGithub" class="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
                   <input type="url" id="addLinkGithub" v-model="appForm.links.github" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="https://github.com/...">
                 </div>
                 <div>
                   <label for="addLinkNpm" class="block text-sm font-medium text-gray-700 dark:text-gray-300">NPM URL</label>
                   <input type="url" id="addLinkNpm" v-model="appForm.links.npm" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="https://www.npmjs.com/package/...">
                 </div>
                 <div class="sm:col-span-2">
                   <label for="addLinkWebsite" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
                   <input type="url" id="addLinkWebsite" v-model="appForm.links.website" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="https://...">
                 </div>
             </div>
             <!-- Removed AI buttons from Add modal -->
             <div class="items-center px-4 py-3 text-right">
               <button
                 type="button"
                 @click="closeModal"
                 class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
               >
                 Save
               </button>
             </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watchEffect } from 'vue'
import { useUserStore } from '~/stores/user'
import { useAppsStore } from '~/stores/apps'
import type { Application, AppFormData } from '~/stores/apps'

// Set auth middleware
definePageMeta({
  middleware: ['auth', 'admin-only'] // Ensure only admins can access
})

// Get stores
const userStore = useUserStore()
const appsStore = useAppsStore()

// UI state for Add Modal
const showAddAppModal = ref(false)
const appForm = reactive<AppFormData>({ // Form for adding new apps
  name: '',
  description: '',
  logoUrl: '', // Keep logoUrl for adding
  links: {
    googlePlay: '',
    appStore: '',
    github: '',
    npm: '',
    website: '',
  }
})

// Loading states
const loadingApps = computed(() => appsStore.loading)

// Data
const appsList = computed(() => appsStore.apps || [])

// Fetch apps data when authenticated
watchEffect(() => {
  if (userStore.isAuthenticated && !userStore.loading) {
    appsStore.fetchApps()
  }
})

// Function to close the Add modal
const closeModal = () => {
  showAddAppModal.value = false
  // Reset form
  appForm.name = ''
  appForm.description = ''
  appForm.logoUrl = ''
  appForm.links = {
    googlePlay: '',
    appStore: '',
    github: '',
    npm: '',
    website: '',
  }
}

// Function to handle saving (only adds new app)
const handleSaveApp = async () => {
  if (!userStore.isAdmin) return

  try {
    // Filter out empty links before saving
    const linksToSave = Object.entries(appForm.links || {})
      .filter(([key, value]) => value && value.trim() !== '')
      .reduce((obj, [key, value]) => {
        obj[key] = value.trim();
        return obj;
      }, {} as { [key: string]: string });

    const formDataToSave: AppFormData = {
      name: appForm.name,
      description: appForm.description,
      links: linksToSave,
      logoUrl: appForm.logoUrl,
    };

    await appsStore.createApp(formDataToSave)
    closeModal()
  } catch (error) {
    console.error("Error saving app:", error)
    // Consider showing an error toast to the user
    userStore.showToast('Failed to create application.', 'error');
  }
}

// Removed editApp, deleteApp, generateAppCopy, generateAppLogo, handleLogoError functions

</script>

<style scoped>
/* Add any page-specific styles here */
</style>