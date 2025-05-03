<template>
  <header
    class="w-full z-40 transition-all duration-300 fixed top-0 backdrop-blur"
    :class="{ 'bg-white/90 dark:bg-gray-900/90 shadow-md py-2': isScrolled || mobileMenuOpen, 'py-3': !isScrolled && !mobileMenuOpen }"
    ref="navbar"
  >
    <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
      <div class="flex justify-between items-center h-12">
        <NuxtLink to="/" class="flex items-center gap-2 decoration-none">
          <img src="/images/logo.png" alt="Sylphx Logo" class="h-6 w-auto" />
          <span class="text-indigo-600 dark:text-indigo-400 text-xl font-bold tracking-tight">Sylphx</span>
        </NuxtLink>
        <div class="flex items-center gap-4 md:gap-6">
          <!-- Desktop Navigation -->
          <nav class="hidden md:flex gap-5">
            <template v-for="link in navLinks" :key="link.path">
              <NuxtLink
                v-if="!link.external"
                :to="link.path"
                class="text-gray-800 dark:text-gray-200 font-medium text-sm relative py-1 decoration-none transition hover:text-blue-600 dark:hover:text-blue-400"
                active-class="text-blue-600 dark:text-blue-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400"
              >
                {{ link.name }}
              </NuxtLink>
              <a
                v-else
                :href="link.path"
                class="text-gray-800 dark:text-gray-200 font-medium text-sm relative py-1 decoration-none transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                {{ link.name }}
              </a>
            </template>
          </nav>
          <!-- Auth Status -->
          <AuthStatus />
          <!-- Dark mode toggle -->
          <!-- Removed ClientOnly wrapper -->
          <button @click="$emit('toggle-dark')" class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div v-if="isDark" class="i-carbon-moon text-lg text-indigo-400"></div>
            <div v-else class="i-carbon-sun text-lg text-blue-600"></div>
          </button>
          <!-- Mobile menu button -->
          <button @click="$emit('toggle-mobile-menu')" class="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div v-if="mobileMenuOpen" class="i-carbon-close text-lg"></div>
            <div v-else class="i-carbon-menu text-lg"></div>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isDark: Boolean,
  isScrolled: Boolean,
  mobileMenuOpen: Boolean,
  navLinks: Array
});

defineEmits(['toggle-dark', 'toggle-mobile-menu']);
</script>