import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FileText,
  Activity,
  Database,
  Github,
  Star,
  Download,
  CheckCircle2,
  Zap,
  ArrowRight,
  Code2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sylphx - Democratizing AI Through Elegant Code',
  description:
    'Production-ready, open-source AI infrastructure. 5-10x faster PDF processing, 1.7-45x faster state management, 94% test coverage. Built for developers.',
}

const stats = [
  { icon: Star, value: '300+', label: 'GitHub Stars' },
  { icon: Download, value: '8,000+', label: 'NPM Downloads' },
  { icon: CheckCircle2, value: '94%+', label: 'Test Coverage' },
  { icon: Code2, value: '10+', label: 'Open Source Projects' },
]

const features = [
  {
    icon: FileText,
    name: 'PDF Reader MCP',
    description: '5-10x faster PDF processing with production-grade reliability',
    gradient: 'from-indigo-500 to-purple-600',
    stats: '300+ stars, 4K+ downloads',
  },
  {
    icon: Activity,
    name: 'Zen State Management',
    description: 'Hyper-optimized state at 1.45 kB. 1.7-45x faster than alternatives',
    gradient: 'from-emerald-500 to-teal-600',
    stats: '1.45 kB gzipped',
  },
  {
    icon: Database,
    name: 'Firestore ODM',
    description: 'Type-safe Object-Document Mapper. 20% faster with complete type safety',
    gradient: 'from-yellow-500 to-orange-600',
    stats: '120 pub points',
  },
]

const performance = [
  { value: '5-10x', label: 'Faster PDF Processing' },
  { value: '1.7-45x', label: 'Faster State Updates' },
  { value: '94%+', label: 'Test Coverage' },
]

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pb-20 pt-32">
        {/* Gradient Background */}
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-cyan-500/30 blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="container relative mx-auto max-w-7xl">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/50 dark:bg-gray-900/70 dark:text-indigo-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              <span>Open Source AI Infrastructure</span>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-6 text-center">
            <h1 className="mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:via-gray-200 dark:to-white md:text-6xl lg:text-7xl">
              Democratizing AI
              <br />
              Through Elegant Code
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300 md:text-2xl">
              Production-ready, open-source infrastructure that makes AI development faster, safer,
              and more reliable.
            </p>
          </div>

          {/* CTAs */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-base font-semibold text-white transition-all hover:shadow-xl hover:shadow-indigo-500/50"
            >
              Explore Products
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://github.com/sylphxltd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-900 bg-white px-8 py-3 text-base font-semibold text-gray-900 transition-all hover:bg-gray-50 dark:border-white dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              <Github className="h-5 w-5" />
              View on GitHub
            </a>
          </div>

          {/* Stats Grid */}
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/70"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <stat.icon className="mb-3 h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  <div className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Featured Products
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Battle-tested tools powering the next generation of AI applications
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 p-8 backdrop-blur-sm transition-all hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 dark:border-gray-700/50 dark:bg-gray-800/90"
              >
                {/* Gradient Overlay */}
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-20 blur-3xl transition-opacity group-hover:opacity-30`} />

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 backdrop-blur-sm">
                    <feature.icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    {feature.name}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {feature.stats}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="rounded-3xl border border-gray-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 backdrop-blur-sm dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-800">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                Performance First
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                We obsess over benchmarks and real-world performance
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {performance.map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="mb-2 text-5xl font-bold text-indigo-600 dark:text-indigo-400 md:text-6xl">
                    {metric.value}
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Source CTA */}
      <section className="relative px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl border border-gray-200/50 bg-white/90 p-12 text-center backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90">
            <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Built in the Open
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              All our tools are open-source and MIT licensed. We believe everyone deserves access to
              great tools.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://github.com/sylphxltd"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg bg-gray-900 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <Github className="h-5 w-5" />
                Explore on GitHub
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-900 bg-white px-8 py-3 text-base font-semibold text-gray-900 transition-all hover:bg-gray-50 dark:border-white dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
              >
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
