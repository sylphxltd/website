import { computed } from 'vue';

// Define the structure for an admin navigation item
interface AdminNavLink {
  name: string; // Display name (e.g., 'Users', '應用程式')
  path: string; // Route path (e.g., '/admin/users')
  icon: string; // Icon class (e.g., 'i-carbon-user-multiple')
  // Add other properties if needed, like required permissions beyond basic admin
}

export function useAdminNavigation() {
  // Admin-specific navigation structure
  const adminSubNavigation = computed<AdminNavLink[]>(() => [
    { name: 'Overview', path: '/admin', icon: 'i-carbon-dashboard' },
    { name: 'Users', path: '/admin/users', icon: 'i-carbon-user-multiple' },
    { name: 'Applications', path: '/admin/apps', icon: 'i-carbon-application-web' },
    { name: 'Emails', path: '/admin/emails', icon: 'i-carbon-email' },
    { name: 'Media', path: '/admin/media', icon: 'i-carbon-camera' }, // Consider more specific icon? i-carbon-share-knowledge?
    { name: 'Resources', path: '/admin/resources', icon: 'i-carbon-folder' }, // Consider i-carbon-content-delivery-network?
    { name: 'Reviews', path: '/admin/reviews', icon: 'i-carbon-star-review' },
    { name: 'Analytics', path: '/admin/analytics', icon: 'i-carbon-chart-line' }, // Consider i-carbon-analytics?
    { name: 'Settings', path: '/admin/settings', icon: 'i-carbon-settings-adjust' }, // Consider i-carbon-settings?
    // Add more admin sections as needed
    // Example: { name: 'System Logs', path: '/admin/logs', icon: 'i-carbon-terminal' },
  ]);

  // You could add functions here to dynamically add/remove items based on features/permissions

  return {
    adminSubNavigation,
  };
}