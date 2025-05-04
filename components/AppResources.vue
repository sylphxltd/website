<template>
  <div>
    <!-- Upload Section -->
    <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 class="text-lg font-semibold mb-3">Upload New Resource</h3>
      <div v-if="uploadError" class="text-red-500 text-sm mb-2">{{ uploadError }}</div>
      <input type="file" @change="handleFileSelect" ref="fileInputRef" class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800 mb-2" :disabled="isUploading">
      <button
        @click="uploadFile"
        :disabled="!selectedFile || isUploading"
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isUploading ? 'Uploading...' : 'Upload File' }}
      </button>
       <p v-if="isUploading && uploadProgress !== null" class="text-sm text-gray-600 dark:text-gray-300 mt-1">Progress: {{ uploadProgress }}%</p>
    </div>

    <!-- File List Section -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
       <h3 class="text-lg font-semibold p-4 border-b dark:border-gray-700">Uploaded Resources</h3>
       <div v-if="loadingFiles" class="p-4 text-center">Loading files...</div>
       <div v-else-if="fetchError" class="p-4 text-red-500">Error loading files: {{ fetchError }}</div>
       <div v-else-if="files.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">No resources uploaded for this app yet.</div>
       <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <li v-for="file in files" :key="file.path" class="px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700">
             <div>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{ file.name }}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ formatFileSize(file.size) }}) - Updated: {{ new Date(file.updated).toLocaleDateString() }}</span>
             </div>
             <div class="space-x-2">
                 <button @click="downloadFile(file.path)" class="text-sm text-blue-500 hover:underline" title="Download">Download</button>
                 <button
                   @click="deleteFile(file)"
                   :disabled="deletingPath === file.path"
                   class="text-sm text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <span v-if="deletingPath === file.path">Deleting...</span>
                    <span v-else>Delete</span>
                 </button>
             </div>
          </li>
       </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineProps } from 'vue';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'; // Client-side storage SDK

// Interface for file data from API
interface StorageFile {
    name: string;
    path: string;
    size: number;
    updated: string;
}

const props = defineProps<{
  appId: string
}>();

const userStore = useUserStore();
const files = ref<StorageFile[]>([]);
const loadingFiles = ref(false);
const fetchError = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null); // Ref for file input
const isUploading = ref(false);
const uploadProgress = ref<number | null>(null);
const uploadError = ref<string | null>(null);
const deletingPath = ref<string | null>(null);

const fetchFiles = async () => {
  if (!props.appId) return;
  loadingFiles.value = true;
  fetchError.value = null;
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const response = await $fetch<{ files: StorageFile[] }>('/api/resources/list', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${idToken}` },
      query: { appId: props.appId }
    });
    files.value = response.files;
  } catch (err: unknown) {
    console.error("Error fetching files:", err);
    let errorMsg = "Failed to load files.";
     if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data) {
        errorMsg = err.data.message as string;
    } else if (err instanceof Error) {
        errorMsg = err.message;
    }
    fetchError.value = errorMsg;
    userStore.showToast(errorMsg, 'error');
  } finally {
    loadingFiles.value = false;
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    uploadError.value = null;
  } else {
    selectedFile.value = null;
  }
};

const uploadFile = async () => {
  if (!selectedFile.value || !props.appId || isUploading.value) return;

  isUploading.value = true;
  uploadError.value = null;
  uploadProgress.value = 0;

  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const formData = new FormData();
    formData.append('appId', props.appId);
    formData.append('file', selectedFile.value, selectedFile.value.name);

    await $fetch('/api/resources/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${idToken}` },
      body: formData,
    });

    userStore.showToast('File uploaded successfully!', 'success');
    selectedFile.value = null;
    if (fileInputRef.value) fileInputRef.value.value = ''; // Reset file input
    await fetchFiles();

  } catch (err: unknown) {
    console.error("Error uploading file:", err);
    let errorMsg = "Failed to upload file.";
     if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data) {
        errorMsg = err.data.message as string;
    } else if (err instanceof Error) {
        errorMsg = err.message;
    }
    uploadError.value = errorMsg;
    userStore.showToast(errorMsg, 'error');
  } finally {
    isUploading.value = false;
    uploadProgress.value = null;
  }
};

const deleteFile = async (file: StorageFile) => {
    if (deletingPath.value) return;
    if (!confirm(`Are you sure you want to delete "${file.name}"? This cannot be undone.`)) {
        return;
    }

    deletingPath.value = file.path;
    let errorMsg = "Failed to delete file.";
    try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error("Authentication token not found.");

        await $fetch('/api/resources/delete', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filePath: file.path })
        });

        userStore.showToast(`File "${file.name}" deleted successfully.`, 'success');
        await fetchFiles();

    } catch (err: unknown) {
        console.error("Error deleting file:", err);
         if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data) {
            errorMsg = err.data.message as string;
        } else if (err instanceof Error) {
             errorMsg = err.message;
        }
        userStore.showToast(errorMsg, 'error');
    } finally {
        deletingPath.value = null;
    }
};

const downloadFile = async (filePath: string) => {
    try {
        const storage = getStorage();
        const fileRef = storageRef(storage, filePath);
        const url = await getDownloadURL(fileRef);
        window.open(url, '_blank');
    } catch (error) {
        console.error("Error getting download URL:", error);
        userStore.showToast('Failed to get download link. Check permissions or file existence.', 'error');
    }
};

const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
};

// Fetch files when component mounts or appId changes
watch(() => props.appId, (newAppId) => {
    if (newAppId && userStore.isAuthenticated) {
        fetchFiles();
    }
}, { immediate: true }); // Fetch immediately on mount if appId is available

watch(() => userStore.isAuthenticated, (isAuth) => {
    if (isAuth && props.appId && files.value.length === 0 && !loadingFiles.value) {
        fetchFiles();
    }
});

</script>