<template>
  <div class="flex flex-col h-full">
    <!-- Page header -->
    <div class="sm:flex sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Media Publishing</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Create and publish content across various platforms with AI assistance.
        </p>
      </div>
      <!-- Add Connect Account button? -->
    </div>

    <!-- Main Layout (Editor + Preview/Publish) -->
    <div class="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">

      <!-- Editor Pane -->
      <div class="lg:w-2/3 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
           <input
             type="text"
             v-model="postTitle"
             placeholder="Post Title (optional, for Medium etc.)"
             class="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 mb-2"
           />
           <!-- Add Tag input if needed -->
        </div>
        <!-- Rich Text Editor -->
        <div class="flex-1 overflow-hidden">
           <ClientOnly> <!-- Ensure Milkdown only renders client-side -->
             <MilkdownEditorWrapper v-model="postBody" class="h-full" />
             <template #fallback>
                <div class="p-4 text-center text-gray-500">Loading Editor...</div>
             </template>
           </ClientOnly>
        </div>
      </div>

      <!-- Sidebar Pane (Platforms, AI Variations, Publish) -->
      <div class="lg:w-1/3 flex flex-col space-y-6">
         <!-- Connected Accounts -->
         <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Connected Platforms</h3>
            <div v-if="loadingAccounts" class="text-sm text-gray-500 dark:text-gray-400">Loading accounts...</div>
            <div v-else-if="error && !accounts.length" class="text-sm text-red-500 dark:text-red-400">{{ error }}</div>
            <div v-else-if="accounts.length === 0" class="text-sm text-gray-500 dark:text-gray-400">No platforms connected yet.</div>
            <ul v-else class="space-y-2">
               <li v-for="account in accounts" :key="account.id" class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="flex items-center">
                     <span :class="getPlatformIcon(account.platform)" class="text-xl mr-2 text-gray-600 dark:text-gray-300"></span>
                     <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ account.name }}</span>
                     <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">({{ account.platform }})</span>
                  </div>
                  <!-- Add disconnect button if needed -->
               </li>
            </ul>
            <!-- Add Connect Button Here -->
            <button class="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Connect New Platform</button>
         </div>

         <!-- Platform Selection & AI -->
         <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Publish To</h3>
            <div class="space-y-2 mb-4">
               <div v-for="account in accounts" :key="`sel-${account.id}`" class="flex items-center">
                  <input
                    :id="`platform-${account.id}`"
                    type="checkbox"
                    :value="account.platform"
                    v-model="selectedPlatforms"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label :for="`platform-${account.id}`" class="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                    {{ account.name }} ({{ account.platform }})
                  </label>
               </div>
            </div>
             <button
               @click="generateVariations"
               :disabled="generatingVariation || !postBody || selectedPlatforms.length === 0"
               class="w-full mb-3 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
             >
               <span v-if="generatingVariation" class="i-carbon-circle-dash w-4 h-4 animate-spin mr-1"></span>
               <span v-else class="i-carbon-ai-status mr-1"></span>
               Generate Platform Variations (AI)
             </button>
             <!-- Display generated variations here -->
             <div v-if="Object.keys(platformVariations).length > 0" class="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <p>AI generated variations for: {{ Object.keys(platformVariations).join(', ') }}</p>
                <!-- Add UI to view/edit variations -->
             </div>
         </div>

         <!-- Publish Action -->
         <div class="mt-auto">
             <button
               @click="publishContent"
               :disabled="publishing || !postBody || selectedPlatforms.length === 0"
               class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
             >
               <span v-if="publishing" class="i-carbon-circle-dash w-5 h-5 animate-spin mr-2"></span>
               Publish Now
             </button>
             <p v-if="error" class="text-sm text-red-600 dark:text-red-400 mt-2 text-center">{{ error }}</p>
         </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMediaStore, type MediaPostContent, type MediaAccount } from '~/stores/media';
import { useToastStore } from '~/stores/toast';
// Import Milkdown editor wrapper if it's a local component
// import MilkdownEditorWrapper from '~/components/MilkdownEditorWrapper.vue';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// --- Stores ---
const mediaStore = useMediaStore();
const toastStore = useToastStore();

// --- Local State ---
const postTitle = ref('');
const postBody = ref(''); // v-model for MilkdownEditorWrapper
const selectedPlatforms = ref<string[]>([]);
const platformVariations = ref<Record<string, string>>({}); // Store AI variations

// --- Store State Refs ---
const loadingAccounts = computed(() => mediaStore.loadingAccounts);
const publishing = computed(() => mediaStore.publishing);
const generatingVariation = computed(() => mediaStore.generatingVariation);
const error = computed(() => mediaStore.error);
const accounts = computed(() => mediaStore.accounts);

// --- Methods ---
const getPlatformIcon = (platform: string): string => {
    const map: Record<string, string> = {
        'medium': 'i-carbon-logo-medium',
        'x': 'i-carbon-logo-twitter', // Assuming 'x' uses twitter logo for now
        'facebook': 'i-carbon-logo-facebook',
        'linkedin': 'i-carbon-logo-linkedin',
    };
    return map[platform] || 'i-carbon-network-4'; // Default icon
};

const generateVariations = async () => {
    if (!postBody.value || selectedPlatforms.value.length === 0) return;

    platformVariations.value = {}; // Clear previous
    toastStore.info('Generating AI variations...');
    let success = true;

    for (const platform of selectedPlatforms.value) {
        const variation = await mediaStore.generatePlatformVariation(postBody.value, platform);
        if (variation) {
            platformVariations.value[platform] = variation;
        } else {
            success = false; // Mark if any generation failed
        }
    }
    if (success) {
        toastStore.success('AI variations generated.');
    } else {
         toastStore.warning('Some AI variations could not be generated.');
    }
};

const publishContent = () => {
    if (!postBody.value || selectedPlatforms.value.length === 0) {
        toastStore.error('Please write content and select at least one platform.');
        return;
    }

    const content: MediaPostContent = {
        title: postTitle.value || undefined,
        body: postBody.value, // Base content
        // TODO: Add tags if implemented
    };

    // TODO: Decide whether to send base content or AI variations
    // For now, sending base content
    mediaStore.publishPost(content, selectedPlatforms.value);

    // Optionally clear fields after publish attempt
    // postTitle.value = '';
    // postBody.value = '';
    // selectedPlatforms.value = [];
    // platformVariations.value = {};
};

// --- Lifecycle Hooks ---
onMounted(() => {
  mediaStore.fetchAccounts();
});

</script>