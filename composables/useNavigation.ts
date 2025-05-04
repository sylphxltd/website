import { computed } from 'vue';
import { useUserStore } from '~/stores/user';

interface NavLink {
  name: string;
  path: string;
  icon: string;
  adminOnly: boolean;
  authRequired: boolean;
  // Optional: Add properties for visibility control if needed beyond roles
  // e.g., showInHeader?: boolean; showInFooter?: boolean;
}

export function useNavigation() {
  const userStore = useUserStore();

  // Define core navigation structure
  // Separate public, user-specific, and the admin entry point
  const coreNavigationLinks = computed<NavLink[]>(() => [
    // --- Public Links (Always Visible) ---
    {
      name: 'Home', // 首頁
      path: '/',
      icon: 'i-carbon-home',
      adminOnly: false,
      authRequired: false
    },
    {
      name: 'Applications', // 應用程式 (Public Listing)
      path: '/apps', // Ensure pages/apps/index.vue is the public list
      icon: 'i-carbon-application',
      adminOnly: false,
      authRequired: false
    },
    {
      name: 'Technologies', // 技術
      path: '/technologies',
      icon: 'i-carbon-code',
      adminOnly: false,
      authRequired: false
    },
    // --- User Links (Visible when Authenticated) ---
    {
      name: 'Settings', // 設定
      path: '/settings',
      icon: 'i-carbon-settings',
      adminOnly: false,
      authRequired: true
    },
    // --- Admin Entry Point (Visible for Admins) ---
    {
      name: 'Admin Dashboard', // 管理員儀表板
      path: '/admin', // Entry point to the admin section
      icon: 'i-carbon-manage-protection', // Changed icon
      adminOnly: true,
      authRequired: true
    },
    // --- Footer/Utility Links (Not typically in main nav) ---
    // These might be handled directly in the footer component or filtered differently
    // { name: 'About', path: '/about', ... },
    // { name: 'Privacy', path: '/privacy', ... },
    // { name: 'Terms', path: '/terms', ... },
  ]);

  // Filtered links for different contexts (e.g., header display)
  const headerLinks = computed(() =>
    coreNavigationLinks.value.filter(link => {
      // Basic visibility: public or authenticated user
      let isVisible = !link.authRequired || userStore.isAuthenticated;
      // Admin link visibility
      if (link.adminOnly) {
        isVisible = isVisible && userStore.isAdmin;
      }
      // Add more complex logic here if needed (e.g., based on feature flags)
      return isVisible;
    })
  );

  // You might want separate lists for mobile menu, footer, etc.
  // Example: Footer links might include privacy, terms, about
  const footerLinks = computed(() => [
     { name: 'About', path: '/about', icon: '', adminOnly: false, authRequired: false },
     { name: 'Privacy', path: '/privacy', icon: '', adminOnly: false, authRequired: false },
     { name: 'Terms', path: '/terms', icon: '', adminOnly: false, authRequired: false },
     { name: 'Contact', path: '/contact', icon: '', adminOnly: false, authRequired: false },
     { name: 'Cookies', path: '/cookies', icon: '', adminOnly: false, authRequired: false },
     // Add others as needed
  ]);

  // Admin-specific navigation has been moved to useAdminNavigation.ts

  return {
    // Renamed for clarity
    coreNavigationLinks,
    headerLinks,
    footerLinks,
    // Removed adminSubNavigation export
  };
}