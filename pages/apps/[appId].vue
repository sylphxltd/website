<template>
  <div class="container mx-auto px-4 py-8">
    <NuxtLink to="/apps" class="text-blue-500 hover:underline mb-4 inline-block">< Back to App List</NuxtLink>

    <div v-if="loadingApp" class="text-center py-10">Loading app details...</div>
    <div v-else-if="!app" class="text-center py-10 text-red-500">App not found.</div>
    <div v-else>
      <h1 class="text-3xl font-bold mb-6">{{ app.name }}</h1>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            @click="currentTab = tab.name"
            :class="[
              currentTab === tab.name
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div>
        <!-- Details / Edit Tab -->
        <div v-if="currentTab === 'details'">
          <AppDetailsEdit :app="app" @app-updated="refreshAppDetails" />
        </div>

        <!-- Resources Tab -->
        <div v-if="currentTab === 'resources'">
           <AppResources :app-id="appId" />
        </div>

        <!-- Reviews Tab -->
        <div v-if="currentTab === 'reviews'">
           <AppReviews :app="app" />
        </div>

        <!-- Email Tab -->
        <div v-if="currentTab === 'emails'">
           <AppEmails :app="app" />
        </div>

        <!-- Media Tab -->
        <div v-if="currentTab === 'media'">
           <AppMediaPublisher :app="app" />
        </div>

        <!-- Add other tabs as needed -->

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAppsStore } from '~/stores/apps';
import { useUserStore } from '~/stores/user';
import type { Application } from '~/stores/apps';

// Import child components
import AppDetailsEdit from '~/components/AppDetailsEdit.vue';
import AppResources from '~/components/AppResources.vue';
import AppReviews from '~/components/AppReviews.vue';
import AppEmails from '~/components/AppEmails.vue';
import AppMediaPublisher from '~/components/AppMediaPublisher.vue'; // Import AppMediaPublisher


definePageMeta({
  middleware: ['auth', 'admin-only']
});

const route = useRoute();
const appsStore = useAppsStore();
const userStore = useUserStore();
const appId = computed(() => route.params.appId as string);

const app = ref<Application | null>(null);
const loadingApp = ref(false);
const currentTab = ref('details'); // Default tab

const tabs = [
  { name: 'details', label: 'Details & Edit' },
  { name: 'resources', label: 'Resource Library' },
  { name: 'reviews', label: 'Store Reviews' },
  { name: 'emails', label: 'Email Support' },
  { name: 'media', label: 'Media Publisher' }, // Add Media tab
  // Add more tabs here
];

const fetchAppDetails = async () => {
  if (!appId.value) return;
  loadingApp.value = true;
  // Attempt to find in store first
  const existingApp = appsStore.apps.find(a => a.id === appId.value);
  if (existingApp) {
    app.value = { ...existingApp }; // Use a copy
    loadingApp.value = false;
  } else {
    // If not in store, fetch all apps again (or implement fetch single app)
    console.warn("App not found in store, fetching all apps again...");
    await appsStore.fetchApps();
    // Try finding again
    const fetchedApp = appsStore.apps.find(a => a.id === appId.value);
    if (fetchedApp) {
        app.value = { ...fetchedApp };
    } else {
        console.error("App still not found after refetching.");
        // Handle app not found error state
        app.value = null; // Explicitly set to null if not found
    }
    loadingApp.value = false;
  }
};

// Function to refresh details (e.g., after update in child component)
const refreshAppDetails = async () => {
    await fetchAppDetails();
}

onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchAppDetails();
  }
});

watch(() => userStore.isAuthenticated, (isAuth) => {
    if (isAuth && !app.value) {
        fetchAppDetails();
    }
});

// Watch for route changes if user navigates between app detail pages
watch(appId, (newAppId) => {
    if (newAppId && userStore.isAuthenticated) {
        fetchAppDetails();
        currentTab.value = 'details'; // Reset to default tab on app change
    }
});

</script>

<style scoped>
/* Add any page-specific styles here */
</style>