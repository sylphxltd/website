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
  onIdTokenChanged // Import onIdTokenChanged
} from 'firebase/auth'
import type { User, IdTokenResult } from 'firebase/auth' // Import IdTokenResult
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
  // Remove top-level useCurrentUser() call
  // const currentUser = useCurrentUser()
  const router = useRouter()
  const idTokenResult = ref<IdTokenResult | null>(null) // State to store token result

  // Get toast store for notifications
  const toastStore = useToastStore()

  // Flag to prevent multiple listener initializations
  let authListenerInitialized = false;

  // Action to initialize the auth state change listener
  const initAuthListener = () => {
    // Ensure listener is initialized only once and on the client side
    if (authListenerInitialized || typeof window === 'undefined') {
        return;
    }
    authListenerInitialized = true;
    console.log("Initializing Firebase Auth listener...");

    const auth = getAuth(); // Get auth instance here
    onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
        // Force refresh true to get latest claims
        idTokenResult.value = await user.getIdTokenResult(true);
      } catch (err) {
        console.error("Error getting ID token result:", err);
        idTokenResult.value = null; // Reset on error
        error.value = formatErrorMessage(err);
        showToast(error.value, 'error');
      }
    } else {
      idTokenResult.value = null; // Clear on sign out
    }
  }, (err) => { // Add error handler for onIdTokenChanged
      console.error("Error in onIdTokenChanged listener:", err);
      idTokenResult.value = null;
      error.value = formatErrorMessage(err);
        showToast(error.value, 'error');
    });
     console.log("Firebase Auth listener initialized.");
  }


  // Computed
  // Call useCurrentUser() inside computed properties
  const isAuthenticated = computed(() => {
      const user = useCurrentUser();
      return !!user.value;
  })
  const isAdmin = computed(() => {
    // Check if claims exist and admin claim is true
    return !!idTokenResult.value?.claims.admin
  })
  const userDisplayName = computed(() => {
    const user = useCurrentUser(); // Call inside computed
    if (!user.value) return null
    return user.value.displayName || user.value.email?.split('@')[0] || 'User'
  })
  const userEmail = computed(() => {
      const user = useCurrentUser(); // Call inside computed
      return user.value?.email || null;
  })
  const userPhotoURL = computed(() => {
      const user = useCurrentUser(); // Call inside computed
      return user.value?.photoURL || null;
  })
  const userInitial = computed(() => {
    const user = useCurrentUser(); // Call inside computed
    if (!user.value) return 'U'
    return (user.value.displayName?.charAt(0) ||
            user.value.email?.charAt(0) ||
            'U').toUpperCase()
  })

  // Helper function for showing toasts
  function showToast(message: string, type: ToastType = 'info') {
    toastStore[type](message)
  }

  // Internal helper for auth actions
  async function _performAuthAction(
    providerName: string,
    authLogic: () => Promise<void>,
    successRedirectPath?: string
  ) {
    loading.value = true;
    activeProvider.value = providerName;
    error.value = null;

    try {
      await authLogic();
      // ID token result will be updated by onIdTokenChanged listener
      if (successRedirectPath) {
        await navigateTo(successRedirectPath);
      }
    } catch (err: unknown) {
      error.value = formatErrorMessage(err);
      showToast(error.value, 'error');
      idTokenResult.value = null; // Clear token result on auth error
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
      // Add specific error for claims if needed, e.g., permission denied
      case 'functions/permission-denied': // Example if using Functions to set claims
         return 'You do not have permission to perform this action.';
      default:
        // Check for generic permission errors if not using Functions
        if (message.toLowerCase().includes('permission denied') || message.toLowerCase().includes('insufficient permissions')) {
            return 'You do not have permission to perform this action.';
        }
        return message
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    await _performAuthAction('google', async () => {
      const auth = getAuth(); // Call getAuth() inside the action
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    }, '/'); // Redirect to home on success
  }

  // Sign in with email and password
  const signInWithEmailPassword = async (email: string, password: string, rememberMe = false) => {
    await _performAuthAction('password', async () => {
      const auth = getAuth(); // Call getAuth() inside the action
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    }, '/'); // Redirect to home on success
  }

  // Register new user with email and password
  const registerUser = async (email: string, password: string, rememberMe = false) => {
    await _performAuthAction('register', async () => {
      const auth = getAuth(); // Call getAuth() inside the action
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await createUserWithEmailAndPassword(auth, email, password);
      // Note: New users won't have admin claims initially.
      // Claims need to be set separately by an existing admin.
    }, '/'); // Redirect to home on success
  }

  // Send password reset email
  const resetPassword = async (email: string) => {
    await _performAuthAction('reset', async () => {
      const auth = getAuth(); // Call getAuth() inside the action
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset email sent. Check your inbox.', 'success'); // Add success toast
    });
  }

  // Send magic link
  const sendMagicLink = async (email: string) => {
    await _performAuthAction('magic', async () => {
      const auth = getAuth(); // Call getAuth() inside the action
      const actionCodeSettings = {
        url: `${window.location.origin}/magic-link?email=${email}`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      showToast('Magic link sent. Check your email to sign in.', 'success'); // Add success toast
    // }, `/magic-link?email=${encodeURIComponent(email)}`); // Redirect handled by user clicking link
    }); // No automatic redirect needed here
  }

  // Sign out
  const signOutUser = async () => {
    await _performAuthAction('signout', async () => {
      const auth = getAuth(); // Call getAuth() inside the action
      await signOut(auth);
      idTokenResult.value = null; // Explicitly clear token result on sign out
    }, '/login'); // Redirect to login on success
  }

  return {
    // State
    loading,
    error,
    activeProvider,
    // currentUser, // Keep removed
    idTokenResult, // Expose token result if needed elsewhere (optional)

    // Computed
    isAuthenticated,
    isAdmin, // Expose isAdmin
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
    signOutUser,
    initAuthListener // Expose the new action
  }
})