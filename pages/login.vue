<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
    <div class="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-2 dark:text-white text-center">Sign in to Sylphx</h1>
      <p class="text-gray-500 dark:text-gray-400 text-center mb-6">Continue with your preferred method</p>
      
      <!-- Error message -->
      <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
        {{ formatErrorMessage(error) }}
      </div>
      
      <!-- Social Login Options (Always Shown First) -->
      <div class="space-y-4 mb-6">
        <button 
          @click="signInWithGoogle" 
          :disabled="loading"
          class="w-full inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading && activeProvider === 'google'" class="i-carbon-circle-dash animate-spin mr-2"></span>
          <span v-else class="i-carbon-logo-google mr-2 text-red-500"></span>
          Continue with Google
        </button>
        
        <button 
          class="w-full inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md opacity-50 cursor-not-allowed"
          disabled
        >
          <span class="i-carbon-logo-apple mr-2"></span>
          Continue with Apple
        </button>
        
        <button 
          class="w-full inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md opacity-50 cursor-not-allowed"
          disabled
        >
          <span class="i-carbon-logo-github mr-2"></span>
          Continue with GitHub
        </button>
      </div>
      
      <div class="relative flex items-center gap-2 my-6">
        <div class="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
        <span class="text-xs text-gray-500 dark:text-gray-400">or</span>
        <div class="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>
      
      <!-- Step 1: Email Input (Initial Step) -->
      <form v-if="currentStep === 'email'" @submit.prevent="continueWithEmail" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            required 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="your@email.com"
            autocomplete="email"
          />
        </div>
        
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
          We'll send you a secure sign-in link via email.
          <br>No password needed for secure access.
        </p>
        
        <button 
          type="submit"
          :disabled="loading"
          class="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading && activeProvider === 'email'" class="i-carbon-circle-dash animate-spin mr-2"></span>
          <span v-else class="i-carbon-email mr-2"></span>
          Send Secure Link
        </button>
        
        <div class="text-center mt-4">
          <button 
            type="button"
            @click="togglePasswordLogin"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Use password instead
          </button>
        </div>
      </form>
      
      <!-- Magic Link Sent Success Screen -->
      <div v-if="currentStep === 'magic-link-sent'" class="text-center space-y-4">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <span class="i-carbon-email-notification text-3xl text-blue-600 dark:text-blue-400"></span>
        </div>
        
        <h2 class="text-xl font-bold dark:text-white">Check your email</h2>
        <p class="text-gray-600 dark:text-gray-400">
          We've sent a secure sign-in link to <strong>{{ email }}</strong>
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
          The link will expire in 15 minutes. If you don't see the email, check your spam folder.
        </p>
        
        <div class="pt-4">
          <button 
            @click="resetFlow" 
            class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
      
      <!-- Step 2: Existing User - Password Input (Only shown after user chooses "Use password instead") -->
      <form v-if="currentStep === 'password'" @submit.prevent="signInWithEmailPassword" class="space-y-4">
        <div class="flex items-center mb-4">
          <span class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ email }}</span>
          <button 
            @click="resetFlow" 
            class="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Change
          </button>
        </div>
        
        <div>
          <div class="flex justify-between mb-1">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <button 
              type="button" 
              @click="resetPassword" 
              class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Forgot password?
            </button>
          </div>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>
        
        <div class="flex items-center">
          <input 
            id="remember" 
            v-model="rememberMe" 
            type="checkbox" 
            class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label for="remember" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Remember me</label>
        </div>
        
        <button 
          type="submit"
          :disabled="loading"
          class="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading && activeProvider === 'password'" class="i-carbon-circle-dash animate-spin mr-2"></span>
          <span v-else class="i-carbon-login mr-2"></span>
          Sign in
        </button>
        
        <div class="text-center mt-2">
          <button 
            type="button"
            @click="switchToEmailLink"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Use secure email link instead
          </button>
        </div>
      </form>
      
      <!-- Step 2: New User - Registration -->
      <form v-if="currentStep === 'register'" @submit.prevent="registerUser" class="space-y-4">
        <div class="flex items-center mb-4">
          <span class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ email }}</span>
          <button 
            @click="resetFlow" 
            class="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Change
          </button>
        </div>
        
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This email isn't registered yet. Create a password to set up your account.
        </p>
        
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Create password</label>
          <input 
            id="newPassword" 
            v-model="newPassword" 
            type="password" 
            required 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Minimum 6 characters"
            autocomplete="new-password"
          />
        </div>
        
        <div class="flex items-center">
          <input 
            id="rememberNew" 
            v-model="rememberMe" 
            type="checkbox" 
            class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label for="rememberNew" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Remember me</label>
        </div>
        
        <button 
          type="submit"
          :disabled="loading"
          class="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading && activeProvider === 'register'" class="i-carbon-circle-dash animate-spin mr-2"></span>
          <span v-else class="i-carbon-user-follow mr-2"></span>
          Create Account
        </button>
        
        <div class="text-center mt-2">
          <button 
            type="button"
            @click="switchToEmailLink"
            class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Use secure email link instead
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth'

// Add page metadata here
definePageMeta({
  public: true,
})
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'

// Stores
const userStore = useUserStore()
const router = useRouter()

// Form state
const email = ref('')
const password = ref('')
const newPassword = ref('')
const rememberMe = ref(false)
const error = ref<Error | null>(null)
const loading = ref(false)
const activeProvider = ref('')
const currentStep = ref('email')
const usePasswordLogin = ref(false)

// Magic link settings
const actionCodeSettings = computed(() => {
  // Safe to access window here since it's wrapped in a computed
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return {
    url: `${baseUrl}/magic-link?email=${encodeURIComponent(email.value)}`,
    handleCodeInApp: true
  }
})

// Format error message to be user-friendly
function formatErrorMessage(err: unknown): string { // Changed any to unknown
  if (!err) return ''

  if (typeof err === 'string') return err

  let errorCode = 'unknown';
  let errorMessage = 'An unknown error occurred';

  // Check if err is an object with code and message properties
  if (typeof err === 'object' && err !== null) {
    if ('code' in err && typeof err.code === 'string') {
      errorCode = err.code;
    }
    if ('message' in err && typeof err.message === 'string') {
      errorMessage = err.message;
    }
  }

  // Format Firebase error messages to be more user-friendly
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is not valid.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/wrong-password':
      return 'Incorrect password.'
    case 'auth/invalid-credential':
      return 'Invalid login credentials.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later.'
    case 'auth/popup-closed-by-user':
      return 'Login popup was closed before completion.'
    case 'auth/popup-blocked':
      return 'Login popup was blocked by your browser.'
    case 'auth/requires-recent-login':
      return 'This operation requires a recent login. Please sign in again.'
    default:
      // Return the message but remove Firebase prefix
      return errorMessage.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '')
  }
}

async function checkEmailExists(emailAddress: string): Promise<boolean> {
  // Skip check if email is empty
  if (!emailAddress) return false
  
  try {
    const auth = getAuth()
    const signInMethods = await fetchSignInMethodsForEmail(auth, emailAddress)
    return signInMethods.length > 0
  } catch (err) {
    console.error('Error checking email existence:', err)
    return false
  }
}

// Switch between password login and email link
function togglePasswordLogin() {
  usePasswordLogin.value = true
  checkEmailAndContinue()
}

// Switch to email link authentication
function switchToEmailLink() {
  if (!email.value) {
    error.value = new Error('Please enter your email address first.')
    return
  }
  
  sendMagicLink()
}

async function checkEmailAndContinue() {
  if (!email.value) {
    error.value = new Error('Please enter your email address.')
    return
  }
  
  loading.value = true
  activeProvider.value = 'email'
  error.value = null
  
  try {
    // Check if the email exists
    const emailExists = await checkEmailExists(email.value)
    
    if (usePasswordLogin.value) {
      // If user wants to use password login, direct to correct step
      if (emailExists) {
        currentStep.value = 'password'
      } else {
        currentStep.value = 'register'
      }
    }
    
    return emailExists
  } catch (err) {
    console.error('Email Check Error:', err)
    error.value = err as Error
    return false
  } finally {
    loading.value = false
    activeProvider.value = ''
  }
}

async function continueWithEmail() {
  if (!email.value) {
    error.value = new Error('Please enter your email address.')
    return
  }
  
  // If user chose to use password, direct them accordingly
  if (usePasswordLogin.value) {
    await checkEmailAndContinue()
    return
  }
  
  // Default modern flow: Send magic link immediately
  sendMagicLink()
}

async function signInWithGoogle() {
  loading.value = true
  activeProvider.value = 'google'
  error.value = null
  
  try {
    await userStore.signInWithGoogle()
    // Navigation is handled in the store
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
    activeProvider.value = ''
  }
}

async function signInWithEmailPassword() {
  if (!password.value) {
    error.value = new Error('Please enter your password.')
    return
  }
  
  loading.value = true
  activeProvider.value = 'password'
  error.value = null
  
  try {
    await userStore.signInWithEmailPassword(email.value, password.value, rememberMe.value)
    // Navigation is handled in the store
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
    activeProvider.value = ''
  }
}

async function registerUser() {
  if (!newPassword.value) {
    error.value = new Error('Please create a password.')
    return
  }
  
  if (newPassword.value.length < 6) {
    error.value = new Error('Password must be at least 6 characters long.')
    return
  }
  
  loading.value = true
  activeProvider.value = 'register'
  error.value = null
  
  try {
    // Double-check that the email doesn't exist before trying to register
    const emailExists = await checkEmailExists(email.value)
    
    if (emailExists) {
      // If the email exists, redirect to the password step instead
      error.value = new Error('This email is already registered. Please sign in with your password instead.')
      currentStep.value = 'password'
      return
    }
    
    await userStore.registerUser(email.value, newPassword.value, rememberMe.value)
    // Navigation is handled in the store
  } catch (err) {
    error.value = err as Error

    // If we get an email-already-in-use error, redirect to password login
    // Check if err is an object and has a code property before accessing it
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'auth/email-already-in-use') {
      error.value = new Error('This email is already registered. Please sign in with your password.')
      currentStep.value = 'password'
    }
  } finally {
    loading.value = false
    activeProvider.value = ''
  }
}

async function resetPassword() {
  if (!email.value) {
    error.value = new Error('Please enter your email address first.')
    return
  }
  
  loading.value = true
  activeProvider.value = 'reset'
  error.value = null
  
  try {
    await userStore.resetPassword(email.value)
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
    activeProvider.value = ''
  }
}

async function sendMagicLink() {
  if (!email.value) {
    error.value = new Error('Please enter your email address first.')
    return
  }
  
  loading.value = true
  activeProvider.value = 'magic'
  error.value = null
  
  try {
    await userStore.sendMagicLink(email.value)
    
    // Show success step
    currentStep.value = 'magic-link-sent'
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
    activeProvider.value = ''
  }
}

function resetFlow() {
  currentStep.value = 'email'
  error.value = null
  usePasswordLogin.value = false
  // Don't clear email to make it easy to correct typos
  password.value = ''
  newPassword.value = ''
}
</script>