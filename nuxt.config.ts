// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@unocss/nuxt',
    'nuxt-vuefire', // Revert back to module name
    '@pinia/nuxt', // Add Pinia module
  ],
  vuefire: { // This should be the correct structure according to docs
    auth: {
      enabled: true,
      sessionCookie: true,
    },
    config: {
      // Rely on nuxt-vuefire automatically reading from runtimeConfig.public
      // or directly from process.env.FIREBASE_...
      // Restoring direct process.env reads to potentially fix SSR initialization issues.
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },
  runtimeConfig: { // Use runtimeConfig to expose env variables
    // nuxt-vuefire should automatically pick up GOOGLE_APPLICATION_CREDENTIALS from process.env
    // We don't need to explicitly define it here unless we need it elsewhere server-side.
    public: {
      // Public runtime config (client-side accessible)
      // nuxt-vuefire reads client config from vuefire.config or process.env directly.
      // Defining them here might be redundant if vuefire.config is sufficient.
      // firebaseApiKey: process.env.FIREBASE_API_KEY, // Removed, relying on vuefire.config
      // firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN, // Removed, relying on vuefire.config
      // firebaseProjectId: process.env.FIREBASE_PROJECT_ID, // Removed, relying on vuefire.config
      // firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Removed, relying on vuefire.config
      // firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID, // Removed, relying on vuefire.config
      // firebaseAppId: process.env.FIREBASE_APP_ID, // Removed, relying on vuefire.config
      // firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID, // Removed, relying on vuefire.config
    }
  },
  unocss: {
    // presets
    uno: true,
    attributify: true,
    typography: true,
    icons: {
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    },
    webFonts: {
      provider: 'google',
      fonts: {
        sans: 'Inter:300,400,500,600,700', // Removed unused weights 200, 800
        mono: 'JetBrains Mono:400', // Removed unused weights 500, 600
      },
    },
    // safelist for dark mode classes
    // safelist is generally not needed with UnoCSS as it scans the codebase.
    // Removing the safelist to rely on build-time scanning.
    safelist: []
  },
  css: [
    '@unocss/reset/tailwind.css',
    // 'animate.css/animate.min.css', // Removed, using UnoCSS animations instead
  ],
  app: {
    head: {
      title: 'Sylphx - Simple, Elegant & Usable Software',
      meta: [
        { name: 'description', content: 'Sylphx creates digital products that empower without overwhelming. We believe technology should serve life, not disrupt it. Focused on simple, elegant and deeply usable experiences.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#4f46e5' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/logo.png' },
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
