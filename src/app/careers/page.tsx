export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Join Our Team
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Be part of a team that's building the future of digital experiences.
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-8">
          {/* Why Join Us */}
          <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Why Work at Sylphx?
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 text-2xl">🚀</div>
                <h3 className="mb-1 font-bold text-gray-900 dark:text-white">Innovation First</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Work with cutting-edge technologies and contribute to groundbreaking projects.
                </p>
              </div>
              <div>
                <div className="mb-2 text-2xl">🌟</div>
                <h3 className="mb-1 font-bold text-gray-900 dark:text-white">
                  Growth Opportunities
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Continuous learning and career development with mentorship from industry experts.
                </p>
              </div>
              <div>
                <div className="mb-2 text-2xl">🏠</div>
                <h3 className="mb-1 font-bold text-gray-900 dark:text-white">Remote Friendly</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Work from anywhere with flexible hours and a focus on work-life balance.
                </p>
              </div>
              <div>
                <div className="mb-2 text-2xl">💰</div>
                <h3 className="mb-1 font-bold text-gray-900 dark:text-white">
                  Competitive Benefits
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Competitive salary, equity options, health insurance, and more.
                </p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Open Positions
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                We're currently building our team. Check back soon for open positions, or reach out
                to us at{' '}
                <a
                  href="mailto:careers@sylphx.com"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  careers@sylphx.com
                </a>{' '}
                if you're interested in joining us.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Even if we don't have an open position that matches your skills, we'd love to hear
                from talented individuals who are passionate about technology and innovation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
