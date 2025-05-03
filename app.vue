<template>
  <div class="font-sans min-h-screen flex flex-col transition-colors duration-300" :class="{ 'dark': isDark }">
    <div class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex-grow flex flex-col">
      <header 
        class="w-full z-40 transition-all duration-300 fixed top-0 backdrop-blur" 
        :class="{ 'bg-white/90 dark:bg-gray-900/90 shadow-md py-2': isScrolled || mobileMenuOpen, 'py-3': !isScrolled && !mobileMenuOpen }" 
        ref="navbar">
        <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div class="flex justify-between items-center h-12">
            <NuxtLink to="/" class="flex items-center gap-2 decoration-none">
              <img src="/images/logo.png" alt="Sylphx Logo" class="h-6 w-auto" />
              <span class="text-indigo-600 dark:text-indigo-400 text-xl font-bold tracking-tight">Sylphx</span>
            </NuxtLink>
            <div class="flex items-center gap-4 md:gap-6">
              <!-- Navigation -->
              <nav class="hidden md:flex gap-5">
                <NuxtLink to="/" class="text-gray-800 dark:text-gray-200 font-medium text-sm relative py-1 decoration-none transition hover:text-blue-600 dark:hover:text-blue-400" 
                  active-class="text-blue-600 dark:text-blue-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400">
                  About
                </NuxtLink>
                <NuxtLink to="/products" class="text-gray-800 dark:text-gray-200 font-medium text-sm relative py-1 decoration-none transition hover:text-blue-600 dark:hover:text-blue-400"
                  active-class="text-blue-600 dark:text-blue-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400">
                  Products
                </NuxtLink>
                <NuxtLink to="/technologies" class="text-gray-800 dark:text-gray-200 font-medium text-sm relative py-1 decoration-none transition hover:text-blue-600 dark:hover:text-blue-400"
                  active-class="text-blue-600 dark:text-blue-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400">
                  Technologies
                </NuxtLink>
                <NuxtLink to="/privacy" class="text-gray-800 dark:text-gray-200 font-medium text-sm relative py-1 decoration-none transition hover:text-blue-600 dark:hover:text-blue-400"
                  active-class="text-blue-600 dark:text-blue-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400">
                  Privacy Policy
                </NuxtLink>
                <a href="mailto:support@sylphx.com" class="text-gray-800 dark:text-gray-200 font-medium text-sm relative py-1 decoration-none transition hover:text-blue-600 dark:hover:text-blue-400">
                  Contact
                </a>
              </nav>
              <!-- Auth Status -->
              <AuthStatus />
              <!-- Dark mode toggle -->
              <button @click="toggleDark()" class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div v-if="isDark" class="i-carbon-moon text-lg text-indigo-400"></div>
                <div v-else class="i-carbon-sun text-lg text-blue-600"></div>
              </button>
              <!-- Mobile menu button -->
              <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div v-if="mobileMenuOpen" class="i-carbon-close text-lg"></div>
                <div v-else class="i-carbon-menu text-lg"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-30 bg-white dark:bg-gray-900 pt-16">
        <div class="px-4 py-6 flex flex-col gap-4 text-center">
          <NuxtLink @click="mobileMenuOpen = false" to="/" class="text-gray-800 dark:text-gray-200 font-medium text-lg py-3">
            About
          </NuxtLink>
          <NuxtLink @click="mobileMenuOpen = false" to="/products" class="text-gray-800 dark:text-gray-200 font-medium text-lg py-3">
            Products
          </NuxtLink>
          <NuxtLink @click="mobileMenuOpen = false" to="/technologies" class="text-gray-800 dark:text-gray-200 font-medium text-lg py-3">
            Technologies
          </NuxtLink>
          <NuxtLink @click="mobileMenuOpen = false" to="/privacy" class="text-gray-800 dark:text-gray-200 font-medium text-lg py-3">
            Privacy Policy
          </NuxtLink>
          <a @click="mobileMenuOpen = false" href="mailto:support@sylphx.com" class="text-gray-800 dark:text-gray-200 font-medium text-lg py-3">
            Contact
          </a>
          <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
            <button @click="toggleDark(); mobileMenuOpen = false" class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div v-if="isDark" class="i-carbon-moon text-base text-indigo-400"></div>
              <div v-else class="i-carbon-sun text-base text-blue-600"></div>
              <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>
          </div>
        </div>
      </div>

      <main class="flex-1 pt-16 md:pt-20">
        <NuxtPage />
      </main>

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
                <NuxtLink to="/" class="text-gray-300 hover:text-blue-400 transition decoration-none">About</NuxtLink>
                <NuxtLink to="/products" class="text-gray-300 hover:text-blue-400 transition decoration-none">Products</NuxtLink>
                <NuxtLink to="/technologies" class="text-gray-300 hover:text-blue-400 transition decoration-none">Technologies</NuxtLink>
                <NuxtLink to="/privacy" class="text-gray-300 hover:text-blue-400 transition decoration-none">Privacy Policy</NuxtLink>
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
              <button @click="toggleDark()" class="text-gray-500 hover:text-gray-300 transition text-sm flex items-center gap-1.5">
                <div v-if="isDark" class="i-carbon-moon text-base text-indigo-400"></div>
                <div v-else class="i-carbon-sun text-base text-blue-600"></div>
                <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      <!-- Global Toast Notifications -->
      <Toast />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
const toggleDark = useToggle(isDark);

const isScrolled = ref(false);
const navbar = ref(null);
const mobileMenuOpen = ref(false);

function handleScroll() {
  if (window.scrollY > 20) {
    isScrolled.value = true;
  } else {
    isScrolled.value = false;
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Check on initial mount
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Close mobile menu when viewport resizes to desktop size
const onResize = () => {
  if (window.innerWidth >= 768 && mobileMenuOpen.value) {
    mobileMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: color 0.3s, background-color 0.3s;
}

html.dark body {
  background-color: #121826;
  color: #f8fafc;
}
</style>
