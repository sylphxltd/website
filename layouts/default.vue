<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <AppHeader 
      :is-scrolled="isScrolled" 
      :is-dark="isDark" 
      :mobile-menu-open="mobileMenuOpen" 
      :nav-links="navigationLinks"
      @toggle-dark="toggleDarkMode"
      @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen"
    />
    
    <!-- Mobile menu -->
    <AppMobileMenu 
      v-if="mobileMenuOpen" 
      :nav-links="navigationLinks" 
      @close="mobileMenuOpen = false"
    />
    
    <!-- Main content -->
    <main class="flex-grow pt-16 md:pt-20">
      <slot />
    </main>
    
    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from '~/stores/user';
import { useNavigation } from '~/composables/useNavigation';

const userStore = useUserStore();
const { navigationLinks } = useNavigation();

// Handle scroll state
const isScrolled = ref(false);
const isDark = ref(false);
const mobileMenuOpen = ref(false);

// Check if the user prefers dark mode
onMounted(() => {
  // Initial dark mode check
  isDark.value = localStorage.getItem('color-theme') === 'dark' || 
    (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Apply initial theme
  applyTheme();
  
  // Scroll handler
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10;
  };
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
  
  // Check initial scroll position
  handleScroll();
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
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

// Close mobile menu when route changes
watch(() => window.location.href, () => {
  mobileMenuOpen.value = false;
});
</script>