export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Our Products
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore our suite of innovative applications and tools designed to enhance your digital
            experience.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Product Card 1 */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-6xl">📝</span>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">SylphNote</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                A beautiful and intuitive note-taking app with markdown support and cloud sync.
              </p>
              <button
                type="button"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Product Card 2 */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600">
              <span className="text-6xl">💬</span>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">SylphChat</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Real-time messaging platform with end-to-end encryption and rich media support.
              </p>
              <button
                type="button"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Product Card 3 */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
              <span className="text-6xl">🥽</span>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">VortexVR</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Immersive virtual reality experiences powered by cutting-edge technology.
              </p>
              <button
                type="button"
                className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
