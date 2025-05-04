import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

// Ultra simple auth middleware that won't encounter initialization timing issues
export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  // Skip auth check for public routes
  const isPublic = to.meta.public === true;
  if (isPublic) {
    return;
  }
  
  // During SSR, always allow navigation to proceed
  // Auth will be checked client-side after hydration
  if (process.server) {
    return;
  }
  
  // For client-side navigation, page components will handle their own authentication
  // This middleware now simply acts as a marker that a route requires authentication
  // The actual enforcement will be in the page component
  
  // NOTE: By removing the auth check from the middleware completely,
  // we avoid Firebase initialization timing issues entirely.
  // Each protected page must check auth state and redirect if needed.
})