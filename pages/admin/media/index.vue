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
            <button @click="openMediumConnectModal" class="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Connect New Platform</button>
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
             <!-- Display generated variations and selection UI -->
             <div v-if="Object.keys(platformVariations).length > 0 && selectedPlatforms.length > 0" class="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review and Select Content:</h4>
                <div v-for="platform in selectedPlatforms.filter(p => platformVariations[p])" :key="`var-${platform}`" class="border border-gray-200 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-750">
                   <details class="group">
                      <summary class="flex justify-between items-center cursor-pointer list-none">
                         <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ accounts.find(a => a.platform === platform)?.name }} ({{ platform }})</span>
                         <span class="text-xs text-indigo-600 dark:text-indigo-400 group-open:hidden">Show Comparison</span>
                         <span class="text-xs text-indigo-600 dark:text-indigo-400 hidden group-open:inline">Hide Comparison</span>
                      </summary>
                      <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-3">
                         <!-- Selection Radio Buttons -->
                         <fieldset class="mb-3">
                            <legend class="sr-only">Select content version for {{ platform }}</legend>
                            <div class="flex items-center space-x-4">
                               <div class="flex items-center">
                                  <input :id="`orig-${platform}`" :name="`version-${platform}`" type="radio" value="original" v-model="selectedContentVersions[platform]" class="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-500 focus:ring-indigo-500">
                                  <label :for="`orig-${platform}`" class="ml-2 block text-xs font-medium text-gray-700 dark:text-gray-300">Use Original</label>
                               </div>
                               <div class="flex items-center">
                                  <input :id="`ai-${platform}`" :name="`version-${platform}`" type="radio" value="ai" v-model="selectedContentVersions[platform]" class="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-500 focus:ring-indigo-500">
                                  <label :for="`ai-${platform}`" class="ml-2 block text-xs font-medium text-gray-700 dark:text-gray-300">Use AI Variation</label>
                               </div>
                            </div>
                         </fieldset>
                         <!-- Content Comparison -->
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                               <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Original</label>
                               <textarea readonly class="w-full h-32 p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 resize-none">{{ postBody }}</textarea>
                            </div>
                            <div>
                               <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">AI Variation</label>
                               <textarea readonly class="w-full h-32 p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 resize-none">{{ platformVariations[platform] }}</textarea>
                            </div>
                         </div>
                      </div>
                   </details>
                </div>
                <p v-if="selectedPlatforms.some(p => !platformVariations[p])" class="text-xs text-yellow-600 dark:text-yellow-400">
                   Note: Some selected platforms do not have an AI variation generated or available. The original content will be used for these.
                </p>
             </div>
             <div v-else-if="generatingVariation" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Generating variations...
             </div>
             <div v-else-if="selectedPlatforms.length > 0 && !generatingVariation && Object.keys(platformVariations).length === 0" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Click "Generate Platform Variations" to create AI-powered content suggestions.
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

    <!-- Medium Connection Modal -->
    <div v-if="showMediumConnectModal" class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay, show/hide based on modal state. -->
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
        </div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                Connect to Medium
              </h3>
              <div class="mt-4 space-y-4">
                <div>
                  <label for="mediumIntegrationToken" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Medium Integration Token</label>
                  <input
                    type="password"
                    name="mediumIntegrationToken"
                    id="mediumIntegrationToken"
                    v-model="mediumIntegrationToken"
                    class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your Medium Integration Token"
                  />
                </div>
                <div>
                  <label for="mediumUserId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Medium User ID</label>
                  <input
                    type="text"
                    name="mediumUserId"
                    id="mediumUserId"
                    v-model="mediumUserId"
                    class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your Medium User ID (from profile URL)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="handleConnectMedium"
              :disabled="connectingMedium"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <span v-if="connectingMedium" class="i-carbon-circle-dash w-5 h-5 animate-spin mr-2"></span>
              Connect
            </button>
            <button
              type="button"
              @click="showMediumConnectModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'; // Added watch
import { useMediaStore, type MediaPostContent, type MediaAccount } from '~/stores/media';
import { useToastStore } from '~/stores/toast';
import { getAuth, getIdToken } from 'firebase/auth'; // Import Firebase auth functions

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
// $fetch should be globally available in Nuxt 3 setup scripts

// --- Local State ---
const postTitle = ref('');
const postBody = ref(''); // v-model for MilkdownEditorWrapper
const selectedPlatforms = ref<string[]>([]);
const platformVariations = ref<Record<string, string>>({}); // Store AI variations
const selectedContentVersions = ref<Record<string, 'original' | 'ai'>>({}); // Store user choice for each platform

// Medium Connection Modal State
const showMediumConnectModal = ref(false);
const mediumIntegrationToken = ref('');
const mediumUserId = ref('');
const connectingMedium = ref(false);


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
    // Reset selections to 'original' when new variations are generated
    for (const platform of selectedPlatforms.value) {
        if (platformVariations.value[platform]) {
            selectedContentVersions.value[platform] = 'original';
        }
    }
};

// Watch for changes in selected platforms to manage selectedContentVersions
watch(selectedPlatforms, (newPlatforms, oldPlatforms) => {
    const added = newPlatforms.filter(p => !oldPlatforms?.includes(p));
    const removed = oldPlatforms?.filter(p => !newPlatforms.includes(p)) ?? [];

    // Initialize new selections to 'original'
    for (const platform of added) {
        // Only initialize if a variation exists or might exist later
        // We default to original anyway if no variation is present at publish time
        selectedContentVersions.value[platform] = 'original';
    }

    // Remove selections for deselected platforms
    for (const platform of removed) {
        delete selectedContentVersions.value[platform];
    }

    // Also clear variations if no platforms are selected
    if (newPlatforms.length === 0) {
        platformVariations.value = {};
    }
}, { deep: true });


const publishContent = () => {
    if (!postBody.value || selectedPlatforms.value.length === 0) {
        toastStore.error('Please write content and select at least one platform.');
        return;
    }

    // Prepare the payload based on user selections
    const finalContentPayload: Record<string, MediaPostContent> = {};

    for (const platform of selectedPlatforms.value) {
        const versionChoice = selectedContentVersions.value[platform] ?? 'original';
        const bodyContent = (versionChoice === 'ai' && platformVariations.value[platform])
                            ? platformVariations.value[platform]
                            : postBody.value;

        finalContentPayload[platform] = {
            title: postTitle.value || undefined, // Use the same title for all for now
            body: bodyContent,
            // TODO: Add platform-specific tags if needed
        };
} // Closing brace for the for...of loop
    if (Object.keys(finalContentPayload).length === 0) {
        toastStore.error('No platforms selected or content available for publishing.');
        return;
    }

    mediaStore.publishPost(finalContentPayload);

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

// --- Medium Connection Methods ---
const openMediumConnectModal = () => {
  mediumIntegrationToken.value = '';
  mediumUserId.value = '';
  connectingMedium.value = false;
  showMediumConnectModal.value = true;
};

const handleConnectMedium = async () => {
  if (!mediumIntegrationToken.value || !mediumUserId.value) {
    toastStore.error('Medium Integration Token and User ID are required.');
    return;
  }

  connectingMedium.value = true;
  toastStore.info('Connecting to Medium...');

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      toastStore.error('You must be logged in to connect a platform.');
      connectingMedium.value = false;
      return;
    }

    const idToken = await getIdToken(user);

    // Define an expected response type, even if it's just a success message
    type MediumConnectResponse = { success: boolean; message?: string; [key: string]: unknown };

    const response = await $fetch<MediumConnectResponse>('/api/media/connect/medium.post', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: {
        integrationToken: mediumIntegrationToken.value,
        mediumUserId: mediumUserId.value,
      },
    });

    // Assuming the API returns a success message or specific data
    if (response?.success) {
      toastStore.success(response.message || 'Medium connection initiated successfully!');
      showMediumConnectModal.value = false;
      console.log("TODO: After successful connection, should ideally refresh connected accounts list from store or update store state.");
      // mediaStore.fetchAccounts(); // Potentially call this to refresh
    } else {
      // This else might not be hit if $fetch throws an error for non-2xx responses
      toastStore.error(response?.message || 'Failed to initiate Medium connection. Please try again.');
    }
  } catch (err: unknown) {
    console.error('Error connecting to Medium:', err);
    let errorMessage = 'An unknown error occurred while connecting to Medium.';
    if (typeof err === 'object' && err !== null) {
      const errorObject = err as { data?: { message?: string }; message?: string };
      errorMessage = errorObject.data?.message || errorObject.message || errorMessage;
    }
    toastStore.error(`Error: ${errorMessage}`);
  } finally {
    connectingMedium.value = false;
  }
};

</script>