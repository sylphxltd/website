// Design System Constants
// Centralized design tokens for consistent styling across the application

export const spacing = {
  section: {
    y: 'py-16 md:py-24',
    top: 'pt-24 md:pt-32',
    bottom: 'pb-16 md:pb-24',
  },
  card: {
    padding: 'p-6 md:p-8',
    paddingLarge: 'p-8 md:p-12',
    gap: 'gap-6 md:gap-8',
  },
  content: {
    maxWidth: {
      prose: 'max-w-2xl',
      content: 'max-w-4xl',
      wide: 'max-w-6xl',
      full: 'max-w-7xl',
    },
  },
} as const

export const typography = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold leading-tight tracking-tight',
  h3: 'text-2xl md:text-3xl font-bold leading-snug',
  h4: 'text-xl md:text-2xl font-bold leading-snug',
  body: 'text-base leading-relaxed text-gray-700 dark:text-gray-200',
  bodyLarge: 'text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-200',
  bodySmall: 'text-sm leading-normal text-gray-600 dark:text-gray-300',
  label: 'text-sm font-medium leading-normal',
} as const

export const iconSizes = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  base: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
} as const

export const transitions = {
  fast: 'transition-all duration-150 ease-out',
  base: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-300 ease-out',
} as const

export const focusRing = {
  base: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  input:
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400',
} as const

export const card = {
  base: 'rounded-2xl border border-gray-200/50 bg-white/70 backdrop-blur-md shadow-sm dark:border-gray-700/50 dark:bg-gray-800/70',
  hover:
    'rounded-2xl border border-gray-200/50 bg-white/70 backdrop-blur-md shadow-sm transition-all hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 dark:border-gray-700/50 dark:bg-gray-800/70',
  gradient: 'rounded-2xl border border-gray-200/50 bg-white/70 backdrop-blur-md shadow-sm dark:border-gray-700/50 dark:bg-gray-800/70 relative overflow-hidden',
} as const

export const badge = {
  base: 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
  primary: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
  success: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
} as const

export const button = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white transition-all hover:shadow-xl hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-900 bg-white px-6 py-3 text-base font-semibold text-gray-900 transition-all hover:bg-gray-50 dark:border-white dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800',
  ghost:
    'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
} as const
