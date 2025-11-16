import { createSignal } from 'solid-js'
import { Title } from '@solidjs/meta'
import { successToast } from '@/stores/toast'
import {
  Mail,
  MapPin,
  Network,
  MessageCircle,
  Github,
  Package,
  Smartphone,
  Send,
} from 'lucide-solid'
import type { Component } from 'solid-js'

const Contact: Component = () => {
  const [formData, setFormData] = createSignal({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = createSignal(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    successToast('Message sent successfully! We will get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  const handleNameChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    setFormData({ ...formData(), name: target.value })
  }

  const handleEmailChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    setFormData({ ...formData(), email: target.value })
  }

  const handleSubjectChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    setFormData({ ...formData(), subject: target.value })
  }

  const handleMessageChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement
    setFormData({ ...formData(), message: target.value })
  }

  return (
    <>
      <Title>Contact - Sylphx</Title>
      <div class="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-24 pb-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="mx-auto mb-16 max-w-4xl text-center">
            <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/50 dark:bg-gray-900/70 dark:text-indigo-300">
              <Mail class="h-4 w-4" />
              <span>We're Here to Help</span>
            </div>
            <h1 class="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Get in Touch
            </h1>
            <p class="text-xl text-gray-700 dark:text-gray-200">
              Questions about our tools? Want to contribute? We'd love to hear from you.
            </p>
          </div>

          <div class="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div class="rounded-3xl border border-gray-200/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90 md:p-10">
              <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} class="space-y-6">
                <div>
                  <label
                    for="name"
                    class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData().name}
                    onInput={handleNameChange}
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    for="email"
                    class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData().email}
                    onInput={handleEmailChange}
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    for="subject"
                    class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData().subject}
                    onInput={handleSubjectChange}
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label
                    for="message"
                    class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData().message}
                    onInput={handleMessageChange}
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting()}
                  class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting() ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send class="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div class="space-y-6">
              {/* Email Cards */}
              <div class="rounded-3xl border border-gray-200/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90">
                <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Mail class="h-8 w-8 text-white" />
                </div>
                <h3 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Email Us</h3>
                <div class="space-y-3">
                  <div>
                    <p class="mb-1 text-sm text-gray-700 dark:text-gray-300">General Inquiries</p>
                    <a
                      href="mailto:hi@sylphx.com"
                      class="text-lg font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      hi@sylphx.com
                    </a>
                  </div>
                  <div>
                    <p class="mb-1 text-sm text-gray-700 dark:text-gray-300">Technical Support</p>
                    <a
                      href="mailto:support@sylphx.com"
                      class="text-lg font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      support@sylphx.com
                    </a>
                  </div>
                  <div>
                    <p class="mb-1 text-sm text-gray-700 dark:text-gray-300">Founder</p>
                    <a
                      href="mailto:kyle@sylphx.com"
                      class="text-lg font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      kyle@sylphx.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div class="rounded-3xl border border-gray-200/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90">
                <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
                  <MapPin class="h-8 w-8 text-white" />
                </div>
                <h3 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Location</h3>
                <p class="text-gray-700 dark:text-gray-200">
                  <strong class="text-gray-900 dark:text-white">Sylphx Limited</strong>
                  <br />
                  Registered in London
                  <br />
                  United Kingdom
                </p>
              </div>

              {/* Social & GitHub */}
              <div class="rounded-3xl border border-gray-200/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90">
                <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600">
                  <Network class="h-8 w-8 text-white" />
                </div>
                <h3 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Connect With Us
                </h3>
                <div class="space-y-3">
                  <a
                    href="https://github.com/sylphxltd"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <Github class="h-5 w-5" />
                    <span class="font-medium">github.com/sylphxltd</span>
                  </a>
                  <a
                    href="https://www.npmjs.com/org/sylphx"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <Package class="h-5 w-5" />
                    <span class="font-medium">npmjs.com/org/sylphx</span>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/dev?id=5436854094701432064"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <Smartphone class="h-5 w-5" />
                    <span class="font-medium">Google Play</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div class="mx-auto mt-20 max-w-4xl">
            <div class="rounded-3xl border border-gray-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 text-center backdrop-blur-sm dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-800">
              <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <MessageCircle class="h-10 w-10 text-white" />
              </div>
              <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                Prefer to chat on GitHub?
              </h2>
              <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-700 dark:text-gray-200">
                Open an issue on any of our repositories for bug reports, feature requests, or
                technical questions. We're active in our community and respond quickly.
              </p>
              <a
                href="https://github.com/sylphxltd"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <Github class="h-5 w-5" />
                Visit GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact
