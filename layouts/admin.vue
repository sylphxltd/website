<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 z-20 flex flex-col overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out lg:relative',
        sidebarOpen ? 'w-64 shadow-lg lg:shadow-none' : 'w-0 lg:w-64'
      ]"
    >
      <!-- Sidebar header with logo -->
      <div class="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
        <NuxtLink to="/admin" class="flex items-center space-x-2">
          <div class="rounded-md h-8 w-8 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
            <img src="/images/logo.png" alt="SylphX Logo" class="h-5 w-5">
          </div>
          <div class="flex flex-col">
            <span class="text-lg font-bold text-gray-900 dark:text-white leading-tight">SylphX</span>
            <span class="text-xs text-gray-600 dark:text-gray-400 leading-tight -mt-0.5">Admin Dashboard</span>
          </div>
        </NuxtLink>
        <button 
          @click="toggleSidebar" 
          class="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        >
          <span class="i-carbon-close text-xl"></span>
        </button>
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 px-2 py-4 space-y-1">
        <div v-for="(item, index) in navItems" :key="index">
          <NuxtLink 
            :to="item.to" 
            :class="[
              'flex items-center px-4 py-2.5 rounded-lg transition-colors',
              route.path.startsWith(item.to) 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <span :class="[item.icon, 'text-xl flex-shrink-0']"></span>
            <span class="ml-3">{{ item.name }}</span>
            
            <!-- Badge (if any) -->
            <span 
              v-if="item.badge" 
              :class="[item.badgeColor || 'bg-gray-100 text-gray-800', 'ml-auto text-xs rounded-full']"
            >
              {{ item.badge }}
            </span>
          </NuxtLink>
        </div>
      </nav>
      
      <!-- Bottom section with user info -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <span class="i-carbon-user-avatar text-xl"></span>
            </div>
          </div>
          <div class="ml-3">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ user?.displayName || 'Admin User' }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ user?.email || 'admin@example.com' }}
            </div>
          </div>
          <div class="ml-auto">
            <button @click="logout" class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
              <span class="i-carbon-logout text-lg"></span>
            </button>
          </div>
        </div>
      </div>
    </aside>
    
    <!-- Content area -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Top header -->
      <header class="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <!-- Mobile menu button -->
        <button 
          @click="toggleSidebar" 
          class="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        >
          <span class="i-carbon-menu text-xl"></span>
        </button>
        
        <!-- Page title (mobile) -->
        <h1 class="text-lg font-medium text-gray-900 dark:text-white lg:hidden">
          {{ pageTitle }}
        </h1>
        
        <!-- Search bar (desktop) -->
        <div class="hidden lg:flex lg:flex-1 px-2 max-w-md">
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span class="i-carbon-search text-gray-400 dark:text-gray-500"></span>
            </div>
            <input 
              type="text" 
              class="block w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search..."
            >
          </div>
        </div>
        
        <!-- Right side actions -->
        <div class="flex items-center space-x-3">
          <!-- Notifications dropdown -->
          <div class="relative">
            <button class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
              <span class="i-carbon-notification text-xl"></span>
              <span class="sr-only">Notifications</span>
              <div class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
            </button>
          </div>
          
          <!-- Theme toggle -->
          <button @click="toggleTheme" class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
            <span v-if="isDark" class="i-carbon-sun text-xl"></span>
            <span v-else class="i-carbon-moon text-xl"></span>
            <span class="sr-only">Toggle theme</span>
          </button>
          
          <!-- Settings button -->
          <NuxtLink to="/admin/settings" class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
            <span class="i-carbon-settings text-xl"></span>
            <span class="sr-only">Settings</span>
          </NuxtLink>
        </div>
      </header>
      
      <!-- Main content -->
      <main class="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <slot></slot>
      </main>
    </div>
    
    <!-- Mobile sidebar overlay -->
    <div 
      v-if="sidebarOpen" 
      @click="closeSidebar"
      class="fixed inset-0 z-10 bg-black/50 lg:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '~/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// User data
const user = computed(() => userStore.user);

// Sidebar state
const sidebarOpen = ref(false);
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
const closeSidebar = () => {
  sidebarOpen.value = false;
};

// Page title based on current route
const pageTitle = computed(() => {
  const path = route.path;
  if (path === '/admin') return 'Dashboard';
  if (path.startsWith('/admin/apps')) return 'Applications';
  if (path.startsWith('/admin/users')) return 'Users';
  if (path.startsWith('/admin/reviews')) return 'Reviews';
  if (path.startsWith('/admin/emails')) return 'Email Support';
  if (path.startsWith('/admin/resources')) return 'Resources';
  if (path.startsWith('/admin/media')) return 'Media Publishing';
  if (path.startsWith('/admin/analytics')) return 'Analytics';
  if (path.startsWith('/admin/settings')) return 'Settings';
  return 'Admin';
});

// Dark mode toggle
const isDark = ref(false);
const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('color-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('color-theme', 'light');
  }
};

// Navigation items
const navItems = [
  { name: 'Dashboard', to: '/admin', icon: 'i-carbon-dashboard' },
  { name: 'Applications', to: '/admin/apps', icon: 'i-carbon-application', badge: '24', badgeColor: 'text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 py-0.5 px-2 rounded-full' },
  { name: 'Users', to: '/admin/users', icon: 'i-carbon-user-multiple' },
  { name: 'Reviews', to: '/admin/reviews', icon: 'i-carbon-star-review', badge: '12', badgeColor: 'text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 py-0.5 px-2 rounded-full' },
  { name: 'Email Support', to: '/admin/emails', icon: 'i-carbon-email', badge: '8', badgeColor: 'text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 py-0.5 px-2 rounded-full' },
  { name: 'Resources', to: '/admin/resources', icon: 'i-carbon-content-delivery-network' },
  { name: 'Media', to: '/admin/media', icon: 'i-carbon-share-knowledge' },
  { name: 'Analytics', to: '/admin/analytics', icon: 'i-carbon-analytics' },
  { name: 'Settings', to: '/admin/settings', icon: 'i-carbon-settings' }
];

// Logout function
const logout = async () => {
  await userStore.logout();
  router.push('/login');
};

// Initialize theme on mount
onMounted(() => {
  // Check local storage theme preference
  isDark.value = localStorage.getItem('color-theme') === 'dark' || 
    (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Apply theme
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
</script>