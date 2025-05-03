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

  // Internal helper for auth actions
  async function _performAuthAction(
    providerName: string,
    authLogic: () => Promise<void>, // Changed from Promise<any> to Promise<void>
    successRedirectPath?: string
  ) {
    loading.value = true;
    activeProvider.value = providerName;
    error.value = null;
    
    try {
      await authLogic();
      if (successRedirectPath) {
        await navigateTo(successRedirectPath);
      }
      // Optionally return success status or result if needed in the future
    } catch (err: unknown) {
      error.value = formatErrorMessage(err);
      showToast(error.value, 'error');
      // Optionally re-throw or return error status
    } finally {
      loading.value = false;
      activeProvider.value = null;
    }
  }

  // Actions
  const clearError = () => {
    error.value = null
  }

  const formatErrorMessage = (err: unknown): string => {
    if (typeof err === 'string') return err
    
    let errorCode = 'unknown';
    let message = 'An unknown error occurred.';

    if (typeof err === 'object' && err !== null) {
      errorCode = (err as { code?: string }).code || 'unknown';
      message = (err as { message?: string }).message || message;
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
        return message
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    await _performAuthAction('google', async () => {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    }, '/'); // Redirect to home on success
  }

  // Sign in with email and password
  const signInWithEmailPassword = async (email: string, password: string, rememberMe = false) => {
    await _performAuthAction('password', async () => {
      const auth = getAuth();
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    }, '/'); // Redirect to home on success
  }

  // Register new user with email and password
  const registerUser = async (email: string, password: string, rememberMe = false) => {
    await _performAuthAction('register', async () => {
      const auth = getAuth();
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await createUserWithEmailAndPassword(auth, email, password);
    }, '/'); // Redirect to home on success
  }

  // Send password reset email
  const resetPassword = async (email: string) => {
    await _performAuthAction('reset', async () => {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      // Success handled in UI, no redirect needed
    });
  }

  // Send magic link
  const sendMagicLink = async (email: string) => {
    await _performAuthAction('magic', async () => {
      const auth = getAuth();
      const actionCodeSettings = {
        url: `${window.location.origin}/magic-link?email=${email}`, // Keep email in URL for verification page
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save the email locally to remember the user
      window.localStorage.setItem('emailForSignIn', email);
    }, `/magic-link?email=${encodeURIComponent(email)}`); // Redirect to verification page
  }

  // Sign out
  const signOutUser = async () => {
    // Note: activeProvider is not set for sign out as it's a general action
    await _performAuthAction('signout', async () => {
      const auth = getAuth();
      await signOut(auth);
    }, '/login'); // Redirect to login on success
  }

  return {
    // State
    loading,
    error,
    activeProvider,
    // currentUser, // Removed raw Firebase User object to prevent serialization errors
    
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