import { ref, computed } from 'vue';
import { useUserStore } from '~/stores/user';

export function useNavigation() {
  const userStore = useUserStore();
  
  // Define all application navigation links
  const navigationLinks = computed(() => [
    // Public links
    { 
      name: 'Home', 
      path: '/',
      icon: 'i-carbon-home',
      adminOnly: false,
      authRequired: false
    },
    { 
      name: 'Applications', 
      path: '/apps',
      icon: 'i-carbon-application',
      adminOnly: false,
      authRequired: false
    },
    { 
      name: 'Technologies', 
      path: '/technologies',
      icon: 'i-carbon-code',
      adminOnly: false,
      authRequired: false
    },
    // Auth required links
    {
      name: 'Settings',
      path: '/settings',
      icon: 'i-carbon-settings',
      adminOnly: false,
      authRequired: true
    },
    // Admin links
    {
      name: 'Admin Dashboard',
      path: '/admin',
      icon: 'i-carbon-dashboard',
      adminOnly: true,
      authRequired: true
    }
  ]);
  
  // Get links filtered by permission
  const publicLinks = computed(() => 
    navigationLinks.value.filter(link => !link.adminOnly && !link.authRequired)
  );
  
  const userLinks = computed(() => 
    navigationLinks.value.filter(link => !link.adminOnly && (link.authRequired ? userStore.isAuthenticated : true))
  );
  
  const adminLinks = computed(() => 
    navigationLinks.value.filter(link => (link.adminOnly ? userStore.isAdmin : true) && (link.authRequired ? userStore.isAuthenticated : true))
  );
  
  return {
    navigationLinks,
    publicLinks,
    userLinks,
    adminLinks
  };
}