import { useUserStore } from '~/stores/user'
import { useToastStore } from '~/stores/toast' // Import toast store

export default defineNuxtRouteMiddleware((to, from) => {
  // Ensure this runs only on the client-side where store state is reliable after init
  if (process.server) {
    return; // Middleware logic relies on client-side auth state
  }

  const userStore = useUserStore()
  const toastStore = useToastStore() // Get toast store instance

  // Initialize the listener if it hasn't been already (important for direct access/refresh)
  // This might be better placed in a plugin, but ensures it runs if accessed directly
  if (typeof window !== 'undefined' && !userStore.loading) { // Check if not already loading state
      userStore.initAuthListener();
  }


  // Need to wait for auth state to be potentially initialized
  // A simple check might not be enough if the page loads before the auth state is confirmed.
  // However, for a basic implementation, we check the current state.
  // A more robust solution might involve watching the store's state or using a plugin.

  if (!userStore.isAuthenticated || !userStore.isAdmin) {
    console.warn('Access denied: User is not an admin or not authenticated.');
    toastStore.error('Access Denied: You do not have permission to view this page.', 5000); // Show error toast
    // Redirect non-admins away
    // Redirect to home page or a specific 'access-denied' page
    return navigateTo('/');
  }

  // If user is admin, allow access
  console.log('Admin access granted.');
})