<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
    <div class="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
      <div class="mb-6">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <span v-if="loading" class="i-carbon-circle-dash animate-spin text-3xl text-blue-600 dark:text-blue-400"></span>
          <span v-else-if="success" class="i-carbon-checkmark text-3xl text-green-600 dark:text-green-400"></span>
          <span v-else class="i-carbon-warning text-3xl text-red-600 dark:text-red-400"></span>
        </div>
        
        <h1 class="text-2xl font-bold mb-2 dark:text-white">
          {{ success ? 'Sign in successful' : error ? 'Sign in failed' : 'Signing you in...' }}
        </h1>
        
        <p class="text-gray-500 dark:text-gray-400">
          {{ statusMessage }}
        </p>
      </div>
      
      <div v-if="error" class="mb-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
        {{ errorMessage }}
      </div>
      
      <div v-if="!loading" class="mt-6">
        <NuxtLink 
          to="/" 
          class="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-lg shadow-md shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span class="i-carbon-home mr-2"></span>
          Go to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const success = ref(false)
const error = ref(false)
const statusMessage = ref('Please wait while we authenticate your account...')
const errorMessage = ref('')

onMounted(async () => {
  const auth = getAuth()
  
  try {
    // Check if the URL contains email link sign-in info
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Get the email from localStorage if available
      let email = localStorage.getItem('emailForSignIn')
      
      if (!email) {
        // If no email in storage, ask the user
        email = window.prompt('Please provide your email for confirmation')
      }
      
      if (email) {
        statusMessage.value = 'Verifying your email link...'
        
        await signInWithEmailLink(auth, email, window.location.href)
        
        // Clear the URL and email
        localStorage.removeItem('emailForSignIn')
        
        // Update status
        success.value = true
        statusMessage.value = 'You are now signed in. Redirecting you to the home page shortly...'
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        // User didn't provide an email
        throw new Error('Email is required to complete authentication')
      }
    } else {
      // Not a valid sign-in link
      throw new Error('Invalid sign-in link. Please request a new link.')
    }
  } catch (err) {
    error.value = true
    errorMessage.value = err.message || 'Authentication failed. Please try signing in again.'
    statusMessage.value = 'Something went wrong while trying to sign you in.'
    console.error('Magic Link Authentication Error:', err)
  } finally {
    loading.value = false
  }
})
</script> 