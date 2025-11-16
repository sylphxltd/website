import { Title } from '@solidjs/meta'
import { Rocket, Star, Home, DollarSign, Briefcase } from 'lucide-solid'
import type { Component } from 'solid-js'

const Careers: Component = () => {
  return (
    <>
      <Title>Careers - Sylphx</Title>
      <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-24 pb-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="mx-auto mb-16 max-w-4xl text-center">
            <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-800 backdrop-blur-sm dark:border-indigo-800/50 dark:bg-gray-900/70 dark:text-indigo-200">
              <Briefcase class="h-4 w-4" />
              <span>Join Our Mission</span>
            </div>
            <h1 class="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Join Our Team
            </h1>
            <p class="text-xl text-gray-700 dark:text-gray-200">
              Be part of a team that's building the future of AI infrastructure.
            </p>
          </div>

          <div class="mx-auto max-w-5xl space-y-8">
            {/* Why Join Us */}
            <div class="rounded-2xl border border-gray-200/50 bg-white/70 p-8 shadow-sm backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/70 md:p-12">
              <h2 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
                Why Work at Sylphx?
              </h2>
              <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div class="group">
                  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Rocket class="h-6 w-6 text-white" />
                  </div>
                  <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Innovation First
                  </h3>
                  <p class="text-gray-700 dark:text-gray-200">
                    Work with cutting-edge technologies and contribute to groundbreaking projects.
                  </p>
                </div>
                <div class="group">
                  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600">
                    <Star class="h-6 w-6 text-white" />
                  </div>
                  <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Growth Opportunities
                  </h3>
                  <p class="text-gray-700 dark:text-gray-200">
                    Continuous learning and career development with mentorship from industry experts.
                  </p>
                </div>
                <div class="group">
                  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                    <Home class="h-6 w-6 text-white" />
                  </div>
                  <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Remote Friendly
                  </h3>
                  <p class="text-gray-700 dark:text-gray-200">
                    Work from anywhere with flexible hours and a focus on work-life balance.
                  </p>
                </div>
                <div class="group">
                  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                    <DollarSign class="h-6 w-6 text-white" />
                  </div>
                  <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Competitive Benefits
                  </h3>
                  <p class="text-gray-700 dark:text-gray-200">
                    Competitive salary, equity options, health insurance, and more.
                  </p>
                </div>
              </div>
            </div>

            {/* Open Positions */}
            <div class="rounded-2xl border border-gray-200/50 bg-white/70 p-8 shadow-sm backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/70 md:p-12">
              <h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                Open Positions
              </h2>
              <div class="space-y-4">
                <p class="text-lg text-gray-700 dark:text-gray-200">
                  We're currently building our team. Check back soon for open positions, or reach out
                  to us at{' '}
                  <a
                    href="mailto:careers@sylphx.com"
                    class="text-indigo-600 transition-colors hover:text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    careers@sylphx.com
                  </a>{' '}
                  if you're interested in joining us.
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  Even if we don't have an open position that matches your skills, we'd love to hear
                  from talented individuals who are passionate about technology and innovation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Careers
