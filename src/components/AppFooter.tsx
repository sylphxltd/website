import { A } from '@solidjs/router'
import { Logo } from './Logo'
import type { Component } from 'solid-js'

const productLinks = [{ name: 'All Products', path: '/products' }]

const companyLinks = [
  { name: 'About', path: '/about' },
  { name: 'Technologies', path: '/technologies' },
  { name: 'Careers', path: '/careers' },
  { name: 'Contact', path: '/contact' },
]

const legalLinks = [
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Cookie Policy', path: '/cookies' },
]

export const AppFooter: Component = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer class="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and about section */}
          <div class="col-span-1">
            <div class="mb-4">
              <Logo />
            </div>
            <p class="mb-4 text-sm text-gray-700 dark:text-gray-300">
              Simple, elegant & usable software. Creating digital products that empower without
              overwhelming.
            </p>
            <div class="flex space-x-4">
              <a
                href="https://x.com/SylphxAI"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                aria-label="X"
              >
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com/sylphxltd"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                aria-label="GitHub"
              >
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fill-rule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clip-rule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Products section */}
          <div class="col-span-1">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Products
            </h3>
            <ul class="space-y-3">
              {productLinks.map((link) => (
                <li>
                  <A
                    href={link.path}
                    class="text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    {link.name}
                  </A>
                </li>
              ))}
            </ul>
          </div>

          {/* Company section */}
          <div class="col-span-1">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Company
            </h3>
            <ul class="space-y-3">
              {companyLinks.map((link) => (
                <li>
                  <A
                    href={link.path}
                    class="text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    {link.name}
                  </A>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal section */}
          <div class="col-span-1">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Legal
            </h3>
            <ul class="space-y-3">
              {legalLinks.map((link) => (
                <li>
                  <A
                    href={link.path}
                    class="text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    {link.name}
                  </A>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div class="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
          <p class="text-center text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} Sylphx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
