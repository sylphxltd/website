<template>
  <div>
    <!-- Back button and Page Title -->
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/apps" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1">
        <span class="i-carbon-arrow-left"></span>
        <span>Back to Apps</span>
      </NuxtLink>
    </div>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-10">Create New Application</h1>

    <form @submit.prevent="handleCreateApp" class="space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow">

      <!-- Name -->
      <div>
        <label for="appName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
        <input type="text" id="appName" v-model="newApp.name" required class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      </div>

      <!-- Logo URL (Optional + AI Gen) -->
       <div class="mb-4">
           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
           <div class="flex items-center gap-4">
               <template v-if="newApp.logoUrl">
                   <img
                     :src="newApp.logoUrl"
                     alt="App Logo Preview"
                     class="h-16 w-16 object-contain border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700"
                     @error="newApp.logoUrl = ''"
                   />
               </template>
               <template v-else>
                   <div class="h-16 w-16 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                       No Logo
                   </div>
               </template>
               <button
                  type="button"
                  @click="generateAppLogo"
                  :disabled="isGeneratingLogo || !newApp.name"
                  class="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                  title="Generate logo using AI (requires App Name)"
                >
                  <span v-if="isGeneratingLogo">Generating...</span>
                  <span v-else class="flex items-center gap-1">
                    <span class="i-carbon-image-search"></span> Generate Logo
                  </span>
                </button>
           </div>
            <p v-if="logoGenerationError" class="text-xs text-red-500 mt-1.5">{{ logoGenerationError }}</p>
            <input type="url" v-model="newApp.logoUrl" placeholder="Or paste Logo URL here" class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
       </div>

      <!-- Description (Optional + AI Gen) -->
      <div>
         <div class="flex justify-between items-center mb-1">
           <label for="appDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
           <button
             type="button"
             @click="generateAppCopy"
             :disabled="isGeneratingCopy || !newApp.name"
             class="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
             title="Generate description using AI (requires App Name)"
           >
             <span v-if="isGeneratingCopy">Generating...</span>
             <span v-else class="flex items-center gap-1">
               <span class="i-carbon-magic-wand-filled"></span> Generate
             </span>
           </button>
         </div>
         <textarea id="appDescription" v-model="newApp.description" rows="4" class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
         <p v-if="copyGenerationError" class="text-xs text-red-500 mt-1.5">{{ copyGenerationError }}</p>
      </div>

      <!-- Links - Add v-if to ensure links object exists -->
      <fieldset v-if="newApp.links" class="pt-6">
          <legend class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Store & Website Links</legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div>
               <label for="linkGooglePlay" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Google Play URL</label>
               <input type="url" id="linkGooglePlay" v-model="newApp.links.googlePlay" class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://play.google.com/...">
             </div>
             <div>
               <label for="linkAppStore" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">App Store URL</label>
               <input type="url" id="linkAppStore" v-model="newApp.links.appStore" class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://apps.apple.com/...">
             </div>
              <div>
                <label for="linkGithub" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">GitHub URL</label>
                <input type="url" id="linkGithub" v-model="newApp.links.github" class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://github.com/...">
              </div>
              <div>
                <label for="linkNpm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">NPM URL</label>
                <input type="url" id="linkNpm" v-model="newApp.links.npm" class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://www.npmjs.com/package/...">
              </div>
              <div class="sm:col-span-2">
                <label for="linkWebsite" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website URL</label>
                <input type="url" id="linkWebsite" v-model="newApp.links.website" class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://...">
              </div>
          </div>
      </fieldset>

      <!-- Platforms -->
       <fieldset class="pt-6">
          <legend class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platforms</legend>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3">
            <div v-for="platform in availablePlatforms" :key="platform.id" class="flex items-center">
              <input
                :id="`platform-${platform.id}`"
                type="checkbox"
                :value="platform.id"
                v-model="newApp.platforms"
                class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              >
              <label :for="`platform-${platform.id}`" class="ml-2 block text-sm text-gray-900 dark:text-gray-200">{{ platform.name }}</label>
            </div>
          </div>
       </fieldset>

       <!-- Status -->
       <div class="pt-6">
         <label for="appStatus" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Initial Status</label>
         <select id="appStatus" v-model="newApp.status" class="mt-1 block w-full max-w-xs px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
           <option value="draft">Draft</option>
           <option value="active">Active</option>
         </select>
       </div>

       <!-- App ID -->
       <div class="pt-6">
         <label for="appSpecificId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">App Specific ID (e.g., com.example.app)</label>
         <input type="text" id="appSpecificId" v-model="newApp.appId" class="mt-1 block w-full max-w-md px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="com.yourcompany.yourapp">
       </div>

       <!-- Tags -->
       <div class="pt-6">
         <label for="appTags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
         <input type="text" id="appTags" :value="newApp.tags?.join(', ')" @input="updateTags" class="mt-1 block w-full max-w-md px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Productivity, AI, Mobile">
       </div>

       <!-- Features -->
       <fieldset class="pt-6">
          <legend class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features</legend>
          <div v-for="(feature, index) in newApp.features" :key="index" class="flex gap-4 mb-3 items-start">
              <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                 <input type="text" v-model="feature.title" placeholder="Feature Title" class="sm:col-span-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                 <textarea v-model="feature.description" placeholder="Feature Description" rows="2" class="sm:col-span-2 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
              </div>
              <button type="button" @click="removeFeature(index)" class="mt-1 p-1 text-red-500 hover:text-red-700"><span class="i-carbon-trash-can"></span></button>
          </div>
          <button type="button" @click="addFeature" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">+ Add Feature</button>
       </fieldset>

       <!-- Screenshots -->
        <fieldset class="pt-6">
          <legend class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Screenshot URLs</legend>
          <div v-for="(url, index) in newApp.screenshotUrls" :key="index" class="flex gap-4 mb-3 items-center">
              <input
                type="url"
                :value="newApp.screenshotUrls?.[index] || ''"
                @input="updateScreenshotUrl(index, $event)"
                placeholder="https://..."
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
              <button type="button" @click="removeScreenshot(index)" class="p-1 text-red-500 hover:text-red-700"><span class="i-carbon-trash-can"></span></button>
          </div>
          <button type="button" @click="addScreenshot" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">+ Add Screenshot URL</button>
       </fieldset>

      <!-- Submit Button -->
      <div class="mt-8 pt-8 text-right">
        <button
          type="submit"
          :disabled="isSaving"
          class="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <span v-if="isSaving" class="i-carbon-circle-dash w-5 h-5 animate-spin mr-2"></span>
          {{ isSaving ? 'Creating...' : 'Create Application' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { getAuth } from 'firebase/auth';
import { useAppsStore } from '~/stores/apps';
import { useUserStore } from '~/stores/user';
import type { AppFormData } from '~/stores/apps';
import { useRouter } from 'vue-router';
import { useToastStore } from '~/stores/toast'; // Import toast store

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

const appsStore = useAppsStore();
const userStore = useUserStore();
const toastStore = useToastStore(); // Use toast store
const router = useRouter();

// Form data
const newApp = reactive<AppFormData>({
    name: '',
    description: '',
    logoUrl: '',
    links: { // Initialize links object
        googlePlay: '',
        appStore: '',
        github: '',
        npm: '',
        website: '',
    },
    platforms: [],
    status: 'draft',
    appId: '',
    tags: [],
    features: [], // Initialize as empty array
    screenshotUrls: [], // Initialize as empty array
});

// State for AI generation and saving
const isGeneratingCopy = ref(false);
const copyGenerationError = ref<string | null>(null);
const isGeneratingLogo = ref(false);
const logoGenerationError = ref<string | null>(null);
const isSaving = ref(false);

// Available platforms for checkbox selection
const availablePlatforms = [
    { id: 'ios', name: 'iOS' },
    { id: 'android', name: 'Android' },
    { id: 'web', name: 'Web' },
    { id: 'windows', name: 'Windows' },
    { id: 'macos', name: 'macOS' },
    { id: 'linux', name: 'Linux' },
    { id: 'github', name: 'GitHub (Source)' },
    { id: 'npm', name: 'NPM (Package)' },
];

// --- Methods ---

// Helper to update screenshot URL array safely
const updateScreenshotUrl = (index: number, event: Event) => {
    const target = event.target as HTMLInputElement;
    // Ensure array exists (it should due to reactive initialization)
    if (!newApp.screenshotUrls) newApp.screenshotUrls = []; 
    
    if (index < newApp.screenshotUrls.length) {
        newApp.screenshotUrls[index] = target.value;
    } else {
         newApp.screenshotUrls.push(target.value);
    }
};


const handleCreateApp = async () => {
  if (!userStore.isAdmin) return;
  isSaving.value = true;
  try {
    // Clean up links (remove empty ones)
    const linksToSave = Object.entries(newApp.links || {})
      .filter(([key, value]) => value && value.trim() !== '')
      .reduce((obj, [key, value]) => {
        obj[key] = value.trim();
        return obj;
      }, {} as { [key: string]: string });

    const formDataToSave: AppFormData = {
      ...newApp,
      links: linksToSave,
      // Ensure arrays are not undefined if empty
      platforms: newApp.platforms || [],
      tags: newApp.tags || [],
      features: newApp.features || [],
      screenshotUrls: newApp.screenshotUrls || [],
    };

    const newAppId = await appsStore.createApp(formDataToSave);
    toastStore.success('Application created successfully!'); // Use toast
    router.push(`/admin/apps/${newAppId}`); // Navigate to the new app's edit page

  } catch (error) {
    console.error("Error creating app:", error);
    const message = error instanceof Error ? error.message : 'Failed to create application.';
    toastStore.error(message); // Use toast
  } finally {
      isSaving.value = false;
  }
};

const generateAppCopy = async () => {
  if (!newApp.name || isGeneratingCopy.value) return;
  isGeneratingCopy.value = true;
  copyGenerationError.value = null;
  const originalDescription = newApp.description; // Keep original in case of error
  newApp.description = 'Generating...'; // Placeholder
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const response = await fetch('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ appName: newApp.name, appDescription: originalDescription }) // Pass original desc as context
    });
    if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ message: `API Error: ${response.statusText}` }));
        throw new Error(errorData.message || `Failed to fetch AI description (HTTP ${response.status})`);
    }

    // Handle streamed response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let generatedText = '';
    newApp.description = ''; // Clear placeholder
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        generatedText += decoder.decode(value, { stream: true });
        newApp.description = generatedText; // Update reactively
    }
     const finalChunk = decoder.decode(); // Get any remaining data
     if (finalChunk) newApp.description += finalChunk;
     if (!newApp.description) newApp.description = originalDescription; // Restore if empty

  } catch (err: unknown) {
    console.error("Error generating app copy:", err);
    const message = err instanceof Error ? err.message : "Failed to generate description.";
    copyGenerationError.value = message;
    newApp.description = originalDescription; // Restore original on error
    toastStore.error(message);
  } finally {
    isGeneratingCopy.value = false;
  }
};

const generateAppLogo = async () => {
  if (!newApp.name || isGeneratingLogo.value) return;
  isGeneratingLogo.value = true;
  logoGenerationError.value = null;
  const originalLogoUrl = newApp.logoUrl;
  // newApp.logoUrl = '/images/logo.png'; // Optional: Placeholder while generating
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const response = await fetch('/api/ai/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ appName: newApp.name }) // Add style prompt later if needed
    });
     if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.logoUrl) throw new Error("Logo URL not found in API response.");
    newApp.logoUrl = result.logoUrl; // Update logo URL
  } catch (err: unknown) {
    console.error("Error generating app logo:", err);
    const message = err instanceof Error ? err.message : "Failed to generate logo.";
    logoGenerationError.value = message;
    newApp.logoUrl = originalLogoUrl; // Restore original on error
    toastStore.error(message);
  } finally {
    isGeneratingLogo.value = false;
  }
};

// --- Methods for managing dynamic fields ---
const updateTags = (event: Event) => {
    const input = event.target as HTMLInputElement;
    newApp.tags = input.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
};

const addFeature = () => {
    if (!newApp.features) newApp.features = []; // Ensure array exists
    newApp.features.push({ title: '', description: '' });
};

const removeFeature = (index: number) => {
    newApp.features?.splice(index, 1);
};

const addScreenshot = () => {
    if (!newApp.screenshotUrls) newApp.screenshotUrls = []; // Ensure array exists
    newApp.screenshotUrls.push('');
};

const removeScreenshot = (index: number) => {
    newApp.screenshotUrls?.splice(index, 1);
};

</script>