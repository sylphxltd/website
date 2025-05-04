<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
      <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Configure admin dashboard settings and preferences.
      </p>
    </div>
    
    <!-- Settings Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left side navigation -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <nav class="flex flex-col p-2">
            <button 
              v-for="section in settingsSections" 
              :key="section.id"
              @click="activeSection = section.id"
              :class="[
                'px-4 py-3 text-left rounded-md transition-colors',
                activeSection === section.id 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
              ]"
            >
              <div class="flex items-center">
                <span :class="[section.icon, 'text-lg mr-3']"></span>
                <span>{{ section.name }}</span>
              </div>
            </button>
          </nav>
        </div>
      </div>
      
      <!-- Right side content -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <!-- General Settings -->
          <div v-if="activeSection === 'general'" class="space-y-6">
            <h2 class="text-xl font-medium text-gray-900 dark:text-white mb-4">General Settings</h2>
            
            <!-- Dark Mode -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-gray-700 dark:text-gray-300 font-medium">Dark Mode</h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Enable or disable dark mode across the admin dashboard.</p>
              </div>
              <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input 
                  id="toggle-dark-mode" 
                  type="checkbox" 
                  v-model="settings.darkMode"
                  class="absolute w-0 h-0 opacity-0"
                  @change="saveSettings"
                />
                <label 
                  for="toggle-dark-mode" 
                  :class="[
                    'absolute inset-0 rounded-full transition-colors duration-200 ease-in-out cursor-pointer',
                    settings.darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  ]"
                >
                  <span 
                    :class="[
                      'absolute left-0 inline-block w-5 h-5 transition-transform duration-200 ease-in-out transform bg-white rounded-full shadow-sm',
                      settings.darkMode ? 'translate-x-7' : 'translate a-x-1'
                    ]"
                    style="top: 2px;"
                  ></span>
                </label>
              </div>
            </div>
            
            <!-- Notification Settings -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-gray-700 dark:text-gray-300 font-medium">Email Notifications</h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Receive email notifications for important events.</p>
              </div>
              <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                <input 
                  id="toggle-notifications" 
                  type="checkbox" 
                  v-model="settings.notifications"
                  class="absolute w-0 h-0 opacity-0"
                  @change="saveSettings"
                />
                <label 
                  for="toggle-notifications" 
                  :class="[
                    'absolute inset-0 rounded-full transition-colors duration-200 ease-in-out cursor-pointer',
                    settings.notifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  ]"
                >
                  <span 
                    :class="[
                      'absolute left-0 inline-block w-5 h-5 transition-transform duration-200 ease-in-out transform bg-white rounded-full shadow-sm',
                      settings.notifications ? 'translate-x-7' : 'translate-x-1'
                    ]"
                    style="top: 2px;"
                  ></span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Profile Settings -->
          <div v-else-if="activeSection === 'profile'" class="space-y-6">
            <h2 class="text-xl font-medium text-gray-900 dark:text-white mb-4">Profile Settings</h2>
            
            <p class="text-gray-700 dark:text-gray-300 text-center py-10">
              Profile settings will be implemented soon, allowing you to update your personal information and preferences.
            </p>
          </div>
          
          <!-- Security Settings -->
          <div v-else-if="activeSection === 'security'" class="space-y-6">
            <h2 class="text-xl font-medium text-gray-900 dark:text-white mb-4">Security Settings</h2>
            
            <p class="text-gray-700 dark:text-gray-300 text-center py-10">
              Security settings will be implemented soon, allowing you to change your password and enable two-factor authentication.
            </p>
          </div>
          
          <!-- API Settings -->
          <div v-else-if="activeSection === 'api'" class="space-y-6">
            <h2 class="text-xl font-medium text-gray-900 dark:text-white mb-4">API Settings</h2>
            
            <p class="text-gray-700 dark:text-gray-300 text-center py-10">
              API settings will be implemented soon, allowing you to manage API keys and access permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Settings sections
const settingsSections = [
  { id: 'general', name: 'General', icon: 'i-carbon-settings' },
  { id: 'profile', name: 'Profile', icon: 'i-carbon-user-profile' },
  { id: 'security', name: 'Security', icon: 'i-carbon-security' },
  { id: 'api', name: 'API Access', icon: 'i-carbon-api' }
];

// Active section
const activeSection = ref('general');

// Settings state
const settings = ref({
  darkMode: true,
  notifications: true
});

// Save settings (mock function for now)
const saveSettings = () => {
  // In a real app, this would save to a database
  console.log('Settings saved:', settings.value);
};
</script>