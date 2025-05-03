// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@unocss/nuxt',
  ],
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
        sans: 'Inter:200,300,400,500,600,700,800',
        mono: 'JetBrains Mono:400,500,600',
      },
    },
    // safelist for dark mode classes
    safelist: [
      ...Array.from({ length: 10 }, (_, i) => `dark:bg-dark-${i+1}`),
      ...Array.from({ length: 10 }, (_, i) => `dark:text-light-${i+1}`),
      'dark:border-gray-700',
      'dark:bg-gray-900',
      'dark:bg-gray-800',
      'dark:from-gray-800',
      'dark:to-gray-900',
      // Icon classes that need to be preserved
      'i-carbon-moon',
      'i-carbon-sun',
      'i-carbon-close',
      'i-carbon-menu',
      'i-carbon-email',
      'i-carbon-globe',
      'i-carbon-logo-github',
      'i-carbon-logo-apple',
      'i-carbon-logo-google',
      'i-carbon-logo-twitter',
      'i-carbon-game-console',
      'i-carbon-application',
      'i-carbon-software-resource',
      'i-carbon-machine-learning',
      'i-carbon-face-activated-add',
      'i-carbon-idea',
      'i-carbon-machine-learning-model',
      'i-carbon-chat',
      'i-carbon-image-search',
      'i-carbon-view-360',
      'i-carbon-touch-1',
      'i-carbon-augmented-reality',
      'i-carbon-cloud',
      'i-carbon-security',
      'i-carbon-chart-network',
      'i-carbon-data-vis-1',
    ]
  },
  css: [
    '@unocss/reset/tailwind.css',
    'animate.css/animate.min.css',
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
