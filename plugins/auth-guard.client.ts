import { useCurrentUser } from 'vuefire'
import { watch } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  const currentUser = useCurrentUser()
  const router = useRouter() // Get router instance

  // Define public pages
  const publicPages = ['/login', '/magic-link', '/privacy']

  // Watch the currentUser state provided by vuefire
  watch(currentUser, (newUser, oldUser) => {
    // We only want to react once the initial state is resolved (not null initially)
    // or when the user state actually changes (login/logout)
    // oldUser === undefined means initial check, newUser !== undefined means user is loaded
    // newUser === null means user logged out

    const isAuthenticated = !!newUser
    const currentPath = router.currentRoute.value.path // Get current path

    // Determine if the current route requires authentication
    const authRequired = !publicPages.includes(currentPath)

    console.log(`[Auth Guard Plugin] User state changed. Path: ${currentPath}, AuthRequired: ${authRequired}, IsAuthenticated: ${isAuthenticated}`)

    // Scenario 1: Route requires authentication, but user is not authenticated
    if (authRequired && !isAuthenticated) {
      console.log(`[Auth Guard Plugin] Redirecting to /login from ${currentPath}`)
      // Optionally store intended destination
      // sessionStorage.setItem('redirectAfterLogin', currentPath)
      navigateTo('/login')
    }

    // Scenario 2: Route does NOT require authentication (e.g., /login), but user IS authenticated
    if (!authRequired && isAuthenticated && currentPath === '/login') {
      console.log('[Auth Guard Plugin] User authenticated. Redirecting from /login to /') // Use regular string
      navigateTo('/') // Redirect to home or dashboard
    }

  }, { immediate: true }) // immediate: true to run the check initially when the plugin loads
})