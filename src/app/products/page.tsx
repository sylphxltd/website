import type { Metadata } from 'next'
import {
  FileText,
  Folder,
  Search,
  Activity,
  Hammer,
  Waves,
  Code2,
  Flame,
  Gamepad2,
  Github,
  Package,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'

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
        icon: FileText,
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
        icon: Folder,
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
        icon: Search,
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
        icon: Activity,
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
        icon: Hammer,
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
        icon: Waves,
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
        icon: Code2,
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
        icon: Flame,
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
        icon: Gamepad2,
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/50 dark:bg-gray-900/70 dark:text-indigo-300">
            <Code2 className="h-4 w-4" />
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
                  className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 backdrop-blur-sm transition-all hover:border-indigo-500 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/90"
                >
                  {/* Gradient Icon Header */}
                  <div
                    className={`flex h-32 items-center justify-center bg-gradient-to-br ${product.gradient}`}
                  >
                    <product.icon className="h-12 w-12 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.stars && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                            <Star className="h-3 w-3" />
                            {product.stars}
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
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            <Download className="h-3 w-3" />
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
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
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
                          <Github className="h-4 w-4" />
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
                          <Package className="h-4 w-4" />
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
                          <ExternalLink className="h-4 w-4" />
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
                          <ExternalLink className="h-4 w-4" />
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
        <div className="mt-20 rounded-3xl border border-gray-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 text-center backdrop-blur-sm dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-800">
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
            <Github className="h-5 w-5" />
            Explore on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
