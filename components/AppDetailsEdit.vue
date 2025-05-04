<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded shadow">
    <h3 class="text-xl font-semibold mb-4">Edit App Details</h3>
    <form @submit.prevent="handleSaveApp">
       <!-- Name -->
       <div class="mb-4">
         <label for="appName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
         <input type="text" id="appName" v-model="editableApp.name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
       </div>

       <!-- Logo -->
       <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
          <div class="flex items-center gap-4">
              <img
                v-if="editableApp.logoUrl"
                :src="editableApp.logoUrl"
                alt="App Logo Preview"
                class="h-16 w-16 object-contain border rounded bg-gray-100 dark:bg-gray-700"
                @error="handleLogoError"
              />
              <div v-else class="h-16 w-16 border rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                  No Logo
              </div>
              <button
                 type="button"
                 @click="generateAppLogo"
                 :disabled="isGeneratingLogo || !editableApp.name"
                 class="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                 title="Generate logo using AI (requires App Name)"
               >
                 <span v-if="isGeneratingLogo">Generating...</span>
                 <span v-else class="flex items-center gap-1">
                   <span class="i-carbon-image-search"></span> Generate Logo
                 </span>
               </button>
          </div>
           <p v-if="logoGenerationError" class="text-xs text-red-500 mt-1">{{ logoGenerationError }}</p>
           <input type="url" v-model="editableApp.logoUrl" placeholder="Or paste Logo URL here" class="mt-2 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white">
       </div>

       <!-- Description -->
       <div class="mb-4">
         <div class="flex justify-between items-center mb-1">
           <label for="appDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
           <button
             type="button"
             @click="generateAppCopy"
             :disabled="isGeneratingCopy || !editableApp.name"
             class="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
             title="Generate description using AI (requires App Name)"
           >
             <span v-if="isGeneratingCopy">Generating...</span>
             <span v-else class="flex items-center gap-1">
               <span class="i-carbon-magic-wand-filled"></span> Generate
             </span>
           </button>
         </div>
         <textarea id="appDescription" v-model="editableApp.description" rows="3" class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
         <p v-if="generationError" class="text-xs text-red-500 mt-1">{{ generationError }}</p>
       </div>

       <!-- Links -->
       <div v-if="editableApp.links" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="editLinkGooglePlay" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Play URL</label>
            <input type="url" id="editLinkGooglePlay" v-model="editableApp.links.googlePlay" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://play.google.com/...">
          </div>
          <div>
            <label for="editLinkAppStore" class="block text-sm font-medium text-gray-700 dark:text-gray-300">App Store URL</label>
            <input type="url" id="editLinkAppStore" v-model="editableApp.links.appStore" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://apps.apple.com/...">
          </div>
           <div>
             <label for="editLinkGithub" class="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
             <input type="url" id="editLinkGithub" v-model="editableApp.links.github" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://github.com/...">
           </div>
           <div>
             <label for="editLinkNpm" class="block text-sm font-medium text-gray-700 dark:text-gray-300">NPM URL</label>
             <input type="url" id="editLinkNpm" v-model="editableApp.links.npm" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://www.npmjs.com/package/...">
           </div>
           <div class="sm:col-span-2">
             <label for="editLinkWebsite" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
             <input type="url" id="editLinkWebsite" v-model="editableApp.links.website" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://...">
           </div>
       </div>

       <!-- Save Button -->
       <div class="mt-6 text-right">
         <button
           type="submit"
           :disabled="isSaving"
           class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {{ isSaving ? 'Saving...' : 'Save Changes' }}
         </button>
       </div>
    </form>

     <!-- Delete Button -->
     <div class="mt-10 pt-6 border-t border-red-300 dark:border-red-700">
        <h4 class="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h4>
        <button
           @click="deleteApp"
           :disabled="isDeleting"
           class="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {{ isDeleting ? 'Deleting...' : 'Delete Application' }}
         </button>
         <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone.</p>
     </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';
import { getAuth } from 'firebase/auth';
import { useAppsStore } from '~/stores/apps';
import { useUserStore } from '~/stores/user';
import type { Application, AppFormData } from '~/stores/apps';
import { useRouter } from 'vue-router'; // Import useRouter

const props = defineProps<{
  app: Application
}>();

const emit = defineEmits(['app-updated']);

const appsStore = useAppsStore();
const userStore = useUserStore();
const router = useRouter(); // Initialize router

// Create a reactive copy for editing
const editableApp = reactive<AppFormData>({
    name: '',
    description: '',
    logoUrl: '',
    links: {}
});

// State for AI generation and saving
const isGeneratingCopy = ref(false);
const generationError = ref<string | null>(null);
const isGeneratingLogo = ref(false);
const logoGenerationError = ref<string | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);

// Initialize editableApp when the prop changes
watch(() => props.app, (newApp) => {
    if (newApp) {
        editableApp.name = newApp.name || '';
        editableApp.description = newApp.description || '';
        editableApp.logoUrl = newApp.logoUrl || '';
        // Ensure links object exists and copy properties
        editableApp.links = {
            googlePlay: newApp.links?.googlePlay || '',
            appStore: newApp.links?.appStore || '',
            github: newApp.links?.github || '',
            npm: newApp.links?.npm || '',
            website: newApp.links?.website || '',
            ...(newApp.links || {}) // Preserve other links
        };
    }
}, { immediate: true }); // Run immediately to initialize

// --- Re-implement functions from apps/index.vue ---

const handleSaveApp = async () => {
  if (!userStore.isAdmin || !props.app) return;
  isSaving.value = true;
  try {
    const linksToSave = Object.entries(editableApp.links || {})
      .filter(([key, value]) => value && value.trim() !== '')
      .reduce((obj, [key, value]) => {
        obj[key] = value.trim();
        return obj;
      }, {} as { [key: string]: string });

    const formDataToSave: AppFormData = {
      name: editableApp.name,
      description: editableApp.description,
      links: linksToSave,
      logoUrl: editableApp.logoUrl,
    };
    await appsStore.updateApp(props.app.id, formDataToSave);
    userStore.showToast('App details updated successfully!', 'success');
    emit('app-updated'); // Notify parent to refresh
  } catch (error) {
    console.error("Error saving app:", error);
    userStore.showToast('Failed to update application.', 'error');
  } finally {
      isSaving.value = false;
  }
};

const generateAppCopy = async () => {
  if (!editableApp.name || isGeneratingCopy.value) return;
  isGeneratingCopy.value = true;
  generationError.value = null;
  const originalDescription = editableApp.description;
  editableApp.description = 'Generating...';
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const response = await fetch('/api/ai/generate-copy', { /* ... API call ... */
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ appName: editableApp.name, appDescription: originalDescription })
    });
    if (!response.ok || !response.body) throw new Error('Failed to fetch AI description.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let generatedText = '';
    editableApp.description = '';
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        generatedText += decoder.decode(value, { stream: true });
        editableApp.description = generatedText;
    }
     const finalChunk = decoder.decode();
     if (finalChunk) editableApp.description += finalChunk;
     if (!editableApp.description) editableApp.description = originalDescription;

  } catch (err: unknown) {
    console.error("Error generating app copy:", err);
    generationError.value = err instanceof Error ? err.message : "Failed to generate description.";
    editableApp.description = originalDescription;
    userStore.showToast(generationError.value, 'error');
  } finally {
    isGeneratingCopy.value = false;
  }
};

const generateAppLogo = async () => {
  if (!editableApp.name || isGeneratingLogo.value) return;
  isGeneratingLogo.value = true;
  logoGenerationError.value = null;
  const originalLogoUrl = editableApp.logoUrl;
  editableApp.logoUrl = '/images/logo.png'; // Placeholder
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const response = await fetch('/api/ai/generate-logo', { /* ... API call ... */
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ appName: editableApp.name })
    });
     if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.logoUrl) throw new Error("Logo URL not found in API response.");
    editableApp.logoUrl = result.logoUrl;
  } catch (err: unknown) {
    console.error("Error generating app logo:", err);
    logoGenerationError.value = err instanceof Error ? err.message : "Failed to generate logo.";
    editableApp.logoUrl = originalLogoUrl;
    userStore.showToast(logoGenerationError.value, 'error');
  } finally {
    isGeneratingLogo.value = false;
  }
};

const handleLogoError = () => {
  console.warn("Logo failed to load, using fallback.");
  editableApp.logoUrl = '/images/logo.png';
};

const deleteApp = async () => {
  if (!props.app || isDeleting.value) return;
  if (!confirm(`Are you sure you want to delete "${props.app.name}"? This cannot be undone.`)) {
    return;
  }
  isDeleting.value = true;
  try {
    await appsStore.deleteApp(props.app.id);
    userStore.showToast(`Application "${props.app.name}" deleted successfully.`, 'success');
    router.push('/apps'); // Redirect back to list after deletion
  } catch (error) {
    console.error("Error deleting app:", error);
     userStore.showToast('Failed to delete application.', 'error');
  } finally {
      isDeleting.value = false;
  }
};

</script>