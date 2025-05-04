// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@unocss/nuxt',
    'nuxt-vuefire', // Revert back to module name
    '@pinia/nuxt', // Add Pinia module
    '@vueuse/nuxt', // Add VueUse Nuxt module
  ],
  vuefire: { // This is needed for nuxt-vuefire module initialization
    auth: {
      enabled: true,
      sessionCookie: true,
    },
    config: {
      // These should be the original FIREBASE_ variables from .env for module init
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },
  runtimeConfig: {
    // Private keys are only available on the server side
    // Values can be overridden by environment variables (e.g., NUXT_GOOGLE_APPLICATION_CREDENTIALS)
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '', // Read from env var
    public: {
      // Public keys that are exposed to the client side
      // Note: vuefire config is automatically made public
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
  },
  css: [
    '@unocss/reset/tailwind.css',
    '@milkdown/theme-nord/style.css', // Use Nord theme CSS for @milkdown/kit
    // '@milkdown/crepe/theme/common/style.css', // Removed Crepe styles
    // '@milkdown/crepe/theme/nord.css', // Removed Crepe styles
    // '@milkdown/prose/style/prosemirror.css', // Removed
    // 'animate.css/animate.min.css', // Removed
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
  },
  vite: {
    ssr: {
      // Force Vite to bundle these packages for SSR, potentially resolving CSS import issues
      noExternal: [
        /@milkdown\/.*/, // Match all @milkdown packages
        /prosemirror-.*/, // Match prosemirror related packages if needed
      ],
    },
  },
  vueuse: {
    ssrHandlers: true, // Enable SSR handlers for VueUse
  }
})
