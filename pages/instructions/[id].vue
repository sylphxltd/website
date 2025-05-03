<template>
  <div class="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
    <!-- Back Button -->
    <NuxtLink to="/instructions" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
      <span class="i-carbon-arrow-left mr-1"></span>
      Back to Instructions
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <div class="i-carbon-circle-dash animate-spin text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4"></div>
      <p class="text-gray-500 dark:text-gray-400">Loading instruction...</p>
    </div>
  
    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
      <p>Error loading instruction: {{ error.message }}</p>
    </div>
    
    <!-- Not Found State -->
    <div v-else-if="!instruction" class="text-center py-10">
      <p class="text-xl font-semibold mb-4 dark:text-white">Instruction Not Found</p>
      <p class="text-gray-500 dark:text-gray-400 mb-6">The instruction you are looking for does not exist or may have been removed.</p>
      <NuxtLink to="/instructions" class="text-blue-600 dark:text-blue-400 hover:underline">Return to Instructions List</NuxtLink>
    </div>
  
    <!-- Instruction Details -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-10">
      <h1 class="text-3xl sm:text-4xl font-bold mb-3 dark:text-white">{{ instruction.title }}</h1>
      
      <!-- Author and Date -->
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-700 pb-4">
        Shared by
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ instruction.authorName || 'Anonymous' }}</span>
        <span v-if="instruction.createdAt">on {{ formatDate(instruction.createdAt) }}</span>
      </p>
  
      <!-- Tags -->
      <div v-if="instruction.tags && instruction.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="tag in instruction.tags"
          :key="tag"
          @click="navigateToTag(tag)"
          class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-3 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition"
        >
          #{{ tag }}
        </button>
      </div>
  
      <!-- Description -->
      <p v-if="instruction.description" class="text-gray-700 dark:text-gray-300 mb-8 text-base leading-relaxed">{{ instruction.description }}</p>
  
      <!-- Instruction Content (Rendered Markdown) -->
      <div class="mb-4">
        <h2 class="text-xl font-semibold mb-3 dark:text-white">Instruction Content</h2>
        <div class="relative prose dark:prose-invert max-w-none p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div v-html="renderedContent"></div>
          <button
            @click="copyInstruction"
            class="absolute top-2 right-2 p-1.5 bg-gray-300 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600 transition opacity-70 hover:opacity-100"
            title="Copy Instruction"
          >
            <span v-if="copied" class="i-carbon-checkmark text-base"></span>
            <span v-else class="i-carbon-copy text-base"></span>
          </button>
        </div>
      </div>
  
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue' // Added computed
import { useRoute, useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import { useToastStore } from '~/stores/toast'
import MarkdownIt from 'markdown-it' // Import markdown-it

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const instructionId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id; // Ensure ID is a string

// Import Firestore functions
import { doc } from 'firebase/firestore'
import { useDocument, useFirestore } from 'vuefire'

const db = useFirestore()
const instructionDocRef = doc(db, 'custom_instructions', instructionId)

// Use useDocument for reactive data fetching
const { data: instruction, pending: loading, error } = useDocument(instructionDocRef)

// --- Markdown Rendering ---
const md = new MarkdownIt({
  html: false, // Disable HTML tags in source
  linkify: true, // Autoconvert URL-like text to links
  typographer: true, // Enable some language-neutral replacement + quotes beautification
});

const renderedContent = computed(() => {
  if (instruction.value?.content) {
    return md.render(instruction.value.content);
  }
  return '';
});
// --- End Markdown Rendering ---


// Clipboard functionality
// Copy the raw Markdown content, not the rendered HTML
const { copy, copied, isSupported } = useClipboard({ source: () => instruction.value?.content || '' })

async function copyInstruction() {
  if (!isSupported.value) {
    toastStore.error('Clipboard API not supported in your browser.')
    return
  }
  try {
    await copy()
    toastStore.success('Instruction copied to clipboard!')
  } catch (e) {
    toastStore.error('Failed to copy instruction.')
    console.error(e)
  }
}

// Placeholder for date formatting
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
}

// Placeholder for tag navigation
function navigateToTag(tag) {
  router.push(`/instructions?tag=${encodeURIComponent(tag)}`)
}

// No need for manual onMounted fetching, useDocument handles it.

// Set head based on fetched data (using watchEffect for reactivity)
import { watchEffect } from 'vue'
useHead(() => ({
  title: instruction.value ? `${instruction.value.title} - AI Instructions` : 'AI Instruction - Sylphx',
  meta: [
    { name: 'description', content: instruction.value ? instruction.value.description : 'View details for an AI custom instruction.' }
  ]
}))

</script>