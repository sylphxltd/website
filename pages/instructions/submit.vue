<template>
  <div class="w-full max-w-3xl mx-auto px-4 md:px-6 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold mb-8 dark:text-white">Share New Instruction</h1>

    <!-- Require Login -->
    <div v-if="!userStore.isAuthenticated" class="p-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-center">
      <p class="mb-4">You need to be logged in to share an instruction.</p>
      <NuxtLink 
        to="/login" 
        class="inline-flex items-center justify-center px-4 py-2 text-sm bg-yellow-500 text-white font-medium rounded-md shadow-sm hover:bg-yellow-600 transition"
      >
        Login Now
      </NuxtLink>
    </div>

    <!-- Submission Form -->
    <form v-else @submit.prevent="submitInstruction" class="space-y-6">
      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input 
          type="text" 
          id="title" 
          v-model="formData.title" 
          required 
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
          placeholder="e.g., Vue 3 Refactoring Assistant"
        />
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea 
          id="description" 
          v-model="formData.description" 
          rows="3" 
          required 
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
          placeholder="Briefly explain what this instruction does and its purpose."
        ></textarea>
      </div>

      <!-- Milkdown Editor -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instruction Content</label>
        <div class="milkdown-editor-container border border-gray-300 dark:border-gray-600 rounded-md shadow-sm overflow-hidden min-h-[200px]">
          <!-- Nuxt automatically handles client-side rendering for .client.vue components -->
          <MilkdownEditorWrapper v-model="formData.content" />
        </div>
         <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Supports Markdown formatting.</p>
      </div>

      <!-- Tags Input -->
      <div>
        <label for="tags-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
        <div class="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700">
          <span
            v-for="(tag, index) in formData.tags"
            :key="tag"
            class="inline-flex items-center text-sm bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 py-1 pl-3 pr-1.5 rounded-full"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(index)"
              class="ml-1.5 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 focus:outline-none"
            >
              <span class="i-carbon-close text-xs"></span>
            </button>
          </span>
          <input
            type="text"
            id="tags-input"
            v-model="tagInput"
            @keydown="handleTagInputKeydown"
            class="flex-grow px-1 py-1 bg-transparent focus:outline-none dark:text-white"
            placeholder="Add tags (press Enter or comma)..."
          />
        </div>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate tags with Enter or comma. Press Backspace to delete the last tag if input is empty.</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
        {{ error }}
      </div>

      <!-- Submit Button -->
      <div class="pt-4">
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-2"></span>
          <span v-else class="i-carbon-send mr-2"></span>
          Submit Instruction
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, shallowRef } from 'vue' // Added shallowRef
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { useToastStore } from '~/stores/toast'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'


// Note: Milkdown core/theme CSS needs to be imported globally in nuxt.config.ts

const userStore = useUserStore()
const toastStore = useToastStore()
const currentUser = useCurrentUser() // Get reactive current user
const router = useRouter()

const formData = reactive({
  title: '',
  description: '',
  content: '',
  tags: []
})
const tagInput = ref('')
const loading = ref(false)
const error = ref(null)

// No need for editor setup logic here anymore, it's in MilkdownEditor.vue

// --- Tag Input Logic ---
function addTag(tag) {
  const cleanedTag = tag.trim().toLowerCase();
  if (cleanedTag && !formData.tags.includes(cleanedTag)) {
    formData.tags.push(cleanedTag);
  }
}

function removeTag(index) {
  formData.tags.splice(index, 1);
}

function handleTagInputKeydown(event) {
  // Add tag on Enter or Comma
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault(); // Prevent form submission on Enter
    addTag(tagInput.value);
    tagInput.value = ''; // Clear input
  }
  // Remove last tag on Backspace if input is empty
  else if (event.key === 'Backspace' && tagInput.value === '' && formData.tags.length > 0) {
    removeTag(formData.tags.length - 1);
  }
}
// --- End Tag Input Logic ---

watch(() => formData.content, (newValue) => {
  // Update the model value in the editor component
  // This is handled in MilkdownEditor.vue now
  console.log('Content updated:', newValue)
})
async function submitInstruction() {
  if (!userStore.isAuthenticated || !userStore.userEmail) {
    error.value = 'Authentication error. Please log in again.'
    return
  }
  if (!formData.title || !formData.description || !formData.content) {
    error.value = 'Please fill in all required fields (Title, Description, Content).'
    return;
  }

  loading.value = true
  error.value = null

  try {
    const db = useFirestore()
    const instructionsColRef = collection(db, 'custom_instructions')

    // Ensure currentUser is loaded before accessing uid
    if (!currentUser.value?.uid) {
      throw new Error("User ID not available. Please ensure you are logged in.");
    }

    const newInstructionData = {
      title: formData.title,
      description: formData.description,
      content: formData.content,
      tags: formData.tags,
      authorId: currentUser.value.uid, // Use reactive currentUser
      authorName: userStore.userDisplayName, // Use computed property from store
      createdAt: serverTimestamp(), // Use Firestore server timestamp
      // Add other fields like upvotes, usage count later if needed
    };
    
    const docRef = await addDoc(instructionsColRef, newInstructionData);
    
    toastStore.success('Instruction submitted successfully!')
    
    // Clear form
    formData.title = '';
    formData.description = '';
    formData.content = '';
    formData.tags = [];
    tagInput.value = '';

    // Redirect to the new instruction's page
    await router.push(`/instructions/${docRef.id}`);

  } catch (err) {
    console.error('Error submitting instruction:', err)
    error.value = 'Failed to submit instruction. Please try again.'
    toastStore.error(error.value)
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Share New AI Instruction - Sylphx',
  meta: [
    { name: 'description', content: 'Share your custom AI instructions with the community.' }
  ]
})
</script>