<template>
  <header 
    :class="[
      'fixed w-full z-50 transition-all duration-300',
      isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    ]"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 md:h-20">
        <!-- Logo and site name -->
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div :class="[
            'relative h-9 w-9 flex items-center justify-center rounded overflow-hidden transition-colors',
            (isScrolled || isDark) ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-white'
          ]">
            <img src="/images/logo.png" alt="SylphX Logo" class="h-6 w-6">
          </div>
          <span 
            :class="[
              'text-xl font-bold transition-colors',
              (isScrolled || isDark) ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
            ]"
          >
            Sylphx
          </span>
        </NuxtLink>

        <!-- Desktop navigation -->
        <nav class="hidden md:flex space-x-1">
            <!-- Iterate over headerLinks from useNavigation -->
            <NuxtLink
              v-for="link in headerLinks"
              :key="link.path"
              :to="link.path"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center', // Added flex items-center
                isActiveRoute(link.path)
                  ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
                  : (isScrolled || isDark)
                    ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                    : 'text-gray-800 hover:text-gray-900 hover:bg-white/20 dark:text-white dark:hover:text-white dark:hover:bg-white/10'
              ]">
              <span v-if="link.icon" :class="[link.icon, 'mr-2 text-base']"></span> <!-- Optional icon -->
              {{ link.name }}
            </NuxtLink>
          
          <!-- Auth buttons (Sign In/Sign Up/Sign Out) -->
          <template v-if="!userStore.isAuthenticated">
            <NuxtLink 
              to="/login" 
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                (isScrolled || isDark)
                  ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  : 'text-gray-800 hover:text-gray-900 hover:bg-white/20 dark:text-white dark:hover:text-white dark:hover:bg-white/10'
              ]"
            >
              Sign In
            </NuxtLink>
            <NuxtLink 
              to="/register" 
              :class="[
                'ml-2 px-4 py-2 rounded-md text-sm font-medium',
                (isScrolled || isDark)
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-white text-indigo-600 hover:bg-gray-100'
              ]"
            >
              Sign Up
            </NuxtLink>
          </template>
          <!-- Re-add Sign Out button for authenticated users -->
          <template v-if="userStore.isAuthenticated">
             <!-- Corrected: Call store action -->
             <button
               @click="userStore.signOutUser"
               :class="[
                 'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                 (isScrolled || isDark)
                   ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                   : 'text-gray-800 hover:text-gray-900 hover:bg-white/20 dark:text-white dark:hover:text-white dark:hover:bg-white/10'
               ]"
             >
               Sign Out
             </button>
          </template>
        </nav>

        <!-- Right side items -->
        <div class="flex items-center space-x-4">
          <!-- Dark mode toggle -->
          <button 
            @click="$emit('toggle-dark')" 
            class="rounded-md p-2 focus:outline-none"
            :class="[
              (isScrolled || isDark)
                ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                : 'text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10'
            ]"
            aria-label="Toggle dark mode"
          >
            <span v-if="isDark" class="i-carbon-moon text-lg"></span>
            <span v-else class="i-carbon-sun text-lg"></span>
          </button>

          <!-- Mobile menu button -->
          <button 
            @click="$emit('toggle-mobile-menu')" 
            class="md:hidden rounded-md p-2 focus:outline-none"
            :class="[
              (isScrolled || isDark)
                ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                : 'text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10'
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

<script setup lang="ts"> // Added lang="ts"
import { computed } from 'vue';
import { useRoute, navigateTo } from '#app'; // Import navigateTo
import { useUserStore } from '~/stores/user';
import { useNavigation } from '~/composables/useNavigation'; // Import useNavigation

// Props
defineProps({
  isScrolled: {
    type: Boolean,
    default: false
  },
  isDark: {
    type: Boolean,
    default: false
  },
  mobileMenuOpen: {
    type: Boolean,
    default: false
  }
  // Removed navLinks prop
});

// Emits
defineEmits(['toggle-dark', 'toggle-mobile-menu']);

// Store & Composables
const userStore = useUserStore();
const route = useRoute();
const { headerLinks } = useNavigation(); // Use headerLinks from composable

// Check if route is active
const isActiveRoute = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  // Ensure trailing slashes don't break matching for parent routes like /admin
  // Use template literals
  const currentPath = route.path.endsWith('/') ? route.path : `${route.path}/`;
  const targetPath = path.endsWith('/') ? path : `${path}/`;
  return currentPath.startsWith(targetPath);
};

// Removed local logout function, using userStore.signOutUser directly in template
</script>