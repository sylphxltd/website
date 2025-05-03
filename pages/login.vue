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
        
        <button 
          type="submit"
          :disabled="loading"
          class="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading && activeProvider === 'email'" class="i-carbon-circle-dash animate-spin mr-2"></span>
          <span v-else class="i-carbon-arrow-right mr-2"></span>
          Continue with Email
        </button>
      </form>
      
      <!-- Step 2: Existing User - Password Input -->
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
      </form>
      
      <!-- Magic Link Option (when applicable) -->
      <div v-if="currentStep === 'password' || currentStep === 'register'" class="mt-6 text-center">
        <button 
          @click="sendMagicLink"
          :disabled="loading"
          class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          <span v-if="loading && activeProvider === 'magic'" class="i-carbon-circle-dash animate-spin mr-1"></span>
          <span v-else>Send magic link instead</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  fetchSignInMethodsForEmail,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  AuthErrorCodes
} from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'

// Authentication state
const router = useRouter()
const error = ref<Error | null>(null)
const loading = ref(false)
const activeProvider = ref<string>('')

// User flow steps
// 'email' -> 'password' (existing user) -> redirect to home
// 'email' -> 'register' (new user) -> redirect to home
// Or direct social login -> redirect to home  
type FlowStep = 'email' | 'password' | 'register' | 'magic-link-sent';
const currentStep = ref<FlowStep>('email')

// Form fields
const email = ref('')
const password = ref('')
const newPassword = ref('')
const rememberMe = ref(false)

// Firebase auth
const auth = getAuth()
const user = useCurrentUser()

// Action Settings
const actionCodeSettings = {
  url: window.location.origin + '/magic-link',
  handleCodeInApp: true,
}

// Redirect if already logged in
watch(user, (newUser) => {
  if (newUser) {
    router.push('/')
  }
}, { immediate: true })

// Check for magic link sign-in
onMounted(() => {
  // Check if the URL contains email link sign-in info
  if (isSignInWithEmailLink(auth, window.location.href)) {
    // Get the email from localStorage if available
    let email = localStorage.getItem('emailForSignIn')
    
    if (!email) {
      // If no email in storage, ask the user
      email = window.prompt('Please provide your email for confirmation')
    }
    
    if (email) {
      loading.value = true
      activeProvider.value = 'magic'
      
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          // Clear the URL and email
          localStorage.removeItem('emailForSignIn')
          // Redirect
          router.push('/')
        })
        .catch((err) => {
          error.value = err
          console.error('Magic Link Sign-In Error:', err)
          // Reset to email step
          currentStep.value = 'email'
        })
        .finally(() => {
          loading.value = false
          activeProvider.value = ''
        })
    }
  }
})

function formatErrorMessage(err: Error): string {
  if (!err) return '';
  
  // Extract Firebase error code
  const errorMessage = err.message || '';
  const isFirebaseError = errorMessage.includes('auth/');
  
  if (isFirebaseError) {
    // Handle common Firebase auth errors with user-friendly messages
    if (errorMessage.includes('auth/email-already-in-use')) {
      return 'This email address is already registered. Please sign in instead.';
    }
    if (errorMessage.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('auth/weak-password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (errorMessage.includes('auth/too-many-requests')) {
      return 'Too many unsuccessful login attempts. Please try again later or reset your password.';
    }
    if (errorMessage.includes('auth/network-request-failed')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (errorMessage.includes('auth/popup-closed-by-user')) {
      return 'Sign-in popup was closed before completing authentication.';
    }
    if (errorMessage.includes('auth/account-exists-with-different-credential')) {
      return 'An account already exists with the same email address but different sign-in credentials. Try signing in using a different method.';
    }
  }
  
  // Fallback to the original error message or a generic message
  return errorMessage || 'An error occurred. Please try again.';
}

async function continueWithEmail() {
  if (!email.value.trim()) {
    error.value = new Error('Please enter your email address.');
    return;
  }
  
  loading.value = true;
  activeProvider.value = 'email';
  error.value = null;
  
  try {
    // Check if the email exists and what sign-in methods are available
    const methods = await fetchSignInMethodsForEmail(auth, email.value);
    
    if (methods.length > 0) {
      // User exists - go to password step
      currentStep.value = 'password';
    } else {
      // New user - go to registration step
      currentStep.value = 'register';
    }
  } catch (err) {
    error.value = err as Error;
    console.error('Email Check Error:', err);
    // Default to registration if we can't check
    currentStep.value = 'register';
  } finally {
    loading.value = false;
    activeProvider.value = '';
  }
}

async function signInWithGoogle() {
  loading.value = true;
  activeProvider.value = 'google';
  error.value = null;
  
  const provider = new GoogleAuthProvider();

  try {
    // Use browser persistence if remember me is checked
    if (rememberMe.value) {
      // Import browser persistence explicitly
      const { browserLocalPersistence, browserSessionPersistence } = await import('firebase/auth');
      await auth.setPersistence(browserLocalPersistence);
    } else {
      const { browserSessionPersistence } = await import('firebase/auth');
      await auth.setPersistence(browserSessionPersistence);
    }
    await signInWithPopup(auth, provider);
    router.push('/');
  } catch (err) {
    error.value = err as Error;
    console.error('Google Sign-In Error:', err);
  } finally {
    loading.value = false;
    activeProvider.value = '';
  }
}

async function signInWithEmailPassword() {
  if (!password.value) {
    error.value = new Error('Please enter your password.');
    return;
  }
  
  loading.value = true;
  activeProvider.value = 'password';
  error.value = null;
  
  try {
    // Use browser persistence if remember me is checked
    if (rememberMe.value) {
      // Import browser persistence explicitly
      const { browserLocalPersistence } = await import('firebase/auth');
      await auth.setPersistence(browserLocalPersistence);
    } else {
      const { browserSessionPersistence } = await import('firebase/auth');
      await auth.setPersistence(browserSessionPersistence);
    }
    
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err as Error;
    console.error('Email/Password Sign-In Error:', err);
  } finally {
    loading.value = false;
    activeProvider.value = '';
  }
}

async function registerUser() {
  if (!newPassword.value) {
    error.value = new Error('Please create a password.');
    return;
  }
  
  if (newPassword.value.length < 6) {
    error.value = new Error('Password must be at least 6 characters long.');
    return;
  }
  
  loading.value = true;
  activeProvider.value = 'register';
  error.value = null;
  
  try {
    // Skip setting persistence for registration to avoid the internal assertion error
    // We'll set it after successful registration if needed
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, newPassword.value);
    
    // Now set persistence if needed
    if (rememberMe.value) {
      // We can just leave it as the default persistence which is already 'local'
      console.log('User will be remembered');
    }
    
    router.push('/');
  } catch (err) {
    error.value = err as Error;
    console.error('Registration Error:', err);
  } finally {
    loading.value = false;
    activeProvider.value = '';
  }
}

async function resetPassword() {
  if (!email.value) {
    error.value = new Error('Please enter your email address first.');
    return;
  }
  
  loading.value = true;
  activeProvider.value = 'reset';
  error.value = null;
  
  try {
    await sendPasswordResetEmail(auth, email.value);
    alert('Password reset email has been sent. Please check your inbox.');
  } catch (err) {
    error.value = err as Error;
    console.error('Password Reset Error:', err);
  } finally {
    loading.value = false;
    activeProvider.value = '';
  }
}

async function sendMagicLink() {
  if (!email.value) {
    error.value = new Error('Please enter your email address first.');
    return;
  }
  
  loading.value = true;
  activeProvider.value = 'magic';
  error.value = null;
  
  try {
    await sendSignInLinkToEmail(auth, email.value, actionCodeSettings);
    
    // Save the email locally to complete sign-in on the same device
    localStorage.setItem('emailForSignIn', email.value);
    
    alert('Sign-in link has been sent to your email. Please check your inbox and click the link to sign in.');
    
    // Clear current step and return to email input
    resetFlow();
  } catch (err) {
    error.value = err as Error;
    console.error('Magic Link Error:', err);
  } finally {
    loading.value = false;
    activeProvider.value = '';
  }
}

function resetFlow() {
  currentStep.value = 'email';
  error.value = null;
  // Don't clear email to make it easy to correct typos
  password.value = '';
  newPassword.value = '';
}
</script>