import { useUserStore } from '~/stores/user'
import { initializeApp, getApps, getApp as getFirebaseApp } from 'firebase/app';

interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string; // Often included as well
}

export default defineNuxtPlugin(async (nuxtApp) => {
  // This plugin runs only on the client side after hydration.
  console.log('Initializing client-side auth listener plugin...');

  const config = useRuntimeConfig();
  const firebaseConfig = config.public.firebase as FirebaseClientConfig;

  if (firebaseConfig?.apiKey && firebaseConfig?.projectId) {
    // Check if Firebase app has already been initialized (important for HMR)
    if (getApps().length === 0) {
      try {
        initializeApp(firebaseConfig);
        console.log('Client-side Firebase app initialized successfully.');
      } catch (error) {
        console.error('Error initializing client-side Firebase app:', error);
      }
    } else {
      console.log('Client-side Firebase app already initialized.');
      // Optionally, you can get the existing app: const existingApp = getFirebaseApp();
    }
  } else {
    console.error('CRITICAL: Firebase client configuration is missing or incomplete in runtimeConfig.public.firebase. App may not function correctly.');
    // Optionally throw an error here if Firebase is absolutely critical for app start
  }

  const userStore = useUserStore();

  // Initialize the listener from the user store.
  // This will set up the onIdTokenChanged listener.
  userStore.initAuthListener();

  console.log('Client-side auth listener initialized via plugin.');

  // No need to provide anything here, just initializing the listener.
});