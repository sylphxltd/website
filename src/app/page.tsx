import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              Production-ready AI infrastructure
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
              Democratizing AI
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Through Elegant Code
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
              Building production-ready tools for the AI revolution. Open-source, type-safe, and
              blazingly fast.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/50"
              >
                Explore Products
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="https://github.com/sylphxltd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-900 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">300+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">GitHub Stars</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">8K+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">NPM Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">94%+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Test Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">10+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Open Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Production-Ready Tools
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Battle-tested, type-safe infrastructure powering the next generation of AI applications
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* PDF Reader MCP */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-indigo-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl" />
              <div className="relative">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
                    <svg
                      className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    300+ ⭐
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">PDF Reader MCP</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  5-10x faster PDF processing for AI agents with production-grade reliability
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    TypeScript
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    MCP
                  </span>
                </div>
              </div>
            </div>

            {/* Zen State */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-purple-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl" />
              <div className="relative">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                    <span className="text-2xl">🧘</span>
                  </div>
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    1.45 kB
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Zen State</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  1.7-45x faster than competitors. The smallest, fastest state management library
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    Framework-agnostic
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    TypeScript
                  </span>
                </div>
              </div>
            </div>

            {/* Firestore ODM */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-pink-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20 blur-2xl" />
              <div className="relative">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-pink-100 p-3 dark:bg-pink-900/30">
                    <svg
                      className="h-6 w-6 text-pink-600 dark:text-pink-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  </div>
                  <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-semibold text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                    120 pts
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Firestore ODM</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Type-safe Firestore operations. 20% faster with complete compile-time validation
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    Dart
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    Flutter
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View all products
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Performance That Speaks
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              We don't just claim to be fast—we prove it with benchmarks
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-indigo-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 text-5xl font-bold text-indigo-600 dark:text-indigo-400">5-10x</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">Faster PDF Processing</div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Automatic parallelization and optimized algorithms
              </p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 text-5xl font-bold text-purple-600 dark:text-purple-400">1.7-45x</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">Faster State Updates</div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Zen outperforms Zustand, Jotai, and others
              </p>
            </div>

            <div className="rounded-2xl border border-pink-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 text-5xl font-bold text-pink-600 dark:text-pink-400">94%+</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">Test Coverage</div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Production-ready quality you can trust
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Open Source
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Built in the Open
              </h2>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
                All our tools are MIT licensed and available on GitHub. Join our community and help
                shape the future of AI infrastructure.
              </p>
              <a
                href="https://github.com/sylphxltd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Star us on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Ready to Build Something Amazing?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Join developers worldwide using Sylphx tools to build the next generation of AI-powered
            applications.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-indigo-700"
            >
              Get in Touch
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-900 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Explore Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
