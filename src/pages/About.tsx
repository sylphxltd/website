import { Title, Meta } from '@solidjs/meta'
import {
  MapPin,
  Star,
  Package,
  CheckCircle2,
  Rocket,
  Zap,
  Shield,
  Globe,
  Gem,
  UserCircle2,
  Github,
} from 'lucide-solid'
import type { Component } from 'solid-js'
import { For } from 'solid-js'

const About: Component = () => {
  return (
    <>
      <Title>About - Sylphx</Title>
      <Meta
        name="description"
        content="Democratizing AI through elegant, production-ready open-source tools. Founded by Kyle Tse, registered in London."
      />
      <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-24 pb-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="mx-auto mb-16 max-w-4xl text-center">
            <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/50 dark:bg-gray-900/70 dark:text-indigo-300">
              <MapPin class="h-4 w-4" />
              <span>Registered in London</span>
            </div>
            <h1 class="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Democratizing AI Through Elegant Code
            </h1>
            <p class="text-xl text-gray-700 dark:text-gray-200">
              Building the infrastructure that empowers the next generation of AI applications
            </p>
          </div>

          {/* Mission */}
          <div class="mx-auto mb-20 max-w-5xl">
            <div class="rounded-3xl border border-gray-200/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90 md:p-12">
              <h2 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              <p class="mb-6 text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                At Sylphx, we believe that powerful AI tools should be accessible to everyone. We're
                building production-ready, open-source infrastructure that makes AI development
                faster, safer, and more reliable.
              </p>
              <p class="mb-6 text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                Our tools power AI agents, state management systems, and developer workflows at
                companies around the world. From 5-10x faster PDF processing to 1.7-45x faster state
                management, we're obsessed with performance and developer experience.
              </p>
              <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                Everything we build is <strong class="text-gray-900 dark:text-white">open-source</strong>,
                <strong class="text-gray-900 dark:text-white"> type-safe</strong>, and
                <strong class="text-gray-900 dark:text-white"> battle-tested</strong> with 94%+ test coverage.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div class="mx-auto mb-20 max-w-6xl">
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <For each={[
                {
                  value: '300+',
                  label: 'GitHub Stars',
                  icon: Star,
                  gradient: 'from-yellow-500 to-orange-600',
                },
                {
                  value: '8,000+',
                  label: 'NPM Downloads',
                  icon: Package,
                  gradient: 'from-red-500 to-pink-600',
                },
                {
                  value: '94%+',
                  label: 'Test Coverage',
                  icon: CheckCircle2,
                  gradient: 'from-green-500 to-emerald-600',
                },
                {
                  value: '10+',
                  label: 'Open Source Projects',
                  icon: Rocket,
                  gradient: 'from-blue-500 to-indigo-600',
                },
              ]}>
                {(stat) => (
                  <div class="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 p-6 backdrop-blur-sm transition-all hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/90">
                    <div
                      class={`absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 transition-opacity group-hover:opacity-20`}
                    />
                    <div class="relative">
                      <stat.icon class="mb-2 h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                      <div class="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div class="text-sm text-gray-700 dark:text-gray-300">{stat.label}</div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Values */}
          <div class="mx-auto mb-20 max-w-6xl">
            <h2 class="mb-10 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Our Values
            </h2>
            <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <For each={[
                {
                  title: 'Performance First',
                  icon: Zap,
                  description:
                    '5-10x, 1.7-45x, 30x faster. We obsess over benchmarks and real-world performance.',
                  gradient: 'from-yellow-500 to-orange-600',
                },
                {
                  title: 'Type Safety',
                  icon: Shield,
                  description:
                    'Complete type safety across TypeScript, Dart, and all our tools. Catch bugs at compile time.',
                  gradient: 'from-blue-500 to-indigo-600',
                },
                {
                  title: 'Open Source',
                  icon: Globe,
                  description:
                    'MIT licensed, community-driven, and built in public. Everyone deserves access to great tools.',
                  gradient: 'from-green-500 to-emerald-600',
                },
                {
                  title: 'Battle Tested',
                  icon: CheckCircle2,
                  description:
                    '94%+ test coverage, extensive CI/CD, and real-world production usage at scale.',
                  gradient: 'from-purple-500 to-pink-600',
                },
                {
                  title: 'Developer Experience',
                  icon: Gem,
                  description:
                    'Minimal APIs, clear documentation, and thoughtful design. Your time is precious.',
                  gradient: 'from-cyan-500 to-blue-600',
                },
                {
                  title: 'Innovation',
                  icon: Rocket,
                  description:
                    'From MCP servers to MEP paradigms, we pioneer new approaches to old problems.',
                  gradient: 'from-red-500 to-rose-600',
                },
              ]}>
                {(value) => (
                  <div class="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 p-6 backdrop-blur-sm transition-all hover:border-indigo-500 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/90">
                    <div
                      class={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${value.gradient} text-white`}
                    >
                      <value.icon class="h-6 w-6" />
                    </div>
                    <h3 class="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                      {value.title}
                    </h3>
                    <p class="text-gray-700 dark:text-gray-300">{value.description}</p>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Founder */}
          <div class="mx-auto mb-20 max-w-4xl">
            <div class="rounded-3xl border border-gray-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 backdrop-blur-sm dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-800 md:p-12">
              <div class="flex flex-col gap-8 md:flex-row md:items-center">
                <div class="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <UserCircle2 class="h-20 w-20 text-white" stroke-width={1.5} />
                </div>
                <div>
                  <h2 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                    Founded by Kyle Tse
                  </h2>
                  <p class="mb-4 text-lg text-indigo-600 dark:text-indigo-400">
                    Software Engineer & Open Source Advocate
                  </p>
                  <p class="mb-4 text-gray-700 dark:text-gray-200">
                    Kyle founded Sylphx with a vision to democratize AI through elegant, performant
                    open-source tools. With a focus on type safety, performance optimization, and
                    developer experience, he's built a suite of production-ready infrastructure used
                    by developers worldwide.
                  </p>
                  <p class="text-gray-700 dark:text-gray-200">
                    From pioneering MCP servers that process PDFs 5-10x faster to state management
                    libraries that outperform the competition by 45x, Kyle's work reflects a
                    commitment to pushing the boundaries of what's possible in modern software
                    development.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div class="mx-auto mb-20 max-w-5xl">
            <div class="rounded-3xl border border-gray-200/50 bg-white/90 p-8 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90 md:p-12">
              <h2 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
                Company Information
              </h2>
              <div class="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
                    Legal Name
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300">Sylphx Limited</p>
                </div>
                <div>
                  <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
                    Registration
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300">Registered in London, United Kingdom</p>
                </div>
                <div>
                  <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
                    Business Type
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300">
                    Open Source Software Development
                  </p>
                </div>
                <div>
                  <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
                    Focus Areas
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300">
                    AI Infrastructure, State Management, Developer Tools
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div class="mx-auto max-w-4xl text-center">
            <div class="rounded-3xl border border-gray-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 backdrop-blur-sm dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-800">
              <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                Join Our Open Source Community
              </h2>
              <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-700 dark:text-gray-200">
                We're building the future of AI infrastructure in the open. Contribute code, report
                bugs, or just star our repos to show your support.
              </p>
              <div class="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://github.com/sylphxltd"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  <Github class="h-5 w-5" />
                  GitHub
                </a>
                <a
                  href="https://www.npmjs.com/org/sylphx"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 rounded-lg border-2 border-gray-900 bg-white px-8 py-3 text-base font-semibold text-gray-900 transition-all hover:bg-gray-50 dark:border-white dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Package class="h-5 w-5" />
                  NPM
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default About
