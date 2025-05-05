// File: middleware/admin-only.ts - Reverted to client-side focus
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware((to, from) => {
  // This middleware primarily handles client-side redirection after hydration,
  // relying on the store state which includes SSR-initialized data.
  // It also acts as a final check if SSR somehow failed.

  // Skip server-side execution for this version
  if (process.server) {
    console.log('[Admin Only Middleware - Server] Skipping server-side execution.');
    return;
  }

  console.log('[Admin Only Middleware - Client] Checking access...');
  const userStore = useUserStore();

  // Wait for auth to be ready client-side (optional, depends on store setup)
  // await userStore.waitForAuthInit(); // Assuming such a method exists or is added

  // Check authentication first
  if (!userStore.isAuthenticated) {
    console.log('[Admin Only Middleware - Client] Not authenticated. Redirecting.');
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true });
  }

  // Check admin status using the store's computed property (which reads useState)
  if (!userStore.isAdmin) {
    console.warn(`[Admin Only Middleware - Client] Admin access required but userStore.isAdmin is false. Redirecting from ${to.path}.`);
    return navigateTo('/', { replace: true }); // Redirect non-admins home
  }

  console.log('[Admin Only Middleware - Client] Admin access granted.');
})