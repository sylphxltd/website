<template>
  <div class="flex items-center gap-3">
    <!-- Add check for userStore existence before accessing its properties -->
    <div v-if="userStore && userStore.isAuthenticated" class="relative user-dropdown-container">
      <button
        @click="showUserMenu = !showUserMenu"
        class="flex items-center gap-2 hover:opacity-80 transition"
      >
        <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <span v-if="userStore.userPhotoURL">
            <img :src="userStore.userPhotoURL" alt="User avatar" class="w-8 h-8 rounded-full" />
          </span>
          <span v-else>{{ userStore.userInitial }}</span>
        </div>
        <span class="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
          {{ userStore.userDisplayName }}
        </span>
        <div class="i-carbon-chevron-down text-sm"></div>
      </button>
      
      <!-- User menu dropdown -->
      <div 
        v-if="showUserMenu" 
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-100 dark:border-gray-700"
      >
        <p class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
          Signed in as<br/>
          <span class="font-medium text-gray-900 dark:text-white">{{ userStore.userEmail }}</span>
        </p>
        
        <NuxtLink 
          to="/settings"
          @click="showUserMenu = false"
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex items-center">
            <span class="i-carbon-settings mr-2"></span>
            Account Settings
          </div>
        </NuxtLink>

        <!-- Admin Only: User Management Link -->
        <NuxtLink
          v-if="userStore.isAdmin"
          to="/admin/users"
          @click="showUserMenu = false"
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex items-center">
            <span class="i-carbon-user-multiple mr-2"></span>
            User Management
          </div>
        </NuxtLink>
        
        <button
          @click="handleSignOut"
          class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex items-center">
            <span class="i-carbon-logout mr-2"></span>
            Sign Out
          </div>
        </button>
      </div>
    </div>

    <!-- Add check for userStore existence before accessing its properties -->
    <NuxtLink
      v-else-if="userStore"
      to="/login"
      class="inline-flex items-center justify-center px-4 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-md shadow-md shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span class="i-carbon-login mr-1"></span>
      Login
    </NuxtLink>
    
    <!-- Error Toast Message (auto dismiss) -->
    <div v-if="errorMessage" 
      class="fixed bottom-4 right-4 p-4 bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-300 rounded-lg shadow-lg max-w-xs z-50 animate-fadeIn"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { useUserStore } from '~/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const showUserMenu = ref(false)
const errorMessage = ref('')
// Explicitly type errorTimeout to handle return type of setTimeout
const errorTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (showUserMenu.value && !(event.target as Element).closest('.user-dropdown-container')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value)
  }
})

// Handle sign out
async function handleSignOut() {
  showUserMenu.value = false
  await userStore.signOutUser()
}

function showError(message: string) {
  errorMessage.value = message
  
  // Clear any existing timeout
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value)
  }
  
  // Auto dismiss after 5 seconds
  errorTimeout.value = setTimeout(() => {
    errorMessage.value = ''
    errorTimeout.value = null
  }, 5000)
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>