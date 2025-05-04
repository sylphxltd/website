<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo and about section -->
        <div class="col-span-1 md:col-span-1">
          <div class="flex items-center space-x-2 mb-4">
            <div class="h-9 w-9 flex items-center justify-center rounded overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600">
              <img src="/images/logo.png" alt="SylphX Logo" class="h-6 w-6">
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white">SylphX</span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Innovative cross-platform applications and immersive experiences powered by cutting-edge technologies.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
              <span class="i-carbon-logo-twitter text-xl"></span>
              <span class="sr-only">Twitter</span>
            </a>
            <a href="#" class="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
              <span class="i-carbon-logo-facebook text-xl"></span>
              <span class="sr-only">Facebook</span>
            </a>
            <a href="#" class="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
              <span class="i-carbon-logo-instagram text-xl"></span>
              <span class="sr-only">Instagram</span>
            </a>
            <a href="#" class="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
              <span class="i-carbon-logo-github text-xl"></span>
              <span class="sr-only">GitHub</span>
            </a>
          </div>
        </div>
        
        <!-- Products section -->
        <div class="col-span-1">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            Products
          </h3>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/apps" class="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                All Products
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/apps/sylph-note" class="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                SylphNote
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/apps/vortex-vr" class="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                VortexVR
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/apps/sylph-chat" class="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                SylphChat
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Company section -->
        <div class="col-span-1">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            Company
          </h3>
          <ul class="space-y-3">
            <!-- Dynamically generate Company links -->
            <li v-for="link in companyLinks" :key="link.path">
              <NuxtLink :to="link.path" class="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {{ link.name }}
              </NuxtLink>
            </li>
             <!-- Keep Technologies link for now, or move to footerLinks if preferred -->
             <li>
               <NuxtLink to="/technologies" class="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                 Technologies
               </NuxtLink>
             </li>
          </ul>
        </div>
        
        <!-- Legal section -->
        <div class="col-span-1">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            Legal
          </h3>
          <ul class="space-y-3">
             <!-- Dynamically generate Legal links -->
             <li v-for="link in legalLinks" :key="link.path">
               <NuxtLink :to="link.path" class="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                 {{ link.name }}
               </NuxtLink>
             </li>
          </ul>
        </div>
      </div>
      
      <!-- Bottom section with copyright -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            © {{ new Date().getFullYear() }} SylphX. All rights reserved.
          </p>
          <div class="mt-4 md:mt-0">
            <button @click="toggleTheme" class="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <span v-if="isDark">
                <span class="i-carbon-sun inline-block align-text-bottom mr-1"></span>
                Switch to Light Mode
              </span>
              <span v-else>
                <span class="i-carbon-moon inline-block align-text-bottom mr-1"></span>
                Switch to Dark Mode
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts"> // Added lang="ts"
import { ref, onMounted, computed } from 'vue'; // Added computed
import { useNavigation } from '~/composables/useNavigation'; // Import useNavigation

const { footerLinks } = useNavigation(); // Get footer links

// Filter links for specific sections
const companyLinks = computed(() =>
  footerLinks.value.filter(link => ['/about', '/contact', '/careers'].includes(link.path))
);
const legalLinks = computed(() =>
  footerLinks.value.filter(link => ['/privacy', '/terms', '/cookies'].includes(link.path))
);

// Check dark mode preference
const isDark = ref(false);

// Toggle theme
const toggleTheme = () => {
  isDark.value = !isDark.value;
  
  // Update class on document element
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('color-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('color-theme', 'light');
  }
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