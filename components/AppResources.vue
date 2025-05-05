<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Resources</h3>
      <div>
        <label class="relative inline-flex items-center cursor-pointer mb-0">
          <input type="checkbox" v-model="showPublicOnly" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
          <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Public resources only</span>
        </label>
      </div>
    </div>

    <!-- Resource uploader -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white">Upload New Resource</h4>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <label for="resourceName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Resource Name *
          </label>
          <input
            type="text"
            id="resourceName"
            v-model="newResource.name"
            placeholder="Enter resource name"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label for="resourceType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            id="resourceType"
            v-model="newResource.type"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="document">Document</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="code">Code</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="md:col-span-3">
          <label for="resourceDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="resourceDescription"
            v-model="newResource.description"
            rows="2"
            placeholder="Brief description of the resource"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          ></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            File *
          </label>
          <div class="flex items-center">
            <label class="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none">
              <span class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">Select file</span>
              <input
                ref="fileInputRef"
                type="file"
                class="sr-only"
                @change="handleFileSelect"
              >
            </label>
            <p class="pl-3 text-sm text-gray-500 dark:text-gray-400 truncate" :title="selectedFileName">
              {{ selectedFileName || "No file selected" }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Visibility
          </label>
          <div class="flex items-center space-x-4">
            <label class="inline-flex items-center">
              <input type="radio" v-model="newResource.isPublic" :value="true" class="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Public</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="newResource.isPublic" :value="false" class="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Private</span>
            </label>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <button
          type="button"
          @click="uploadResource"
          :disabled="isUploading || !newResource.name || !selectedFile"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="isUploading" class="flex items-center">
            <span class="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
            Uploading...
          </span>
          <span v-else>Upload Resource</span>
        </button>
      </div>
    </div>

    <!-- Resources list -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="p-6 text-red-600 dark:text-red-400">
        <p>{{ error }}</p>
        <button @click="fetchResources(props.appId)" class="text-sm underline mt-1">Try again</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredResources.length === 0" class="p-10 text-center">
        <div class="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <span class="i-carbon-document text-2xl text-gray-400 dark:text-gray-500"></span>
        </div>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No resources found</h4>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ showPublicOnly ? "No public resources available. Try uploading some or showing private resources." : "Upload your first resource using the form above." }}
        </p>
      </div>

      <!-- Resources table -->
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Access
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="resource in filteredResources" :key="resource.id" class="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                      <span
                        :class="{
                          'i-carbon-document': resource.type === 'document',
                          'i-carbon-image': resource.type === 'image',
                          'i-carbon-video': resource.type === 'video',
                          'i-carbon-music': resource.type === 'audio',
                          'i-carbon-code': resource.type === 'code',
                          'i-carbon-document-unknown': resource.type === 'other' || !resource.type
                        }"
                        class="text-xl text-gray-500 dark:text-gray-400"
                      ></span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ resource.name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ resource.filename }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white capitalize">{{ resource.type || 'other' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white line-clamp-2">{{ resource.description || "No description" }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(resource.size) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(resource.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="resource.isPublic ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ resource.isPublic ? 'Public' : 'Private' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="downloadResource(resource)"
                      :disabled="downloadingId === resource.id"
                      class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 disabled:opacity-50"
                      title="Download"
                    >
                      <span v-if="downloadingId === resource.id" class="i-carbon-circle-dash animate-spin"></span>
                      <span v-else class="i-carbon-download"></span>
                    </button>
                    <button
                      @click="copyResourceLink(resource)"
                      :disabled="copyingId === resource.id"
                      class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 disabled:opacity-50"
                      title="Copy link"
                    >
                      <span v-if="copyingId === resource.id" class="i-carbon-circle-dash animate-spin"></span>
                      <span v-else class="i-carbon-link"></span>
                    </button>
                    <button
                      @click="confirmDeleteResource(resource)"
                      class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <span class="i-carbon-trash-can"></span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination (Placeholder - Add if needed) -->
        <!--
        <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          ... Pagination controls ...
        </div>
        -->
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Confirm Delete</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            Are you sure you want to delete <span class="font-semibold">{{ resourceToDelete?.name }}</span>? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-4 mt-6">
            <button @click="showDeleteModal = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md">
              Cancel
            </button>
            <button @click="deleteResource" :disabled="isDeleting" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts"> // Added lang="ts"
import { ref, computed, onMounted, watch } from 'vue';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import { useResourcesStore, type Resource } from '~/stores/resources'; // Import store and type
import { useToastStore } from '~/stores/toast'; // Import toast store

// Props
const props = defineProps<{
  appId: string;
}>();

// State
const userStore = useUserStore();
const resourcesStore = useResourcesStore(); // Use the dedicated store
const toastStore = useToastStore(); // Use toast store

// Use computed properties to get state from the store
const resources = computed(() => resourcesStore.resources);
const loading = computed(() => resourcesStore.loading);
const error = computed(() => resourcesStore.error);

const showPublicOnly = ref(false);
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null); // Ref for file input element
const isUploading = ref(false);
const showDeleteModal = ref(false);
const resourceToDelete = ref<Resource | null>(null); // Add type annotation
const isDeleting = ref(false);
const downloadingId = ref<string | null>(null); // Track which resource is downloading
const copyingId = ref<string | null>(null); // Track which resource link is being copied

// New resource form state
const newResource = ref({
  name: '',
  description: '',
  type: 'document',
  isPublic: true
});

// Computed
const filteredResources = computed<Resource[]>(() => { // Add explicit return type
  if (showPublicOnly.value) {
    // Ensure resource.isPublic exists before filtering
    // Assuming Resource type includes isPublic: boolean | undefined
    return resources.value.filter(resource => resource.isPublic === true);
  }
  return resources.value;
});

const selectedFileName = computed(() => {
  return selectedFile.value?.name || '';
});

// Methods
const fetchResources = (appId: string) => {
  resourcesStore.fetchResources(appId); // Call store action
};

const handleFileSelect = (event: Event) => { // Add type annotation
  const target = event.target as HTMLInputElement;
  selectedFile.value = target.files?.[0] || null;
};

// Define the structure for metadata expected by the store action
interface ResourceMetadata {
    name: string;
    description: string;
    type: string;
    isPublic: boolean;
}

const uploadResource = async () => {
  if (!selectedFile.value || !newResource.value.name || isUploading.value) return;

  isUploading.value = true;

  try {
    // Prepare metadata object
    const metadata: ResourceMetadata = {
        name: newResource.value.name,
        description: newResource.value.description,
        type: newResource.value.type,
        isPublic: newResource.value.isPublic,
    };
    // Call store action with file and metadata
    await resourcesStore.uploadResource(props.appId, selectedFile.value, metadata);

    // Reset form
    newResource.value = { name: '', description: '', type: 'document', isPublic: true };
    selectedFile.value = null;
    if (fileInputRef.value) { // Use correct ref name
      fileInputRef.value.value = ''; // Reset file input visually
    }
    // Toast is handled by the store action now

  } catch (err) {
    // Error handling might be redundant if store action handles toasts
    console.error('Upload failed in component:', err);
  } finally {
    isUploading.value = false;
  }
};

const downloadResource = async (resource: Resource) => { // Add type
  if (!resource.path || downloadingId.value === resource.id) return; // Check path exists

  downloadingId.value = resource.id;
  try {
    // Use the store action to get the URL
    const url = await resourcesStore.getDownloadUrl(resource.path);
    if (url) {
      window.open(url, '_blank'); // Open the signed URL
      // toastStore.success(`Download started for ${resource.name}`); // Optional: confirmation toast
    } else {
      // Error toast is shown by the store action if getDownloadUrl fails
    }
  } catch (err) {
      // Error handled by store action
      console.error("Component level download error:", err);
  } finally {
      downloadingId.value = null;
  }
};

const copyResourceLink = async (resource: Resource) => { // Add type and async
  if (!resource.path || copyingId.value === resource.id) return; // Check path exists

  copyingId.value = resource.id;
  try {
      // Use the store action to get a fresh URL
      const url = await resourcesStore.getDownloadUrl(resource.path);
      if (url) {
          await navigator.clipboard.writeText(url);
          toastStore.success('Resource link copied to clipboard');
      } else {
          // Error toast shown by store if URL generation fails
      }
  } catch (err) {
      console.error('Failed to copy link:', err);
      toastStore.error('Failed to copy link'); // Fallback error toast
  } finally {
      copyingId.value = null;
  }
};


const confirmDeleteResource = (resource: Resource) => { // Add type
  resourceToDelete.value = resource;
  showDeleteModal.value = true;
};

const deleteResource = async () => {
  if (!resourceToDelete.value || isDeleting.value) return;

  isDeleting.value = true;

  try {
    // Pass the Firestore document ID (resource.id) to the store action
    await resourcesStore.deleteResource(resourceToDelete.value.id);
    // Toast and list refresh are handled by the store action
    showDeleteModal.value = false; // Close modal on success

  } catch (err) {
    // Error handled by store action
    console.error('Component level delete error:', err);
  } finally {
    isDeleting.value = false;
    resourceToDelete.value = null; // Clear selection regardless of outcome
  }
};

const formatFileSize = (bytes: number | undefined | null): string => { // Add type annotation
  if (bytes === undefined || bytes === null || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (dateString: string | undefined | null): string => { // Add type annotation
  if (!dateString) return 'Unknown';
  try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return 'Invalid Date'; // Use Number.isNaN
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  } catch {
      return 'Invalid Date';
  }
};

// Initialize
onMounted(() => {
  fetchResources(props.appId); // Pass appId on initial fetch
});

// Watch for appId changes if the component might be reused without unmounting
watch(() => props.appId, (newAppId) => {
    if (newAppId) {
        fetchResources(newAppId);
    }
});
</script>