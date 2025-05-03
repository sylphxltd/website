<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
    <div class="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
      <h1 class="text-2xl font-bold mb-6 dark:text-white">Login</h1>
      <p v-if="error" class="text-red-500 mb-4">{{ error.message }}</p>
      <button 
        @click="signInWithGoogle" 
        :disabled="loading"
        class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-2"></span>
        <span v-else class="i-carbon-logo-google mr-2"></span>
        Sign in with Google
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'
import { useRouter } from 'vue-router'
// nuxt-vuefire automatically imports useFirebaseAuth
// const auth = useFirebaseAuth()! // If using nuxt-vuefire's composable

const router = useRouter()
const error = ref<Error | null>(null)
const loading = ref(false)

async function signInWithGoogle() {
  loading.value = true
  error.value = null
  const provider = new GoogleAuthProvider()
  // Use getAuth() directly from firebase/auth if not using useFirebaseAuth()
  const auth = getAuth() 

  try {
    await signInWithPopup(auth, provider)
    // Redirect to home page after successful login
    router.push('/') 
  } catch (err) {
    error.value = err as Error
    console.error('Google Sign-In Error:', err)
  } finally {
    loading.value = false
  }
}

// Optional: Redirect if already logged in
// import { useCurrentUser } from 'vuefire'
// const user = useCurrentUser()
// watch(user, (newUser) => {
//   if (newUser) {
//     router.push('/')
//   }
// }, { immediate: true })

</script>