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
          <NuxtLink 
            v-for="link in navigationLinks" 
            :key="link.path" 
            :to="link.path"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              isActiveRoute(link.path)
                ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
                : (isScrolled || isDark)
                  ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  : 'text-gray-800 hover:text-gray-900 hover:bg-white/20 dark:text-white dark:hover:text-white dark:hover:bg-white/10'
            ]"
          >
            {{ link.name }}
          </NuxtLink>
          
          <!-- Auth buttons -->
          <template v-if="userStore.isAuthenticated">
            <NuxtLink 
              to="/settings" 
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isActiveRoute('/settings')
                  ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
                  : (isScrolled || isDark)
                    ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                    : 'text-gray-800 hover:text-gray-900 hover:bg-white/20 dark:text-white dark:hover:text-white dark:hover:bg-white/10'
              ]"
            >
              Settings
            </NuxtLink>
            <div v-if="userStore.isAdmin" class="relative group">
              <NuxtLink 
                to="/admin" 
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                  isActiveRoute('/admin')
                    ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
                    : (isScrolled || isDark)
                      ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                      : 'text-gray-800 hover:text-gray-900 hover:bg-white/20 dark:text-white dark:hover:text-white dark:hover:bg-white/10'
                ]"
              >
                Admin
                <span class="i-carbon-chevron-down ml-1 text-xs"></span>
              </NuxtLink>
              
              <!-- Admin dropdown -->
              <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:translate-y-0 translate-y-2">
                <div class="py-1">
                  <NuxtLink 
                    v-for="item in adminMenuItems" 
                    :key="item.path"
                    :to="item.path" 
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {{ item.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>
            <button 
              @click="logout"
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
          <template v-else>
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

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from '#app';
import { useUserStore } from '~/stores/user';

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
  },
  navLinks: {
    type: Array,
    default: () => []
  }
});

// Emits
defineEmits(['toggle-dark', 'toggle-mobile-menu']);

// Store
const userStore = useUserStore();
const route = useRoute();

// Navigation links
const navigationLinks = [
  { name: 'Home', path: '/' },
  { name: 'Applications', path: '/apps' },
  { name: 'Technologies', path: '/technologies' },
  { name: 'About', path: '/about' }
];

// Admin menu items
const adminMenuItems = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Applications', path: '/admin/apps' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Reviews', path: '/admin/reviews' },
  { name: 'Resources', path: '/admin/resources' },
  { name: 'Email Support', path: '/admin/emails' },
  { name: 'Media Publishing', path: '/admin/media' }
];

// Check if route is active
const isActiveRoute = (path) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

// Logout
const logout = async () => {
  await userStore.logout();
  navigateTo('/login');
};
</script>