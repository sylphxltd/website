'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { successToast } from '@/stores/toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    successToast('Message sent successfully! We will get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.currentTarget.value })
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.currentTarget.value })
  }

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, subject: e.currentTarget.value })
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, message: e.currentTarget.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-24 pb-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
            <span>📬 We're Here to Help</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Questions about our tools? Want to contribute? We'd love to hear from you.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-10">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleEmailChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={handleSubjectChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleMessageChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email Cards */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Email Us</h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">General Inquiries</p>
                  <a
                    href="mailto:hi@sylphx.com"
                    className="text-lg font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    hi@sylphx.com
                  </a>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Technical Support</p>
                  <a
                    href="mailto:support@sylphx.com"
                    className="text-lg font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    support@sylphx.com
                  </a>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Founder</p>
                  <a
                    href="mailto:kyle@sylphx.com"
                    className="text-lg font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    kyle@sylphx.com
                  </a>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
                <span className="text-3xl">🇬🇧</span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Location</h3>
              <p className="text-gray-600 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Sylphx Limited</strong>
                <br />
                Registered in London
                <br />
                United Kingdom
              </p>
            </div>

            {/* Social & GitHub */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600">
                <span className="text-3xl">🌐</span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Connect With Us
              </h3>
              <div className="space-y-3">
                <a
                  href="https://github.com/sylphxltd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="font-medium">github.com/sylphxltd</span>
                </a>
                <a
                  href="https://www.npmjs.com/org/sylphx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                  </svg>
                  <span className="font-medium">npmjs.com/org/sylphx</span>
                </a>
                <a
                  href="https://play.google.com/store/apps/dev?id=5436854094701432064"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.22 0c-.03.093-.06.185-.06.308v23.229c0 .185.03.278.123.37l11.915-11.978L1.22 0zm12.853 12.914L21 17.765c.308-.185.462-.37.462-.617s-.154-.432-.462-.617l-6.927-4.85-12.03 12.03 11.03-10.797z" />
                  </svg>
                  <span className="font-medium">Google Play</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mx-auto mt-20 max-w-4xl">
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-12 text-center dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Prefer to chat on GitHub?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Open an issue on any of our repositories for bug reports, feature requests, or
              technical questions. We're active in our community and respond quickly.
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
              Visit GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
