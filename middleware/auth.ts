import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip this middleware during SSR
  if (process.server) return;
  
  const userStore = useUserStore();
  
  // Check if user is authenticated
  if (!userStore.isAuthenticated) {
    // Redirect to login with the redirect parameter in the URL
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});