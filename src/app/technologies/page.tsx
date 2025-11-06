import type { Metadata } from 'next'
import {
  BookOpen,
  Target,
  Plug2,
  Package,
  Atom,
  Triangle,
  Smartphone,
  Activity,
  Hammer,
  Flame,
  Container,
  Settings,
  Leaf,
  Palette,
  Brain,
  Star,
  Zap,
  Shield,
  CheckCircle2,
  Globe,
  FileText,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Technologies - Sylphx',
  description:
    'Built with TypeScript, MCP, React, Flutter, Dart, and Bun. Performance-first, type-safe infrastructure for AI and beyond.',
}

const technologies = [
  {
    category: 'Core Languages',
    items: [
      {
        name: 'TypeScript',
        description: 'Type-safe development with 100% TypeScript coverage. No compromises.',
        icon: BookOpen,
        gradient: 'from-blue-500 to-blue-700',
        features: ['Strict mode', 'No any types', 'Full inference'],
      },
      {
        name: 'Dart',
        description: 'Null-safe, AOT-compiled language for mobile and beyond.',
        icon: Target,
        gradient: 'from-cyan-500 to-blue-600',
        features: ['Sound null safety', 'Fast compilation', 'Flutter-ready'],
      },
    ],
  },
  {
    category: 'Frameworks & Runtimes',
    items: [
      {
        name: 'Model Context Protocol',
        description: 'Leading the MCP ecosystem with 300+ starred PDF Reader MCP.',
        icon: Plug2,
        gradient: 'from-indigo-500 to-purple-600',
        features: ['5-10x faster PDF processing', 'Filesystem operations', 'RAG integration'],
      },
      {
        name: 'Bun',
        description: 'Blazingly fast JavaScript runtime and package manager.',
        icon: Package,
        gradient: 'from-orange-500 to-red-600',
        features: ['3x faster npm install', 'Built-in TypeScript', 'Native bundler'],
      },
      {
        name: 'React 19',
        description: 'Latest React with concurrent features and optimizations.',
        icon: Atom,
        gradient: 'from-blue-400 to-cyan-600',
        features: ['Server components', 'Suspense', 'Transitions'],
      },
      {
        name: 'Next.js 16',
        description: 'Production-grade React framework with Turbopack.',
        icon: Triangle,
        gradient: 'from-gray-800 to-gray-900',
        features: ['App Router', 'Turbopack', 'Server actions'],
      },
      {
        name: 'Flutter',
        description: 'Cross-platform UI toolkit for mobile, web, and desktop.',
        icon: Smartphone,
        gradient: 'from-sky-500 to-blue-600',
        features: ['Native performance', 'Hot reload', 'Rich widgets'],
      },
    ],
  },
  {
    category: 'State Management & Data',
    items: [
      {
        name: 'Zen',
        description: '1.7-45x faster state management. 1.45 kB gzipped.',
        icon: Activity,
        gradient: 'from-emerald-500 to-teal-600',
        features: ['Framework-agnostic', 'Async support', 'Deep observability'],
      },
      {
        name: 'Craft',
        description: '1.4-35x faster immutable updates. 39% smaller than Immer.',
        icon: Hammer,
        gradient: 'from-orange-500 to-red-600',
        features: ['Structural sharing', 'JSON Patches', 'Zero dependencies'],
      },
      {
        name: 'Firestore ODM',
        description: 'Type-safe Object-Document Mapper for Cloud Firestore.',
        icon: Flame,
        gradient: 'from-yellow-500 to-orange-600',
        features: ['20% faster', 'Complete type safety', 'Smart Builder'],
      },
    ],
  },
  {
    category: 'Infrastructure & Tools',
    items: [
      {
        name: 'Docker',
        description: 'Containerized deployments for all MCP servers and tools.',
        icon: Container,
        gradient: 'from-blue-500 to-blue-700',
        features: ['Compose ready', 'Multi-stage builds', 'Health checks'],
      },
      {
        name: 'Vercel',
        description: 'Edge network deployment with instant rollbacks.',
        icon: Triangle,
        gradient: 'from-black to-gray-800',
        features: ['Edge functions', 'Preview deploys', 'Analytics'],
      },
      {
        name: 'GitHub Actions',
        description: 'CI/CD with 94%+ test coverage enforcement.',
        icon: Settings,
        gradient: 'from-gray-700 to-gray-900',
        features: ['Automated testing', 'Release automation', 'PR checks'],
      },
      {
        name: 'Biome',
        description: 'Ultra-fast linter and formatter replacing ESLint + Prettier.',
        icon: Leaf,
        gradient: 'from-green-500 to-emerald-600',
        features: ['100x faster', 'All-in-one', 'Zero config'],
      },
    ],
  },
  {
    category: 'AI & Embeddings',
    items: [
      {
        name: 'ChromaDB',
        description: 'Local vector database for RAG and semantic search.',
        icon: Palette,
        gradient: 'from-purple-500 to-pink-600',
        features: ['Privacy-first', 'Embedding storage', 'Semantic queries'],
      },
      {
        name: 'Ollama',
        description: 'Local LLM embeddings for RAG Server MCP.',
        icon: Brain,
        gradient: 'from-indigo-500 to-purple-600',
        features: ['No API keys', 'Local processing', 'Fast embeddings'],
      },
      {
        name: 'StarCoder2',
        description: 'Code tokenization for MEP paradigm in Sylphx Flow.',
        icon: Star,
        gradient: 'from-yellow-500 to-orange-600',
        features: ['30x faster prompts', '50x shorter context', '95% accuracy'],
      },
    ],
  },
]

export default function TechnologiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-24 pb-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/50 dark:bg-gray-900/70 dark:text-indigo-300">
            <Zap className="h-4 w-4" />
            <span>Performance-First Stack</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Built for Speed & Safety
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Type-safe, battle-tested technologies powering the next generation of AI infrastructure
          </p>
        </div>

        {/* Technologies by Category */}
        {technologies.map((category) => (
          <div key={category.category} className="mx-auto mb-20 max-w-6xl">
            <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
              {category.category}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((tech) => (
                <div
                  key={tech.name}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 backdrop-blur-sm transition-all hover:border-indigo-500 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/90"
                >
                  {/* Icon Header */}
                  <div
                    className={`flex h-32 items-center justify-center bg-gradient-to-br ${tech.gradient}`}
                  >
                    <tech.icon className="h-12 w-12 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                      {tech.name}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                      {tech.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {tech.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Philosophy */}
        <div className="mx-auto mb-20 max-w-5xl">
          <div className="rounded-3xl border border-gray-200/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90 md:p-12">
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
              Our Technology Philosophy
            </h2>
            <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300">
              <p>
                We don't chase trends. We build on proven, performant technologies that align with
                our core values:
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Performance First
                  </h3>
                  <p className="text-base">
                    Every technology choice is benchmarked. If it doesn't make things faster,
                    it doesn't make the cut.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Type Safety
                  </h3>
                  <p className="text-base">
                    100% type coverage. No escape hatches. Catch bugs at compile time, not in
                    production.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Battle Tested
                  </h3>
                  <p className="text-base">
                    94%+ test coverage. Extensive CI/CD. Real-world production usage at scale.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <Globe className="h-5 w-5 text-emerald-500" />
                    Open Source
                  </h3>
                  <p className="text-base">
                    MIT licensed. Community-driven. Build in public. Everyone deserves great tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-gray-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 backdrop-blur-sm dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-800">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Performance Metrics
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  value: '5-10x',
                  label: 'PDF Processing Speed',
                  description: 'PDF Reader MCP vs alternatives',
                  icon: FileText,
                },
                {
                  value: '1.7-45x',
                  label: 'State Update Speed',
                  description: 'Zen vs Redux, Zustand, Jotai',
                  icon: Activity,
                },
                {
                  value: '30x',
                  label: 'Prompt Creation Speed',
                  description: 'MEP paradigm in Sylphx Flow',
                  icon: Zap,
                },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
