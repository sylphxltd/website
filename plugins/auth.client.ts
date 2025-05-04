import { useUserStore } from '~/stores/user'

export default defineNuxtPlugin(async (nuxtApp) => {
  // This plugin runs only on the client side after hydration.
  console.log('Initializing client-side auth listener plugin...');

  const userStore = useUserStore();

  // Initialize the listener from the user store.
  // This will set up the onIdTokenChanged listener.
  userStore.initAuthListener();

  console.log('Client-side auth listener initialized via plugin.');

  // No need to provide anything here, just initializing the listener.
});