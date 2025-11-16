import { Title } from '@solidjs/meta'
import type { Component } from 'solid-js'

const Cookies: Component = () => {
  return (
    <>
      <Title>Cookie Policy - Sylphx</Title>
      <div class="min-h-screen bg-white pt-24 pb-16 dark:bg-gray-900">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mx-auto max-w-4xl">
            <h1 class="mb-8 text-4xl font-bold text-gray-900 dark:text-white">Cookie Policy</h1>

            <div class="prose prose-lg max-w-none dark:prose-invert">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2>What Are Cookies</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when
                you visit a website. They are widely used to make websites work more efficiently and
                provide information to the owners of the site.
              </p>

              <h2>How We Use Cookies</h2>
              <p>We use cookies for the following purposes:</p>
              <ul>
                <li>
                  <strong>Essential Cookies:</strong> These cookies are necessary for the website to
                  function properly.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> These help us understand how visitors interact
                  with our website.
                </li>
                <li>
                  <strong>Preference Cookies:</strong> These remember your preferences and settings.
                </li>
              </ul>

              <h2>Types of Cookies We Use</h2>
              <ul>
                <li>Session cookies: Temporary cookies that expire when you close your browser</li>
                <li>Persistent cookies: Cookies that remain on your device for a set period</li>
              </ul>

              <h2>Managing Cookies</h2>
              <p>
                You can control and/or delete cookies as you wish. You can delete all cookies that are
                already on your computer and you can set most browsers to prevent them from being
                placed.
              </p>

              <h2>Contact</h2>
              <p>
                If you have questions about our use of cookies, please contact us at{' '}
                <a href="mailto:privacy@sylphx.com">privacy@sylphx.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Cookies
