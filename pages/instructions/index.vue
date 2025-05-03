<template>
  <div class="w-full max-w-7xl mx-auto px-4 md:px-6 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold mb-4 dark:text-white">AI Custom Instructions</h1>
    
    <!-- Search and Filter Section -->
    <div class="mb-8">
      <!-- Search Input (Placeholder for future) -->
      <!--
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search instructions..."
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white mb-4"
      />
      -->
      
      <!-- Tag Filter Display -->
      <div v-if="selectedTag" class="flex items-center gap-2 mb-4">
        <span class="text-gray-600 dark:text-gray-400">Filtering by tag:</span>
        <span class="inline-flex items-center text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-3 rounded-full">
          #{{ selectedTag }}
          <button @click="clearTagFilter" class="ml-1.5 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100">
            <span class="i-carbon-close text-xs"></span>
          </button>
        </span>
      </div>
      <!-- Popular Tags Buttons -->
      <div class="mb-6 flex flex-wrap gap-2">
         <span class="text-sm text-gray-500 dark:text-gray-400 mr-2">Popular tags:</span>
         <button
            v-for="tag in popularTags"
            :key="tag"
            @click="selectedTag = tag; router.push({ query: { ...route.query, tag: tag } })"
            class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1 px-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            :class="{ '!bg-blue-200 !dark:bg-blue-800 !text-blue-800 !dark:text-blue-100': selectedTag === tag }"
          >
            #{{ tag }}
          </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-16">
      <div class="i-carbon-circle-dash animate-spin text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4"></div>
      <p class="text-gray-500 dark:text-gray-400">Loading instructions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
      <p>Error loading instructions: {{ error.message }}</p>
    </div>

    <!-- Instructions List -->
    <div v-else-if="instructions && instructions.length > 0" class="space-y-6">
      <div
        v-for="instruction in instructions"
        :key="instruction.id"
        class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-transparent hover:border-blue-200 dark:hover:border-gray-700"
      >
        <h2 class="text-xl font-semibold mb-1 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ instruction.title }}</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
          By {{ instruction.authorName || 'Anonymous' }} on {{ formatDate(instruction.createdAt) }}
        </p>
        <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{{ instruction.description }}</p>
        <div v-if="instruction.tags && instruction.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
          <!-- Make tags clickable to filter -->
          <button
            v-for="tag in instruction.tags"
            :key="tag"
            @click="selectedTag = tag; router.push({ query: { ...route.query, tag: tag } })"
            class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1 px-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            :class="{ '!bg-blue-200 !dark:bg-blue-800 !text-blue-800 !dark:text-blue-100': selectedTag === tag }"
          >
            #{{ tag }}
          </button>
        </div>
        <NuxtLink :to="`/instructions/${instruction.id}`" class="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm">View Details &rarr;</NuxtLink>
      </div>
    </div>
    
    <!-- No Instructions State -->
    <div v-else class="text-center py-10">
       <p class="text-gray-500 dark:text-gray-400">No instructions shared yet. Be the first!</p>
    </div>

    <!-- Add New Instruction Button -->
    <div class="mt-10 text-center">
      <NuxtLink 
        to="/instructions/submit" 
        class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-1 hover:shadow-xl"
      >
        <span class="i-carbon-add mr-2"></span>
        Share New Instruction
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { collection, query, orderBy, where } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import { useRoute, useRouter } from 'vue-router'

const db = useFirestore()
const route = useRoute()
const router = useRouter()
const instructionsRef = collection(db, 'custom_instructions')

// State for filtering
const searchQuery = ref('') // For future search implementation
const selectedTag = ref(route.query.tag || '') // Initialize from URL query

// Predefined popular tags (can be dynamic later)
const popularTags = ref(['vue', 'typescript', 'firebase', 'roo', 'refactor', 'debug', 'ai']);

// Dynamically build the query based on filters
const instructionsQuery = computed(() => {
  let q = query(instructionsRef, orderBy('createdAt', 'desc'));
  
  // Apply tag filter if selectedTag exists
  if (selectedTag.value) {
    q = query(q, where('tags', 'array-contains', selectedTag.value));
  }
  
  // Add search query filter later if needed
  // if (searchQuery.value) { ... }

  return q;
});

// Use useCollection with the computed query
const { data: instructions, pending, error } = useCollection(instructionsQuery)

// Update selectedTag when route query changes (e.g., clicking a tag on detail page)
watch(() => route.query.tag, (newTag) => {
  selectedTag.value = newTag || '';
});

// Function to clear the tag filter
function clearTagFilter() {
  selectedTag.value = '';
  // Update URL without the tag query parameter
  router.push({ query: { ...route.query, tag: undefined } });
}

// Helper function for date formatting (can be moved to a utils file later)
function formatDate(timestamp) {
  if (!timestamp?.seconds) return 'N/A';
  try {
    // Convert Firestore Timestamp to Date
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
}

// Define meta tags for the page
useHead({
  title: 'AI Custom Instructions - Sylphx',
  meta: [
    { name: 'description', content: 'Browse and share custom instructions for various AI tools.' }
  ]
})
</script>