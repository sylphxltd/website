import { computed } from 'vue';

// Define the structure for an admin navigation item
interface AdminNavLink {
  name: string; // Display name (e.g., 'Users', '應用程式')
  path: string; // Route path (e.g., '/admin/users')
  icon: string; // Icon class (e.g., 'i-carbon-user-multiple')
  // Add other properties if needed, like required permissions beyond basic admin
}

// Define the structure for a navigation group
interface AdminNavGroup {
  groupName: string;
  items: AdminNavLink[];
}

export function useAdminNavigation() {
  // Admin-specific navigation structure with groups
  const adminNavigationGroups = computed<AdminNavGroup[]>(() => [
    {
      groupName: 'Core Management',
      items: [
        { name: 'Overview', path: '/admin', icon: 'i-carbon-dashboard' },
        { name: 'Applications', path: '/admin/apps', icon: 'i-carbon-application-web' },
        { name: 'Users', path: '/admin/users', icon: 'i-carbon-user-multiple' },
      ]
    },
    {
      groupName: 'Content & Engagement',
      items: [
        { name: 'Reviews', path: '/admin/reviews', icon: 'i-carbon-star-review' },
        { name: 'Emails', path: '/admin/emails', icon: 'i-carbon-email' },
        { name: 'Media', path: '/admin/media', icon: 'i-carbon-share-knowledge' }, // Updated icon
      ]
    },
    {
      groupName: 'Data & Utilities',
      items: [
        { name: 'Resources', path: '/admin/resources', icon: 'i-carbon-folder' }, // Kept folder icon for now
        { name: 'Analytics', path: '/admin/analytics', icon: 'i-carbon-analytics' }, // Updated icon
      ]
    },
    {
      groupName: 'System',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: 'i-carbon-settings' }, // Updated icon
      ]
    }
    // Add more groups or items as needed
  ]);

  // You could add functions here to dynamically add/remove items based on features/permissions

  return {
    adminNavigationGroups, // Export the grouped structure
  };
}