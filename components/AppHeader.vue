<template>
  <header 
    class="fixed top-0 left-0 right-0 z-30 transition-all duration-300" 
    :class="[
      isScrolled ? 'bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10' : 'bg-transparent'
    ]"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 md:h-20">
        <!-- Logo and Main Navigation -->
        <div class="flex items-center">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="SylphX" 
              class="h-8 w-auto transition-opacity duration-300"
              :class="{ 'opacity-90': !isScrolled, 'opacity-100': isScrolled }"
            />
            <span 
              class="ml-2 text-lg md:text-xl font-semibold transition-colors duration-300"
              :class="isScrolled ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-100'"
            >
              SylphX
            </span>
          </NuxtLink>

          <!-- Desktop Main Navigation -->
          <nav class="hidden md:ml-10 md:flex md:space-x-6">
            <NuxtLink 
              v-for="link in publicNavLinks" 
              :key="link.path" 
              :to="link.path" 
              class="text-base font-medium transition-colors duration-300"
              :class="[
                isScrolled 
                  ? 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white' 
                  : 'text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'
              ]"
            >
              {{ link.name }}
            </NuxtLink>
          </nav>
        </div>

        <!-- Right side: auth status, dark mode, mobile menu toggle -->
        <div class="flex items-center space-x-4">
          <!-- Dark Mode Toggle -->
          <button 
            @click="$emit('toggleDark')" 
            class="flex items-center justify-center w-9 h-9 rounded-full focus:outline-none transition-colors duration-300"
            :class="[
              isScrolled
                ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                : 'hover:bg-gray-100/20 dark:hover:bg-gray-700/20 text-gray-700 dark:text-gray-200'
            ]"
            aria-label="Toggle dark mode"
          >
            <span v-if="isDark" class="i-carbon-moon text-lg"></span>
            <span v-else class="i-carbon-sun text-lg"></span>
          </button>

          <!-- Auth Status / User Menu -->
          <AuthStatus />

          <!-- Admin Dashboard Link (if admin) -->
          <NuxtLink 
            v-if="userStore.isAuthenticated && userStore.isAdmin"
            to="/admin"
            class="py-2 px-3 text-sm rounded-md font-medium transition-colors duration-300 bg-indigo-600 hover:bg-indigo-700 text-white hidden md:block"
          >
            Admin
          </NuxtLink>

          <!-- Mobile menu button -->
          <button 
            @click="$emit('toggleMobileMenu')" 
            class="md:hidden flex items-center justify-center w-9 h-9 rounded-full focus:outline-none transition-colors duration-300"
            :class="[
              isScrolled
                ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                : 'hover:bg-gray-100/20 dark:hover:bg-gray-700/20 text-gray-700 dark:text-gray-200'
            ]"
            aria-label="Toggle mobile menu"
          >
            <span v-if="mobileMenuOpen" class="i-carbon-close text-lg"></span>
            <span v-else class="i-carbon-menu text-lg"></span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '~/stores/user';

// Props
const props = defineProps({
  isScrolled: Boolean,
  isDark: Boolean,
  mobileMenuOpen: Boolean,
  navLinks: Array
});

// Emit events back to parent for toggling dark mode and mobile menu
defineEmits(['toggleDark', 'toggleMobileMenu']);

// Get user store for auth status
const userStore = useUserStore();

// Only show public links in the main navigation
const publicNavLinks = computed(() => {
  return props.navLinks.filter(link => !link.adminOnly && !link.authRequired);
});
</script>