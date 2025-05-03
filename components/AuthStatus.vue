<template>
  <div class="flex items-center gap-3">
    <div v-if="user" class="flex items-center gap-3">
      <span class="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
        {{ user.displayName || user.email }}
      </span>
      <button 
        @click="signOutUser" 
        class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
        title="Sign Out"
      >
        <span class="i-carbon-logout text-lg"></span>
        <span class="sr-only">Sign Out</span>
      </button>
    </div>
    <NuxtLink 
      v-else 
      to="/login" 
      class="inline-flex items-center justify-center px-4 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-md shadow-md shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span class="i-carbon-login mr-1"></span>
      Login
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { getAuth, signOut } from 'firebase/auth'
import { useCurrentUser } from 'vuefire' // Vuefire composable to get the current user

const user = useCurrentUser() // Get the reactive user object

async function signOutUser() {
  const auth = getAuth()
  try {
    await signOut(auth)
    // Optional: Redirect to home or login page after sign out
    // useRouter().push('/') 
  } catch (error) {
    console.error('Sign Out Error:', error)
    // Handle sign out error (e.g., show a notification)
  }
}
</script>