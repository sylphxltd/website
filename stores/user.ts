import { defineStore } from 'pinia'
import { 
  getAuth, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  GoogleAuthProvider,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'
import { useToastStore } from '~/stores/toast'
import type { ToastType } from '~/components/Toast.vue'

// TypeScript 類型定義，解決 nuxtApp.$toast 嘅類型問題
declare module '#app' {
  interface NuxtApp {
    $toast: {
      success: (message: string, timeout?: number) => number;
      error: (message: string, timeout?: number) => number;
      warning: (message: string, timeout?: number) => number;
      info: (message: string, timeout?: number) => number;
      add: (options: { message: string, type?: ToastType, timeout?: number }) => number;
      remove: (id: number) => void;
      clear: () => void;
    }
  }
}

export const useUserStore = defineStore('user', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activeProvider = ref<string | null>(null)
  const currentUser = useCurrentUser()
  const router = useRouter()
  
  // Get toast store for notifications
  const toastStore = useToastStore()
  
  // Computed
  const isAuthenticated = computed(() => !!currentUser.value)
  const userDisplayName = computed(() => {
    if (!currentUser.value) return null
    return currentUser.value.displayName || currentUser.value.email?.split('@')[0] || 'User'
  })
  const userEmail = computed(() => currentUser.value?.email || null)
  const userPhotoURL = computed(() => currentUser.value?.photoURL || null)
  const userInitial = computed(() => {
    if (!currentUser.value) return 'U'
    return (currentUser.value.displayName?.charAt(0) || 
            currentUser.value.email?.charAt(0) || 
            'U').toUpperCase()
  })

  // Helper function for showing toasts
  function showToast(message: string, type: ToastType = 'info') {
    toastStore[type](message)
  }

  // Actions
  const clearError = () => {
    error.value = null
  }

  const formatErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err
    
    const errorCode = err.code || 'unknown'
    
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
        return err.message || 'An unknown error occurred.'
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    loading.value = true
    activeProvider.value = 'google'
    error.value = null
    
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      
      await signInWithPopup(auth, provider)
      
      showToast('Successfully signed in with Google', 'success')
      
      // Redirect to homepage after successful login
      await navigateTo('/')
    } catch (err: any) {
      error.value = formatErrorMessage(err)
      showToast(error.value, 'error')
    } finally {
      loading.value = false
      activeProvider.value = null
    }
  }

  // Sign in with email and password
  const signInWithEmailPassword = async (email: string, password: string, rememberMe: boolean = false) => {
    loading.value = true
    activeProvider.value = 'password'
    error.value = null
    
    try {
      const auth = getAuth()
      
      // Set persistence based on remember me choice
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      await signInWithEmailAndPassword(auth, email, password)
      
      showToast('Successfully signed in', 'success')
      
      // Redirect to homepage after successful login
      await navigateTo('/')
    } catch (err: any) {
      error.value = formatErrorMessage(err)
      showToast(error.value, 'error')
    } finally {
      loading.value = false
      activeProvider.value = null
    }
  }

  // Register new user with email and password
  const registerUser = async (email: string, password: string, rememberMe: boolean = false) => {
    loading.value = true
    activeProvider.value = 'register'
    error.value = null
    
    try {
      const auth = getAuth()
      
      // Set persistence based on remember me choice
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      await createUserWithEmailAndPassword(auth, email, password)
      
      showToast('Account created successfully', 'success')
      
      // Redirect to homepage after successful registration
      await navigateTo('/')
    } catch (err: any) {
      error.value = formatErrorMessage(err)
      showToast(error.value, 'error')
    } finally {
      loading.value = false
      activeProvider.value = null
    }
  }

  // Send password reset email
  const resetPassword = async (email: string) => {
    loading.value = true
    activeProvider.value = 'reset'
    error.value = null
    
    try {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, email)
      
      showToast('Password reset email sent', 'success')
    } catch (err: any) {
      error.value = formatErrorMessage(err)
      showToast(error.value, 'error')
    } finally {
      loading.value = false
      activeProvider.value = null
    }
  }

  // Send magic link
  const sendMagicLink = async (email: string) => {
    loading.value = true
    activeProvider.value = 'magic'
    error.value = null
    
    try {
      const auth = getAuth()
      const actionCodeSettings = {
        url: `${window.location.origin}/magic-link?email=${email}`,
        handleCodeInApp: true
      }
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      
      // Save the email locally to remember the user
      window.localStorage.setItem('emailForSignIn', email)
      
      showToast('Magic link sent to your email', 'success')
      
      // Redirect to magic link page
      await navigateTo(`/magic-link?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      error.value = formatErrorMessage(err)
      showToast(error.value, 'error')
    } finally {
      loading.value = false
      activeProvider.value = null
    }
  }

  // Sign out
  const signOutUser = async () => {
    loading.value = true
    error.value = null
    
    try {
      const auth = getAuth()
      await signOut(auth)
      
      showToast('Successfully signed out', 'success')
      
      // Redirect to login page after sign out
      await navigateTo('/login')
    } catch (err: any) {
      error.value = formatErrorMessage(err)
      showToast(error.value, 'error')
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    error,
    activeProvider,
    currentUser,
    
    // Computed
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    userInitial,
    
    // Actions
    clearError,
    showToast,
    formatErrorMessage,
    signInWithGoogle,
    signInWithEmailPassword,
    registerUser,
    resetPassword,
    sendMagicLink,
    signOutUser
  }
}) 