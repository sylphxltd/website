<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Application Management</h1>

    <!-- Main content with v-if structure that works properly -->
    <div v-if="!userStore.isAuthenticated" class="text-center py-10">
      <p class="text-red-500">Please log in to manage applications.</p>
      <NuxtLink to="/login" class="text-blue-500 hover:underline">Go to Login</NuxtLink>
    </div>
    
    <div v-else-if="loadingApps" class="text-center py-10">
      <p>Loading applications...</p>
      <!-- TODO: Add a proper spinner component -->
    </div>

    <div v-else-if="userStore.isAuthenticated">
      <p class="mb-4">Welcome, {{ userStore.userDisplayName }}!</p>
      <!-- Display isAdmin status directly -->
      <p class="mb-4">Is Admin: {{ userStore.isAdmin ? 'Yes' : 'No' }}</p>
      <!-- Admin-only actions -->
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
        <!-- Use fetchError (error state from useAsyncData) -->
        <div v-if="appsStore.error" class="text-red-500 mb-4">
          Error loading applications: {{ appsStore.error.message }}
        </div>
        <!-- Use computed appsList which defaults to [] -->
        <ul v-if="appsList.length > 0" class="space-y-3">
          <li v-for="app in appsList" :key="app.id" class="p-3 bg-white dark:bg-gray-700 rounded shadow-sm flex justify-between items-center">
            <div>
              <h3 class="font-medium">{{ app.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ app.description || 'No description' }}</p>
              <!-- Display links later -->
            </div>
            <!-- Admin-only buttons -->
            <div v-if="userStore.isAdmin" class="space-x-2">
               <button @click="editApp(app)" class="text-sm text-blue-500 hover:underline">Edit</button>
               <button @click="deleteApp(app.id)" class="text-sm text-red-500 hover:underline">Delete</button>
            </div>
          </li> <!-- Correctly closing li tag -->
        </ul>
        <!-- This p tag should be adjacent to the ul -->
        <p v-else class="text-gray-600 dark:text-gray-400">
          No applications found.
        </p>
      </div>

      <!-- Add/Edit Application Modal (Combined - Placeholder Structure) -->
      <div v-if="showAddAppModal || editingApp" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div class="relative p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white dark:bg-gray-900">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
            {{ editingApp ? 'Edit Application' : 'Add New Application' }}
          </h3>
          <form @submit.prevent="handleSaveApp">
             <div class="mb-4">
               <label for="appName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
               <input type="text" id="appName" v-model="appForm.name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white">
             </div>
             <div class="mb-4">
               <label for="appDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
               <textarea id="appDescription" v-model="appForm.description" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"></textarea>
             </div>
             <!-- TODO: Add fields for links (Google Play, App Store, GitHub, etc.) -->
             <p class="text-sm text-gray-500 mb-4">(Fields for store links will go here)</p>

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
                 {{ editingApp ? 'Update' : 'Save' }}
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

// Set auth middleware (now simplified to just mark protected routes)
definePageMeta({
  middleware: ['auth']
})

// Get stores
const userStore = useUserStore()
const appsStore = useAppsStore()

// UI state
const showAddAppModal = ref(false)
const editingApp = ref<Application | null>(null)
const appForm = reactive<AppFormData>({
  name: '',
  description: '',
})

// Computed property for loading state
const loadingApps = computed(() => appsStore.loading)

// Computed property for apps list
const appsList = computed(() => appsStore.apps || [])

// Fetch apps data when authenticated
watchEffect(() => {
  if (userStore.isAuthenticated && !userStore.loading) {
    appsStore.fetchApps()
  }
})


// Function to open the modal for editing
const editApp = (app: Application) => {
  editingApp.value = { ...app }
  appForm.name = app.name
  appForm.description = app.description || ''
}

// Function to close the modal
const closeModal = () => {
  showAddAppModal.value = false
  editingApp.value = null
  appForm.name = ''
  appForm.description = ''
}

// Function to handle saving (add or update)
const handleSaveApp = async () => {
  if (!userStore.isAdmin) return

  try {
    if (editingApp.value) {
      await appsStore.updateApp(editingApp.value.id, appForm)
    } else {
      await appsStore.createApp(appForm)
    }
    closeModal()
  } catch (error) {
    console.error("Error saving app:", error)
  }
}

// Function for deleting an app
const deleteApp = async (appId: string) => {
  if (!userStore.isAdmin) return
  if (!confirm('Are you sure you want to delete this application? This cannot be undone.')) {
    return
  }
  
  try {
    await appsStore.deleteApp(appId)
  } catch (error) {
    console.error("Error deleting app:", error)
  }
}

</script>

<style scoped>
/* Add any page-specific styles here */
</style>