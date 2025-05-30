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
  onIdTokenChanged, // Import onIdTokenChanged
  getIdTokenResult
} from 'firebase/auth'
import type { ParsedToken, User } from 'firebase/auth'
import { useCurrentUser } from 'vuefire' // Remove useUserClaims import
import { useRouter } from 'vue-router'
// Removed useState import
import { useToastStore } from '~/stores/toast'
import type { ToastType } from '~/components/Toast.vue'


export const useUserStore = defineStore('user', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activeProvider = ref<string | null>(null)
  // Restore top-level useCurrentUser() call
  const currentUser = useCurrentUser()
  const router = useRouter()
  // REMOVED isAdminState ref - will derive from currentUser.customClaims

  // Get toast store for notifications
  const toastStore = useToastStore()

  // Flag to prevent multiple listener initializations
  let authListenerInitialized = false;

  // Action to initialize the auth state change listener (CLIENT-SIDE ONLY)
  const initAuthListener = () => {
    // Ensure listener is initialized only once and on the client side
    if (authListenerInitialized || typeof window === 'undefined') {
        return;
    }
    authListenerInitialized = true;
    console.log("Initializing Firebase Auth listener...");

    const auth = getAuth(); // Get auth instance here
    // Use local isAdminState ref

    onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          // Force refresh true to get latest claims
          const tokenResult = await user.getIdTokenResult();
          // Update the shared state based on claims
          const hasAdminClaim = tokenResult.claims.admin === true;
          // No need to update useState anymore
          console.log(`Client listener confirmed admin claim: ${hasAdminClaim}`);
        } catch (err) {
          console.error("Error getting ID token result:", err);
          // No useState to reset
          error.value = formatErrorMessage(err);
          showToast(error.value, 'error');
        }
      } else {
        // No user, computed property will handle this via currentUser.value being null
        console.log("Client listener: No user found.");
      }
    }, (err) => { // Add error handler for onIdTokenChanged
        console.error("Error in onIdTokenChanged listener:", err);
        // No useState to reset
        error.value = formatErrorMessage(err);
        showToast(error.value, 'error');
    });
     console.log("Firebase Auth listener initialized.");
  }


  // Computed
  // Use the top-level currentUser
  const isAuthenticated = computed(() => {
      return !!currentUser.value;
  })

  // 使用 useAsyncData 替代 computedAsync
  const { data: claims } = useAsyncData<ParsedToken>(
    'user-claims',
    async () => {
      console.log("Current user:", currentUser.value); // Debug log
      if (!currentUser.value) return {}; // No user, not admin
      const idTokenResult = await getIdTokenResult(currentUser.value);
      console.log("ID Token Result:", idTokenResult); // Debug log
      return idTokenResult.claims; // Return claims or empty object
    }, {
      default: () => ({}), // Default value for claims
      watch: [currentUser], // Re-run when currentUser changes
    }
  )
  
  const isAdmin = computed(() => claims.value.admin === true)

  const userDisplayName = computed(() => {
    // Use the top-level currentUser
    if (!currentUser.value) return null
    return currentUser.value.displayName || currentUser.value.email?.split('@')[0] || 'User'
  })
  const userEmail = computed(() => {
      // Use the top-level currentUser
      return currentUser.value?.email || null;
  })
  const userPhotoURL = computed(() => {
      // Use the top-level currentUser
      return currentUser.value?.photoURL || null;
  })
  const userInitial = computed(() => {
    // Use the top-level currentUser
    if (!currentUser.value) return 'U'
    return (currentUser.value.displayName?.charAt(0) ||
            currentUser.value.email?.charAt(0) ||
            'U').toUpperCase()
 })

 const userUid = computed(() => {
   // Use the top-level currentUser
   return currentUser.value?.uid || null;
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
      // isAdminState.value = false; // REMOVED - No need to clear local state
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
      // isAdminState.value = false; // REMOVED - currentUser will become null, computed will be false
    }, '/login'); // Redirect to login on success
  }

  return {
    // State
    loading,
    error,
    activeProvider,
    // currentUser, // REMOVED: Exposing raw User object causes serialization errors
    // idTokenResult, // Remove complex object from return

    // Computed
    isAuthenticated,
    isAdmin, // Expose isAdmin
    userDisplayName,
    userEmail,
    userPhotoURL,
    userInitial,
    userUid, // Expose userUid

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