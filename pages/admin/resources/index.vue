<template>
  <div>
    <!-- Page header -->
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Resources Management</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Manage and organize resources for your applications.
        </p>
      </div>
      <!-- Upload button moved near the list/app selector -->
    </div>

    <!-- App Selector and Upload - Increased gap and margin -->
    <div class="mb-10 flex flex-col sm:flex-row gap-6 items-start">
       <!-- App Selector Dropdown - Use rounded-lg -->
       <div class="flex-1 w-full sm:w-auto">
         <label for="app-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Application</label>
         <select
           id="app-select"
           v-model="selectedAppId"
           @change="onAppSelectionChange"
           class="block w-full py-2.5 pl-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
           :disabled="appsLoading"
         >
           <option :value="null" disabled>-- Select an App --</option>
           <option v-if="appsLoading" :value="null" disabled>Loading apps...</option>
           <option v-for="app in apps" :key="app.id" :value="app.id">
             {{ app.name }} ({{ app.id }})
           </option>
           <option v-if="!appsLoading && apps.length === 0" :value="null" disabled>No applications found</option>
         </select>
       </div>

       <!-- Upload Section (only show if an app is selected) -->
       <div v-if="selectedAppId" class="w-full sm:w-auto sm:pt-7">
         <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" />
         <button
           @click="triggerFileInput"
           :disabled="uploading"
           class="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
         >
           <span v-if="!uploading" class="i-carbon-upload mr-1.5"></span>
           <span v-else class="i-carbon-circle-dash w-4 h-4 animate-spin mr-1.5"></span>
           {{ uploading ? 'Uploading...' : 'Upload Resource' }}
         </button>
       </div>
    </div>

    <!-- Resource List Area -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="p-10 text-center text-gray-500 dark:text-gray-400">
        <span class="i-carbon-circle-dash w-8 h-8 animate-spin inline-block mb-2"></span>
        Loading resources...
      </div>
      <div v-else-if="!selectedAppId" class="p-12 text-center text-gray-500 dark:text-gray-400">
        Please select an application above to view its resources.
      </div>
      <div v-else-if="error" class="p-10 text-center text-red-600 dark:text-red-400">
        Error loading resources: {{ error }}
      </div>
      <div v-else-if="resources.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
        No resources found for this application. Use the button above to upload one.
      </div>
      <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="resource in resources" :key="resource.id" class="px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
          <div class="flex items-center min-w-0 gap-4">
             <!-- Icon based on content type -->
             <span :class="getResourceIcon(resource.contentType)" class="text-2xl text-gray-500 dark:text-gray-400 flex-shrink-0"></span>
             <div class="min-w-0 flex-1">
               <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ resource.name }}</p>
               <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                 {{ formatBytes(resource.size) }} - {{ resource.contentType }}
               </p>
               <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                 Uploaded: {{ formatDate(resource.createdAt) }}
               </p>
             </div>
          </div>
          <div class="ml-4 flex-shrink-0 flex space-x-2">
            <!-- Download Button -->
            <button
              @click="downloadResource(resource)"
              :disabled="downloading[resource.id]"
              class="p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50"
              title="Download"
            >
              <span v-if="downloading[resource.id]" class="i-carbon-circle-dash w-4 h-4 animate-spin"></span>
              <span v-else class="i-carbon-download"></span>
            </button>
            <button @click="showDeleteConfirm(resource)" class="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" title="Delete">
              <span class="i-carbon-trash-can"></span>
            </button>
          </div>
        </li>
      </ul>
      <!-- Add Pagination controls here if implemented -->
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useResourcesStore, type Resource } from '~/stores/resources';
import { useAppsStore, type Application } from '~/stores/apps'; // Import apps store
import { useToastStore } from '~/stores/toast';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// --- Stores ---
const resourcesStore = useResourcesStore();
const appsStore = useAppsStore(); // Use apps store to get app list
const toastStore = useToastStore();

// --- Refs ---
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const downloading = ref<Record<string, boolean>>({}); // Initialize download loading state

// --- Store State ---
const loading = computed(() => resourcesStore.loading);
const error = computed(() => resourcesStore.error);
const resources = computed(() => resourcesStore.resources);
const selectedAppId = ref<string | null>(resourcesStore.selectedAppId); // Initialize from store

const appsLoading = computed(() => appsStore.loading);
const apps = computed(() => appsStore.apps);

// --- Methods ---
const onAppSelectionChange = () => {
  resourcesStore.fetchResources(selectedAppId.value);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && selectedAppId.value) {
    uploading.value = true; // Set uploading state
    await resourcesStore.uploadResource(selectedAppId.value, file);
    uploading.value = false; // Reset uploading state
    // Clear file input value to allow uploading the same file again
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } else if (!selectedAppId.value) {
      toastStore.error("Please select an application first.");
  }
};

const showDeleteConfirm = (resource: Resource) => {
  // TODO: Replace confirm with a UI component
  if (confirm(`Are you sure you want to delete "${resource.name}"? This action cannot be undone.`)) {
    resourcesStore.deleteResource(resource);
  }
};

// Download resource
const downloadResource = async (resource: Resource) => {
    downloading.value[resource.id] = true;
    const url = await resourcesStore.getDownloadUrl(resource.path);
    if (url) {
        // Open the URL in a new tab to trigger download
        window.open(url, '_blank');
    }
    // Error handling is done via toast in the store action
    downloading.value[resource.id] = false;
};

// Helper to format bytes
function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
}

// Helper to format date
const formatDate = (timestamp: string | undefined | null): string => {
  if (!timestamp) return 'Unknown';
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  } catch (e) {
    return 'Invalid Date';
  }
};

// Helper for resource icons
const getResourceIcon = (contentType: string): string => {
  if (contentType.startsWith('image/')) return 'i-carbon-image';
  if (contentType.startsWith('video/')) return 'i-carbon-video';
  if (contentType.startsWith('audio/')) return 'i-carbon-volume-up';
  if (contentType === 'application/pdf') return 'i-carbon-document-pdf';
  if (contentType.includes('zip') || contentType.includes('compressed')) return 'i-carbon-zip';
  if (contentType.startsWith('text/')) return 'i-carbon-document';
  return 'i-carbon-attachment'; // Default icon
};

// --- Watchers ---
// Watch the store's selectedAppId in case it changes elsewhere (optional)
watch(() => resourcesStore.selectedAppId, (newAppId) => {
  selectedAppId.value = newAppId;
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  // Fetch the list of apps for the selector
  await appsStore.fetchApps(); // Assuming this fetches all apps needed for the dropdown
  // If an app was already selected in the store, fetch its resources
  if (selectedAppId.value) {
    await resourcesStore.fetchResources(selectedAppId.value);
  }
});
</script>