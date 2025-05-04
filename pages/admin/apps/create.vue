<template>
  <div>
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/apps" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1">
        <span class="i-carbon-arrow-left"></span>
        <span>Back to Apps</span>
      </NuxtLink>
    </div>
    
    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Create New Application</h1>
    
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <form @submit.prevent="handleCreateApp">
        <!-- Name -->
        <div class="mb-6">
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
          <input 
            type="text" 
            id="name" 
            v-model="newApp.name" 
            required
            class="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Application name"
          >
        </div>
        
        <!-- Logo -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo</label>
          <div class="flex items-center gap-4">
            <div v-if="newApp.logoUrl" class="h-16 w-16 border rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <img :src="newApp.logoUrl" alt="Logo Preview" class="h-full w-full object-contain" @error="handleLogoError">
            </div>
            <div v-else class="h-16 w-16 border rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
              No Logo
            </div>
            <button
              type="button"
              @click="generateAppLogo"
              :disabled="isGeneratingLogo || !newApp.name"
              class="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <span v-if="isGeneratingLogo">Generating...</span>
              <span v-else>
                <span class="i-carbon-image-search"></span>
                Generate Logo
              </span>
            </button>
          </div>
          <input
            type="url"
            v-model="newApp.logoUrl"
            class="mt-2 block w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Or paste logo URL here"
          >
          <p v-if="logoGenerationError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ logoGenerationError }}</p>
        </div>
        
        <!-- Description -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <button
              type="button"
              @click="generateAppCopy"
              :disabled="isGeneratingCopy || !newApp.name"
              class="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <span v-if="isGeneratingCopy">Generating...</span>
              <span v-else>
                <span class="i-carbon-magic-wand-filled"></span>
                Generate Description
              </span>
            </button>
          </div>
          <textarea
            id="description"
            v-model="newApp.description"
            rows="3"
            class="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Application description"
          ></textarea>
          <p v-if="descriptionGenerationError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ descriptionGenerationError }}</p>
        </div>
        
        <!-- Links -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">External Links</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="googlePlay" class="block text-sm text-gray-500 dark:text-gray-400 mb-1">Google Play</label>
              <input 
                type="url" 
                id="googlePlay" 
                v-model="newApp.links.googlePlay" 
                class="block w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://play.google.com/..."
              >
            </div>
            <div>
              <label for="appStore" class="block text-sm text-gray-500 dark:text-gray-400 mb-1">App Store</label>
              <input 
                type="url" 
                id="appStore" 
                v-model="newApp.links.appStore" 
                class="block w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://apps.apple.com/..."
              >
            </div>
            <div>
              <label for="github" class="block text-sm text-gray-500 dark:text-gray-400 mb-1">GitHub</label>
              <input 
                type="url" 
                id="github" 
                v-model="newApp.links.github" 
                class="block w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://github.com/..."
              >
            </div>
            <div>
              <label for="npm" class="block text-sm text-gray-500 dark:text-gray-400 mb-1">NPM</label>
              <input 
                type="url" 
                id="npm" 
                v-model="newApp.links.npm" 
                class="block w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://www.npmjs.com/package/..."
              >
            </div>
            <div class="md:col-span-2">
              <label for="website" class="block text-sm text-gray-500 dark:text-gray-400 mb-1">Website</label>
              <input 
                type="url" 
                id="website" 
                v-model="newApp.links.website" 
                class="block w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              >
            </div>
          </div>
        </div>
        
        <!-- Submit button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isCreating || !newApp.name"
            class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isCreating ? 'Creating...' : 'Create Application' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { useAppsStore } from '~/stores/apps';
import { useUserStore } from '~/stores/user';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Get router and stores
const router = useRouter();
const appsStore = useAppsStore();
const userStore = useUserStore();

// Form data
const newApp = reactive({
  name: '',
  description: '',
  logoUrl: '',
  links: {
    googlePlay: '',
    appStore: '',
    github: '',
    npm: '',
    website: ''
  }
});

// Status flags
const isCreating = ref(false);
const isGeneratingLogo = ref(false);
const isGeneratingCopy = ref(false);
const logoGenerationError = ref(null);
const descriptionGenerationError = ref(null);

// Create the app
const handleCreateApp = async () => {
  if (!newApp.name || isCreating.value) return;
  
  isCreating.value = true;
  
  try {
    // Clean up the links object to only include non-empty links
    const filteredLinks = Object.entries(newApp.links)
      .filter(([_, value]) => value && value.trim() !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = value.trim();
        return acc;
      }, {});
    
    // Create the form data
    const formData = {
      name: newApp.name,
      description: newApp.description || '',
      logoUrl: newApp.logoUrl || '',
      links: filteredLinks
    };
    
    // Create the app
    const appId = await appsStore.createApp(formData);
    userStore.showToast(`Application "${newApp.name}" created successfully!`, 'success');
    
    // Navigate to the app detail page
    router.push(`/admin/apps/${appId}`);
  } catch (error) {
    console.error('Error creating app:', error);
    userStore.showToast('Failed to create application', 'error');
  } finally {
    isCreating.value = false;
  }
};

// Generate app logo using AI
const generateAppLogo = async () => {
  if (!newApp.name || isGeneratingLogo.value) return;
  
  isGeneratingLogo.value = true;
  logoGenerationError.value = null;
  const originalLogoUrl = newApp.logoUrl;
  
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const response = await fetch('/api/ai/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ appName: newApp.name })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.logoUrl) throw new Error("Logo URL not found in API response.");
    
    newApp.logoUrl = result.logoUrl;
  } catch (err) {
    console.error("Error generating app logo:", err);
    logoGenerationError.value = err instanceof Error ? err.message : "Failed to generate logo.";
    newApp.logoUrl = originalLogoUrl;
    userStore.showToast(logoGenerationError.value, 'error');
  } finally {
    isGeneratingLogo.value = false;
  }
};

// Generate app description using AI
const generateAppCopy = async () => {
  if (!newApp.name || isGeneratingCopy.value) return;
  
  isGeneratingCopy.value = true;
  descriptionGenerationError.value = null;
  const originalDescription = newApp.description;
  newApp.description = 'Generating...';
  
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Authentication token not found.");

    const response = await fetch('/api/ai/generate-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
      body: JSON.stringify({ appName: newApp.name, appDescription: originalDescription })
    });
    
    if (!response.ok || !response.body) throw new Error('Failed to fetch AI description.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let generatedText = '';
    newApp.description = '';
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      generatedText += decoder.decode(value, { stream: true });
      newApp.description = generatedText;
    }
    
    const finalChunk = decoder.decode();
    if (finalChunk) newApp.description += finalChunk;
    if (!newApp.description) newApp.description = originalDescription;
  } catch (err) {
    console.error("Error generating app copy:", err);
    descriptionGenerationError.value = err instanceof Error ? err.message : "Failed to generate description.";
    newApp.description = originalDescription;
    userStore.showToast(descriptionGenerationError.value, 'error');
  } finally {
    isGeneratingCopy.value = false;
  }
};

// Handle logo loading error
const handleLogoError = () => {
  console.warn("Logo failed to load");
  newApp.logoUrl = '';
};
</script>