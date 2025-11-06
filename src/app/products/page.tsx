import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products - Sylphx',
  description:
    'Production-ready tools for the AI revolution. MCP servers, state management, and type-safe database solutions.',
}

const products = [
  {
    category: 'Model Context Protocol',
    items: [
      {
        name: 'PDF Reader MCP',
        description: '5-10x faster PDF processing for AI agents with production-grade reliability',
        icon: '📄',
        stars: '300+',
        downloads: '4K+',
        gradient: 'from-indigo-500 to-purple-600',
        badges: ['TypeScript', 'MCP', '94% Coverage'],
        links: {
          github: 'https://github.com/sylphxltd/pdf-reader-mcp',
          npm: 'https://www.npmjs.com/package/@sylphx/pdf-reader-mcp',
        },
        highlights: [
          'Automatic parallelization',
          '~12,933 ops/sec performance',
          'Batch processing support',
          'Docker deployment ready',
        ],
      },
      {
        name: 'Filesystem MCP',
        description: 'Secure, token-efficient filesystem access for AI agents with batch operations',
        icon: '📁',
        stars: '6',
        downloads: '1K+',
        gradient: 'from-blue-500 to-cyan-600',
        badges: ['TypeScript', 'MCP', 'Security'],
        links: {
          github: 'https://github.com/sylphxltd/filesystem-mcp',
          npm: 'https://www.npmjs.com/package/@sylphx/filesystem-mcp',
        },
        highlights: [
          'Comprehensive file operations',
          'Permission controls',
          'Regex-based searching',
          'POSIX operations',
        ],
      },
      {
        name: 'RAG Server MCP',
        description: 'Retrieval-Augmented Generation with local vector database and privacy-first design',
        icon: '🔍',
        stars: '18',
        downloads: '500+',
        gradient: 'from-purple-500 to-pink-600',
        badges: ['TypeScript', 'ChromaDB', 'Privacy-First'],
        links: {
          github: 'https://github.com/sylphxltd/rag-server-mcp',
        },
        highlights: [
          'ChromaDB + Ollama embeddings',
          'Local processing',
          'Hierarchical chunking',
          'Docker Compose ready',
        ],
      },
    ],
  },
  {
    category: 'State Management & Utilities',
    items: [
      {
        name: 'Zen',
        description: 'Hyper-optimized state management. 1.7-45x faster than competitors',
        icon: '🧘',
        stars: '2',
        size: '1.45 kB',
        gradient: 'from-emerald-500 to-teal-600',
        badges: ['TypeScript', 'Framework-agnostic', 'Performance'],
        links: {
          github: 'https://github.com/sylphxltd/zen',
          npm: 'https://www.npmjs.com/package/@sylphx/zen',
        },
        highlights: [
          '1.45 kB gzipped',
          '1.7-45x faster',
          'React, Vue, Solid.js support',
          'First-class async support',
        ],
      },
      {
        name: 'Craft',
        description: 'The fastest immutable state library. 1.4-35x faster than Immer',
        icon: '⚒️',
        stars: '2',
        size: '2.9 kB',
        gradient: 'from-orange-500 to-red-600',
        badges: ['TypeScript', 'Immutability', 'Zero Dependencies'],
        links: {
          github: 'https://github.com/sylphxltd/craft',
          npm: 'https://www.npmjs.com/package/@sylphx/craft',
        },
        highlights: [
          '39% smaller than Immer',
          '1.4-35x faster',
          'Structural sharing',
          'JSON Patches support',
        ],
      },
    ],
  },
  {
    category: 'Developer Tools',
    items: [
      {
        name: 'Sylphx Flow',
        description: 'AI development platform with MEP paradigm. 30x faster prompt creation',
        icon: '🌊',
        stars: '4',
        gradient: 'from-violet-500 to-purple-600',
        badges: ['TypeScript', 'AI', 'Terminal + Web'],
        links: {
          github: 'https://github.com/sylphxltd/flow',
        },
        highlights: [
          '30x faster prompts',
          '50x shorter context',
          '95% context accuracy',
          'StarCoder2 tokenization',
        ],
      },
      {
        name: 'Sylphx Code',
        description: 'AI code assistant built for speed and flexibility with 30x faster communication',
        icon: '💻',
        stars: '2',
        gradient: 'from-blue-600 to-indigo-600',
        badges: ['TypeScript', 'tRPC', 'Multi-Provider'],
        links: {
          github: 'https://github.com/sylphxltd/sylphx-code',
        },
        highlights: [
          '30x faster than HTTP',
          'Zero-serialization tRPC',
          'Terminal + Web UI',
          '10+ built-in tools',
        ],
      },
    ],
  },
  {
    category: 'Mobile & Database',
    items: [
      {
        name: 'Firestore ODM',
        description: 'Type-safe Object-Document Mapper for Firestore. 20% faster with complete type safety',
        icon: '🔥',
        stars: '10',
        pubPoints: '120',
        gradient: 'from-yellow-500 to-orange-600',
        badges: ['Dart', 'Flutter', 'Type-Safe'],
        links: {
          github: 'https://github.com/sylphxltd/firestore_odm',
          pub: 'https://pub.dev/packages/firestore_odm',
        },
        highlights: [
          '20% faster runtime',
          'Complete type safety',
          'Streaming aggregations',
          'Smart Builder pagination',
        ],
      },
      {
        name: 'Sudoku Master',
        description: 'Logic puzzle game with 45 carefully crafted puzzles across three difficulty levels',
        icon: '🎮',
        downloads: '1,000+',
        gradient: 'from-pink-500 to-rose-600',
        badges: ['Android', 'Puzzle', 'Games'],
        links: {
          playStore:
            'https://play.google.com/store/apps/details?id=com.sylphx.sudoku',
        },
        highlights: [
          'Three difficulty levels',
          '45 curated puzzles',
          'Intuitive interface',
          'Offline play',
        ],
      },
    ],
  },
]

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-24 pb-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
            <span>10+ Open Source Projects</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Production-Ready Tools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Battle-tested infrastructure powering the next generation of AI applications. All open-source,
            type-safe, and blazingly fast.
          </p>
        </div>

        {/* Products by Category */}
        {products.map((category) => (
          <div key={category.category} className="mb-20">
            <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
              {category.category}
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((product) => (
                <div
                  key={product.name}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-indigo-500 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Gradient Icon Header */}
                  <div
                    className={`flex h-32 items-center justify-center bg-gradient-to-br ${product.gradient}`}
                  >
                    <span className="text-5xl">{product.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.stars && (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                            ⭐ {product.stars}
                          </span>
                        )}
                        {product.size && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            {product.size}
                          </span>
                        )}
                        {product.pubPoints && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {product.pubPoints} pts
                          </span>
                        )}
                        {product.downloads && (
                          <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            {product.downloads}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.description}
                    </p>

                    {/* Badges */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {product.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    {/* Highlights */}
                    <ul className="mb-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {product.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    {/* Links */}
                    <div className="flex flex-wrap gap-2">
                      {product.links.github && (
                        <a
                          href={product.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                          GitHub
                        </a>
                      )}
                      {product.links.npm && (
                        <a
                          href={product.links.npm}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                          </svg>
                          NPM
                        </a>
                      )}
                      {product.links.pub && (
                        <a
                          href={product.links.pub}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 22.5C6.21 22.5 1.5 17.79 1.5 12S6.21 1.5 12 1.5 22.5 6.21 22.5 12 17.79 22.5 12 22.5z" />
                          </svg>
                          pub.dev
                        </a>
                      )}
                      {product.links.playStore && (
                        <a
                          href={product.links.playStore}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1.22 0c-.03.093-.06.185-.06.308v23.229c0 .185.03.278.123.37l11.915-11.978L1.22 0zm12.853 12.914L21 17.765c.308-.185.462-.37.462-.617s-.154-.432-.462-.617l-6.927-4.85-12.03 12.03 11.03-10.797z" />
                          </svg>
                          Play Store
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="mt-20 rounded-3xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 text-center dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Want to Contribute?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            All our tools are open-source and MIT licensed. We welcome contributions from the community.
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
            Explore on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
