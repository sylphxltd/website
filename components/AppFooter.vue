<template>
  <footer class="bg-gray-900 dark:bg-gray-950 text-white py-12 md:py-16 mt-16">
    <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10">
        <div class="col-span-1 md:col-span-2">
          <div class="mb-6">
            <span class="text-2xl font-bold">Sylphx</span>
          </div>
          <p class="text-gray-300 max-w-xs mb-6">Creating simple, elegant, and deeply usable software across games, applications, and cutting-edge technologies.</p>
          <div class="flex flex-wrap gap-4">
            <a href="https://github.com/sylphxltd" target="_blank" class="w-10 h-10 rounded-full bg-blue-800/20 hover:bg-blue-800/30 flex items-center justify-center transition">
              <div class="i-carbon-logo-github text-lg text-gray-300"></div>
            </a>
            <!-- Placeholder for future App Store link -->
            <a href="#" class="w-10 h-10 rounded-full bg-blue-800/20 hover:bg-blue-800/30 flex items-center justify-center transition opacity-50 cursor-not-allowed">
              <div class="i-carbon-logo-apple text-lg text-gray-300"></div>
            </a>
            <!-- Placeholder for future Google Play link -->
            <a href="#" class="w-10 h-10 rounded-full bg-blue-800/20 hover:bg-blue-800/30 flex items-center justify-center transition opacity-50 cursor-not-allowed">
              <div class="i-carbon-logo-google text-lg text-gray-300"></div>
            </a>
            <!-- Placeholder for future social media -->
            <a href="#" class="w-10 h-10 rounded-full bg-blue-800/20 hover:bg-blue-800/30 flex items-center justify-center transition opacity-50 cursor-not-allowed">
              <div class="i-carbon-logo-twitter text-lg text-gray-300"></div>
            </a>
          </div>
        </div>
        <div>
          <h4 class="font-semibold mb-5 text-base">Pages</h4>
          <div class="flex flex-col gap-3">
            <template v-for="link in navLinks.filter(l => !l.external)" :key="link.path">
              <NuxtLink :to="link.path" class="text-gray-300 hover:text-blue-400 transition decoration-none">{{ link.name }}</NuxtLink>
            </template>
          </div>
        </div>
        <div>
          <h4 class="font-semibold mb-5 text-base">Contact</h4>
          <div class="flex flex-col gap-3">
            <a href="mailto:support@sylphx.com" class="text-gray-300 hover:text-blue-400 transition decoration-none flex items-center gap-2">
              <div class="i-carbon-email text-base"></div>
              <span>support@sylphx.com</span>
            </a>
            <a href="https://sylphx.com" target="_blank" class="text-gray-300 hover:text-blue-400 transition decoration-none flex items-center gap-2">
              <div class="i-carbon-globe text-base"></div>
              <span>sylphx.com</span>
            </a>
            <a href="https://github.com/sylphxltd" target="_blank" class="text-gray-300 hover:text-blue-400 transition decoration-none flex items-center gap-2">
              <div class="i-carbon-logo-github text-base"></div>
              <span>github.com/sylphxltd</span>
            </a>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-800 pt-5 flex flex-wrap justify-between gap-4">
        <p class="text-gray-500 text-sm">&copy; {{ new Date().getFullYear() }} Sylphx Limited. All rights reserved.</p>
        <div class="flex gap-4">
          <button @click="$emit('toggle-dark')" class="text-gray-500 hover:text-gray-300 transition text-sm flex items-center gap-1.5">
            <div v-if="isDark" class="i-carbon-moon text-base text-indigo-400"></div>
            <div v-else class="i-carbon-sun text-base text-blue-600"></div>
            <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  isDark: Boolean,
  navLinks: Array
});

defineEmits(['toggle-dark']);
</script>