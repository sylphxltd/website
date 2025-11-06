export default function TechnologiesPage() {
  const technologies = [
    {
      name: 'React & Next.js',
      description: 'Building modern, performant web applications with the latest React ecosystem.',
      icon: '⚛️',
    },
    {
      name: 'TypeScript',
      description: 'Type-safe development for robust and maintainable code.',
      icon: '📘',
    },
    {
      name: 'Tailwind CSS',
      description: 'Rapid UI development with utility-first CSS framework.',
      icon: '🎨',
    },
    {
      name: 'Bun',
      description: 'Lightning-fast JavaScript runtime and package manager.',
      icon: '🍞',
    },
    {
      name: 'Zen State',
      description: 'Hyper-optimized state management at only 1.45 kB gzipped.',
      icon: '🧘',
    },
    {
      name: 'AI & Machine Learning',
      description: 'Integrating AI capabilities for smarter applications.',
      icon: '🤖',
    },
  ]

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Our Technologies
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We leverage cutting-edge technologies to build fast, reliable, and scalable
            applications.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 text-4xl">{tech.icon}</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{tech.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{tech.description}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-4xl rounded-xl border border-gray-100 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Why These Technologies?
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              We carefully select our technology stack based on performance, developer experience,
              and long-term maintainability. Our choices reflect our commitment to:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Building fast, responsive user interfaces</li>
              <li>Ensuring type safety and code quality</li>
              <li>Optimizing bundle sizes for better performance</li>
              <li>Providing excellent developer experience</li>
              <li>Future-proofing our applications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
