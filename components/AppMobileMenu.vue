<template>
  <div class="fixed inset-0 z-40 md:hidden">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
    
    <!-- Mobile menu panel -->
    <div class="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out">
      <div class="flex flex-col h-full overflow-y-auto">
        <!-- Header with close button -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <img src="/images/logo.png" alt="SylphX" class="h-8 w-auto">
            <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">SylphX</span>
          </div>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <span class="i-carbon-close text-2xl"></span>
          </button>
        </div>
        
        <!-- Navigation links -->
        <nav class="flex-1 px-6 py-4">
          <ul class="space-y-4">
            <!-- Public links -->
            <li v-for="link in publicLinks" :key="link.path">
              <NuxtLink 
                :to="link.path" 
                class="flex items-center text-lg font-medium text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                @click="$emit('close')"
              >
                <span :class="link.icon" class="mr-3 text-xl"></span>
                {{ link.name }}
              </NuxtLink>
            </li>
            
            <!-- Auth section -->
            <template v-if="userStore.isAuthenticated">
              <li class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Account
                </div>
              </li>
              
              <!-- User links -->
              <li v-for="link in userOnlyLinks" :key="link.path">
                <NuxtLink 
                  :to="link.path" 
                  class="flex items-center text-lg font-medium text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  @click="$emit('close')"
                >
                  <span :class="link.icon" class="mr-3 text-xl"></span>
                  {{ link.name }}
                </NuxtLink>
              </li>
              
              <!-- Admin section -->
              <template v-if="userStore.isAdmin">
                <li class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                  <div class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Administration
                  </div>
                </li>
                
                <!-- Admin links -->
                <li v-for="link in adminOnlyLinks" :key="link.path">
                  <NuxtLink 
                    :to="link.path" 
                    class="flex items-center text-lg font-medium text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                    @click="$emit('close')"
                  >
                    <span :class="link.icon" class="mr-3 text-xl"></span>
                    {{ link.name }}
                  </NuxtLink>
                </li>
              </template>
              
              <!-- Logout button -->
              <li class="mt-8">
                <button 
                  @click="logout" 
                  class="flex items-center text-lg font-medium text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <span class="i-carbon-logout mr-3 text-xl"></span>
                  Sign Out
                </button>
              </li>
            </template>
            
            <!-- Login button for unauthenticated users -->
            <template v-else>
              <li class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                <NuxtLink 
                  to="/login" 
                  class="flex items-center text-lg font-medium text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  @click="$emit('close')"
                >
                  <span class="i-carbon-login mr-3 text-xl"></span>
                  Sign In
                </NuxtLink>
              </li>
            </template>
          </ul>
        </nav>
        
        <!-- Footer section -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-4">
            <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <span class="i-carbon-logo-github text-xl"></span>
            </a>
            <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <span class="i-carbon-logo-twitter text-xl"></span>
            </a>
            <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <span class="i-carbon-logo-linkedin text-xl"></span>
            </a>
          </div>
          <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
            © {{ new Date().getFullYear() }} SylphX. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '~/stores/user';
import { useNavigation } from '~/composables/useNavigation';

// Props
defineProps({
  navLinks: {
    type: Array,
    default: () => []
  }
});

// Emits
defineEmits(['close']);

// Store access
const userStore = useUserStore();
const { publicLinks: allPublicLinks, userLinks, adminLinks } = useNavigation();

// Compute public links (non-auth required)
const publicLinks = computed(() => 
  allPublicLinks.value
);

// Compute user links (auth required, non-admin)
const userOnlyLinks = computed(() => 
  userLinks.value.filter(link => link.authRequired && !link.adminOnly)
);

// Compute admin links (admin only)
const adminOnlyLinks = computed(() => 
  adminLinks.value.filter(link => link.adminOnly)
);

// Logout function
const logout = async () => {
  await userStore.logout();
  window.location.href = '/login';
};
</script>