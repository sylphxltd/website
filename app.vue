<template>
  <div class="font-sans min-h-screen flex flex-col transition-colors duration-300">
    <div class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex-grow flex flex-col">
      
      <!-- Use AppHeader Component -->
      <AppHeader 
        :is-dark="isDark" 
        :is-scrolled="isScrolled" 
        :mobile-menu-open="mobileMenuOpen" 
        :nav-links="navLinks"
        @toggle-dark="toggleDark"
        @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen"
      />

      <!-- Use AppMobileMenu Component -->
      <AppMobileMenu 
        v-if="mobileMenuOpen" 
        :is-dark="isDark" 
        :nav-links="navLinks"
        @close-menu="mobileMenuOpen = false"
        @toggle-dark="toggleDark"
      />

      <main class="flex-1 pt-16 md:pt-20">
        <NuxtPage />
      </main>

      <!-- Use AppFooter Component -->
      <AppFooter 
        :is-dark="isDark" 
        :nav-links="navLinks"
        @toggle-dark="toggleDark"
      />
      
      <!-- Global Toast Notifications -->
      <Toast />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useDark, useToggle } from '@vueuse/core';
// import { useHead } from '#imports'; // Removed useHead import
import AppHeader from '~/components/AppHeader.vue';
import AppMobileMenu from '~/components/AppMobileMenu.vue';
import AppFooter from '~/components/AppFooter.vue';
// Toast component is likely auto-imported by Nuxt

const isDark = useDark();
const toggleDark = useToggle(isDark);

// Navigation Links
const navLinks = [
  { name: 'About', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Technologies', path: '/technologies' },
  { name: 'Instructions', path: '/instructions' }, // Added Instructions link
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Contact', path: 'mailto:support@sylphx.com', external: true },
];

const isScrolled = ref(false);
// const navbar = ref(null); // No longer needed as it's inside AppHeader
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

// useDark() automatically handles the 'dark' class on the <html> element.
// No need for manual useHead manipulation here.

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
  background-color: #121826; /* Consider moving this to a global CSS or UnoCSS config if possible */
  color: #f8fafc; /* Consider moving this to a global CSS or UnoCSS config if possible */
}
</style>
