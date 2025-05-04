<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-16">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header section -->
      <div class="max-w-4xl mx-auto text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Our Products &amp; Applications
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Discover our innovative apps, games, and immersive experiences powered by cutting-edge technology.
        </p>
      </div>
      
      <!-- Filter and search bar -->
      <div class="max-w-5xl mx-auto mb-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div class="flex flex-col lg:flex-row gap-4 items-center">
          <div class="w-full lg:flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="i-carbon-search text-gray-400 dark:text-gray-500"></span>
              </div>
              <input 
                v-model="search" 
                type="text" 
                class="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="Search products..."
              />
            </div>
          </div>
          
          <div class="flex flex-wrap justify-center gap-2">
            <button 
              v-for="category in categories" 
              :key="category.id"
              @click="toggleCategory(category.id)"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                selectedCategories.includes(category.id) 
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ category.name }}
            </button>
            
            <button 
              v-if="selectedCategories.length > 0"
              @click="clearFilters"
              class="px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      <!-- Product Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id" 
          class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <!-- Product Header with Gradient -->
          <div 
            :class="[
              'h-48 relative overflow-hidden',
              product.gradientClass || 'bg-gradient-to-br from-indigo-500 to-purple-600' 
            ]"
          >
            <!-- Logo/Icon -->
            <div class="absolute top-6 left-6">
              <div class="h-16 w-16 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                <img v-if="product.logoUrl" :src="product.logoUrl" :alt="product.name" class="h-10 w-10 object-contain">
                <span v-else class="text-2xl font-bold" :class="product.iconTextColor || 'text-indigo-600'">
                  {{ product.name.charAt(0) }}
                </span>
              </div>
            </div>
            
            <!-- Category tags -->
            <div class="absolute top-6 right-6 flex flex-wrap justify-end gap-2">
              <span 
                v-for="tag in product.tags" 
                :key="tag"
                class="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium"
              >
                {{ tag }}
              </span>
            </div>
            
            <!-- Screenshot Preview (decorative) -->
            <div class="absolute -bottom-10 right-6 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-lg transform rotate-12 border border-white/20"></div>
          </div>
          
          <!-- Product Content -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {{ product.name }}
            </h3>
            
            <p class="text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
              {{ product.description }}
            </p>
            
            <div class="flex items-center justify-between">
              <!-- Platform Labels -->
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="platform in product.platforms" 
                  :key="platform.name"
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    platform.class || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  ]"
                >
                  {{ platform.name }}
                </span>
              </div>
              
              <!-- View Details Link -->
              <NuxtLink 
                :to="`/apps/${product.id}`"
                class="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                Details
                <span class="i-carbon-arrow-right ml-1"></span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div 
        v-if="filteredProducts.length === 0" 
        class="py-20 text-center max-w-md mx-auto"
      >
        <div class="h-20 w-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <span class="i-carbon-search-locate text-3xl text-gray-400 dark:text-gray-500"></span>
        </div>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't find any products matching your search criteria. Please try different filters.
        </p>
        <button 
          @click="clearFilters" 
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>
      
      <!-- Featured Product Section -->
      <div class="mt-32 max-w-6xl mx-auto">
        <div class="lg:flex lg:items-center lg:gap-12">
          <div class="lg:w-1/2 mb-10 lg:mb-0">
            <div class="relative">
              <!-- Decorative elements -->
              <div class="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
              
              <!-- Product image/mockup -->
              <div class="relative z-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl">
                <!-- This would be replaced with an actual product mockup image -->
                <div class="aspect-[4/3] bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span class="text-6xl text-white/80">VR</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="lg:w-1/2">
            <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Featured Product</span>
            <h2 class="mt-2 text-3xl font-bold text-gray-900 dark:text-white mb-4">VortexVR</h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Experience immersive virtual worlds with unparalleled visual fidelity and responsive interactions. VortexVR combines cutting-edge graphics with intuitive controls to create a truly next-generation VR experience.
            </p>
            
            <div class="flex flex-wrap gap-3 mb-8">
              <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                Virtual Reality
              </span>
              <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                Gaming
              </span>
              <span class="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-sm">
                Cross-Platform
              </span>
            </div>
            
            <NuxtLink 
              to="/apps/vortex-vr" 
              class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              Explore VortexVR
              <span class="i-carbon-arrow-right ml-2"></span>
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Coming Soon Section -->
      <div class="mt-32 max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium mb-6">
          <span class="i-carbon-timer mr-2"></span>
          Coming Soon
        </div>
        
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Next-Generation Products in Development
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          We're constantly pushing the boundaries of what's possible. Stay tuned for our upcoming releases.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-left shadow-sm">
            <div class="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white mb-4">
              <span class="i-carbon-augmented-reality text-xl"></span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              AR Assistant
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Augmented reality personal assistant with AI-powered object recognition and information overlay.
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-left shadow-sm">
            <div class="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mb-4">
              <span class="i-carbon-ai-status text-xl"></span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Neural Studio
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Creative suite with AI-powered image, video, and audio generation tools for artists and designers.
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-left shadow-sm">
            <div class="h-12 w-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center text-white mb-4">
              <span class="i-carbon-game-wireless text-xl"></span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Quantum Rush
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              High-speed racing game with procedurally generated tracks and physics-defying gameplay mechanics.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppsStore } from '~/stores/apps';

// Define page meta
definePageMeta({
  layout: 'default'
});

// Category filters
const categories = [
  { id: 'mobile', name: 'Mobile Apps' },
  { id: 'vr', name: 'VR Experiences' },
  { id: 'ar', name: 'AR Applications' },
  { id: 'games', name: 'Games' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'creative', name: 'Creative Tools' }
];

const selectedCategories = ref([]);
const search = ref('');

// Toggle category selection
const toggleCategory = (categoryId) => {
  if (selectedCategories.value.includes(categoryId)) {
    selectedCategories.value = selectedCategories.value.filter(id => id !== categoryId);
  } else {
    selectedCategories.value.push(categoryId);
  }
};

// Clear all filters
const clearFilters = () => {
  selectedCategories.value = [];
  search.value = '';
};

// Mock products data (in a real app, this would come from the apps store)
const products = ref([
  {
    id: 'sylph-note',
    name: 'SylphNote',
    description: 'AI-powered note-taking application with smart organization and cross-platform sync.',
    tags: ['Productivity', 'AI'],
    platforms: [
      { name: 'iOS', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
      { name: 'Android', class: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
      { name: 'Web', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' }
    ],
    categories: ['mobile', 'productivity'],
    gradientClass: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  },
  {
    id: 'vortex-vr',
    name: 'VortexVR',
    description: 'Immersive virtual reality experience with stunning visuals and interactive environments.',
    tags: ['VR', 'Gaming'],
    platforms: [
      { name: 'Oculus', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      { name: 'SteamVR', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' }
    ],
    categories: ['vr', 'games'],
    gradientClass: 'bg-gradient-to-br from-purple-500 to-pink-600'
  },
  {
    id: 'sylph-chat',
    name: 'SylphChat',
    description: 'AI-powered messaging app with smart replies and real-time translation.',
    tags: ['Communication', 'AI'],
    platforms: [
      { name: 'iOS', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
      { name: 'Android', class: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' }
    ],
    categories: ['mobile'],
    gradientClass: 'bg-gradient-to-br from-green-500 to-teal-600'
  },
  {
    id: 'cosmic-explorer',
    name: 'Cosmic Explorer',
    description: 'Space exploration game with procedurally generated galaxies and immersive gameplay.',
    tags: ['Gaming', 'Adventure'],
    platforms: [
      { name: 'PC', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      { name: 'Console', class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' }
    ],
    categories: ['games'],
    gradientClass: 'bg-gradient-to-br from-indigo-500 to-blue-600'
  },
  {
    id: 'pocket-ar',
    name: 'PocketAR',
    description: 'Augmented reality tool for visualizing 3D models in real-world environments.',
    tags: ['AR', 'Design'],
    platforms: [
      { name: 'iOS', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
      { name: 'Android', class: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' }
    ],
    categories: ['mobile', 'ar', 'creative'],
    gradientClass: 'bg-gradient-to-br from-amber-500 to-orange-600'
  },
  {
    id: 'code-flow',
    name: 'CodeFlow',
    description: 'Programming editor with AI code completion and intelligent refactoring suggestions.',
    tags: ['Developer', 'AI'],
    platforms: [
      { name: 'macOS', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      { name: 'Windows', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
      { name: 'Linux', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' }
    ],
    categories: ['productivity', 'creative'],
    gradientClass: 'bg-gradient-to-br from-gray-700 to-gray-900'
  }
]);

// Filtered products based on search and category selections
const filteredProducts = computed(() => {
  let result = products.value;
  
  // Apply search filter
  if (search.value) {
    const searchQuery = search.value.toLowerCase();
    result = result.filter(product => 
      product.name.toLowerCase().includes(searchQuery) || 
      product.description.toLowerCase().includes(searchQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
      product.platforms.some(platform => platform.name.toLowerCase().includes(searchQuery))
    );
  }
  
  // Apply category filters
  if (selectedCategories.value.length > 0) {
    result = result.filter(product => {
      return selectedCategories.value.some(category => product.categories.includes(category));
    });
  }
  
  return result;
});
</script>