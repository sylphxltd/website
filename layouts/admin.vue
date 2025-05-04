<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Admin navbar -->
    <nav class="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and site name -->
          <div class="flex items-center">
            <NuxtLink to="/admin" class="flex items-center">
              <img src="/images/logo.png" alt="SylphX" class="h-8 w-auto">
              <span class="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Admin</span>
            </NuxtLink>
          </div>

          <!-- Right side navigation -->
          <div class="flex items-center space-x-4">
            <!-- Dark mode toggle -->
            <button 
              @click="toggleDarkMode" 
              class="flex items-center justify-center w-9 h-9 rounded-full focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              aria-label="Toggle dark mode"
            >
              <span v-if="isDark" class="i-carbon-moon text-lg"></span>
              <span v-else class="i-carbon-sun text-lg"></span>
            </button>

            <!-- Notifications -->
            <div class="relative">
              <button class="flex items-center justify-center w-9 h-9 rounded-full focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <span class="i-carbon-notification text-lg"></span>
                <span class="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">3</span>
              </button>
            </div>

            <!-- Profile dropdown -->
            <div class="relative">
              <button 
                @click="showProfileMenu = !showProfileMenu" 
                class="flex items-center focus:outline-none"
              >
                <div class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  {{ userInitials }}
                </div>
                <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">{{ userName }}</span>
                <span class="ml-1 i-carbon-chevron-down text-gray-500 dark:text-gray-400 hidden md:block"></span>
              </button>
              
              <!-- Profile dropdown menu -->
              <div v-if="showProfileMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                <NuxtLink to="/settings" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Settings
                </NuxtLink>
                <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Sign out
                </button>
              </div>
            </div>

            <!-- Mobile menu button -->
            <button 
              @click="isSidebarOpen = !isSidebarOpen" 
              class="md:hidden flex items-center justify-center w-9 h-9 rounded-full focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <span v-if="isSidebarOpen" class="i-carbon-close text-lg"></span>
              <span v-else class="i-carbon-menu text-lg"></span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Admin layout with sidebar -->
    <div class="flex pt-16">
      <!-- Sidebar navigation -->
      <aside 
        class="fixed z-20 h-full bg-white dark:bg-gray-800 shadow transition-all duration-300 transform md:translate-x-0 md:relative" 
        :class="[isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:w-20']"
      >
        <div class="h-full overflow-y-auto">
          <nav class="px-3 py-4">
            <ul class="space-y-1">
              <!-- Dashboard -->
              <li>
                <NuxtLink to="/admin" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="i-carbon-dashboard text-xl text-gray-500 dark:text-gray-400"></span>
                  <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Dashboard</span>
                </NuxtLink>
              </li>
              
              <!-- Applications -->
              <li>
                <NuxtLink to="/admin/apps" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="i-carbon-application text-xl text-gray-500 dark:text-gray-400"></span>
                  <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Applications</span>
                </NuxtLink>
              </li>
              
              <!-- Users -->
              <li>
                <NuxtLink to="/admin/users" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="i-carbon-user-multiple text-xl text-gray-500 dark:text-gray-400"></span>
                  <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Users</span>
                </NuxtLink>
              </li>
              
              <!-- Reviews -->
              <li>
                <NuxtLink to="/admin/reviews" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="i-carbon-star-review text-xl text-gray-500 dark:text-gray-400"></span>
                  <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Reviews</span>
                </NuxtLink>
              </li>
              
              <!-- Email Support -->
              <li>
                <NuxtLink to="/admin/emails" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="i-carbon-email text-xl text-gray-500 dark:text-gray-400"></span>
                  <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Email Support</span>
                </NuxtLink>
              </li>
              
              <!-- Resources -->
              <li>
                <NuxtLink to="/admin/resources" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="i-carbon-content-delivery-network text-xl text-gray-500 dark:text-gray-400"></span>
                  <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Resources</span>
                </NuxtLink>
              </li>
              
              <!-- Media Publishing -->
              <li>
                <NuxtLink to="/admin/media" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="i-carbon-share-knowledge text-xl text-gray-500 dark:text-gray-400"></span>
                  <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Media Publishing</span>
                </NuxtLink>
              </li>
              
              <!-- Analytics -->
              <li>
                <NuxtLink to="/admin/analytics" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="i-carbon-analytics text-xl text-gray-500 dark:text-gray-400"></span>
                  <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Analytics</span>
                </NuxtLink>
              </li>
              
              <!-- Settings -->
              <li>
                <NuxtLink to="/admin/settings" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span class="i-carbon-settings text-xl text-gray-500 dark:text-gray-400"></span>
                  <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Settings</span>
                </NuxtLink>
              </li>
            </ul>
            
            <div class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <NuxtLink to="/" class="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <span class="i-carbon-home text-xl text-gray-500 dark:text-gray-400"></span>
                <span class="ml-3 transition-opacity duration-300" :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 md:absolute'">Back to Site</span>
              </NuxtLink>
            </div>
          </nav>
        </div>
      </aside>

      <!-- Main content -->
      <div 
        class="flex-1 transition-all duration-300"
        :class="isSidebarOpen ? 'md:ml-64' : 'md:ml-20'"
      >
        <div class="py-6 px-4 sm:px-6 lg:px-8">
          <slot />
        </div>
      </div>
    </div>
    
    <!-- Overlay for mobile sidebar -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
      @click="isSidebarOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'vue-router';

// Store and router
const userStore = useUserStore();
const router = useRouter();

// State
const isDark = ref(false);
const isSidebarOpen = ref(false);
const showProfileMenu = ref(false);

// User information
const userName = computed(() => {
  return userStore.user?.displayName || userStore.user?.email?.split('@')[0] || 'Admin User';
});

const userInitials = computed(() => {
  if (userStore.user?.displayName) {
    return userStore.user.displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  if (userStore.user?.email) {
    return userStore.user.email.charAt(0).toUpperCase();
  }
  
  return 'A';
});

// Initialization
onMounted(() => {
  // Check if user is authenticated and admin
  if (!userStore.isAuthenticated || !userStore.isAdmin) {
    router.push('/login');
    return;
  }
  
  // Initial dark mode check
  isDark.value = localStorage.getItem('color-theme') === 'dark' || 
    (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Apply initial theme
  applyTheme();
  
  // Close profile menu when clicking outside
  const handleClickOutside = (event) => {
    if (showProfileMenu.value && !event.target.closest('button')) {
      showProfileMenu.value = false;
    }
  };
  
  // Add event listener
  document.addEventListener('click', handleClickOutside);
  
  // Adjust sidebar for screen size
  const handleResize = () => {
    if (window.innerWidth >= 768) { // md breakpoint
      isSidebarOpen.value = true;
    } else {
      isSidebarOpen.value = false;
    }
  };
  
  // Initial check
  handleResize();
  window.addEventListener('resize', handleResize);
  
  // Cleanup
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('resize', handleResize);
  });
});

// Toggle dark mode
const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  applyTheme();
};

// Apply theme to HTML element
const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('color-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('color-theme', 'light');
  }
};

// Logout
const logout = async () => {
  await userStore.logout();
  router.push('/login');
};

// Close sidebar when route changes (on mobile)
watch(() => window.location.href, () => {
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }
});
</script>