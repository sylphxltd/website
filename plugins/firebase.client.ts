import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId,
  }

  // Check if all necessary config values are present
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    console.error(
      'Firebase configuration is incomplete. Check your .env file or Vercel environment variables.',
      firebaseConfig
    )
    // Optionally provide a dummy app or throw an error to prevent further issues
    // For now, we just log the error. The Firebase SDK will likely throw its own error later.
    return 
  }

  try {
    initializeApp(firebaseConfig)
    console.log('Firebase Client Initialized Successfully')
  } catch (error) {
    console.error('Error initializing Firebase Client:', error)
  }

  // Note: We don't need to provide the app instance globally here,
  // as Firebase SDK functions (like getAuth, getFirestore) will automatically
  // use the initialized default app. Vuefire composables also handle this.
})