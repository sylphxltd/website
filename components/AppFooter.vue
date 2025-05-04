<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-12">
        <!-- Logo and company info -->
        <div class="md:col-span-2">
          <div class="flex items-center mb-4">
            <img src="/images/logo.png" alt="SylphX" class="h-10 w-auto">
            <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">SylphX</span>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Powering the next generation of applications with innovative solutions for modern businesses.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <span class="i-carbon-logo-github text-xl"></span>
            </a>
            <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <span class="i-carbon-logo-twitter text-xl"></span>
            </a>
            <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <span class="i-carbon-logo-linkedin text-xl"></span>
            </a>
            <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <span class="i-carbon-logo-facebook text-xl"></span>
            </a>
          </div>
        </div>
        
        <!-- Quick links -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Home
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/apps" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Applications
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/technologies" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Technologies
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Privacy Policy
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Resources -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Tutorials
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Blog
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                API Reference
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Contact -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
          <ul class="space-y-2">
            <li class="flex items-start">
              <span class="i-carbon-email mt-1 mr-2 text-gray-400"></span>
              <a href="mailto:info@sylphx.com" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                info@sylphx.com
              </a>
            </li>
            <li class="flex items-start">
              <span class="i-carbon-phone mt-1 mr-2 text-gray-400"></span>
              <a href="tel:+15551234567" class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                +1 (555) 123-4567
              </a>
            </li>
            <li class="flex items-start">
              <span class="i-carbon-location mt-1 mr-2 text-gray-400"></span>
              <span class="text-gray-600 dark:text-gray-300">
                123 Tech Avenue<br>
                San Francisco, CA 94107
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="border-t border-gray-200 dark:border-gray-700 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          &copy; {{ new Date().getFullYear() }} SylphX. All rights reserved.
        </p>
        <div class="mt-4 md:mt-0 flex space-x-6">
          <NuxtLink to="/privacy" class="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white">
            Privacy Policy
          </NuxtLink>
          <NuxtLink to="/terms" class="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white">
            Terms of Service
          </NuxtLink>
          <NuxtLink to="/cookies" class="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white">
            Cookie Policy
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>