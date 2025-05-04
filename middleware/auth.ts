// Middleware logic moved to a client-side plugin (e.g., plugins/auth-guard.client.ts)
// to better handle Firebase initialization timing.
export default defineNuxtRouteMiddleware((to, from) => {
  // console.log(`[Auth Middleware] Navigating from ${from.path} to ${to.path}. Logic handled by plugin.`);
  // No redirection logic here anymore.
})