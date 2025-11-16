import { Title } from '@solidjs/meta'
import type { Component } from 'solid-js'

const Privacy: Component = () => {
  return (
    <>
      <Title>Privacy Policy - Sylphx</Title>
      <div class="min-h-screen bg-white pt-24 pb-16 dark:bg-gray-900">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mx-auto max-w-4xl">
            <h1 class="mb-8 text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>

            <div class="prose prose-lg max-w-none dark:prose-invert">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2>Introduction</h2>
              <p>
                At Sylphx, we take your privacy seriously. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you visit our website or
                use our applications.
              </p>

              <h2>Information We Collect</h2>
              <p>We may collect information about you in a variety of ways, including:</p>
              <ul>
                <li>
                  <strong>Personal Data:</strong> Information you provide directly, such as your name
                  and email address when you contact us.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information automatically collected when you use our
                  services, such as IP address, browser type, and pages visited.
                </li>
              </ul>

              <h2>Use of Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website and applications</li>
                <li>Send you updates and marketing communications (with your consent)</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your
                personal information. However, no method of transmission over the Internet is 100%
                secure.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your personal information</li>
              </ul>

              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@sylphx.com">privacy@sylphx.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Privacy
