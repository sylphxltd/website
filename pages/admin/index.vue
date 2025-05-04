<template>
  <div class="min-h-screen">
    <!-- Header with welcome and date -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
      <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">{{ greeting }}, {{ userName }}. Here's what's happening today.</p>
    </div>
    
    <!-- Key metrics cards with gradients -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div 
        v-for="(metric, index) in metrics" 
        :key="index"
        class="bg-gradient-to-br rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
        :class="metric.gradientClass"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-100 opacity-90">{{ metric.title }}</h3>
            <span :class="metric.icon" class="text-xl text-white"></span>
          </div>
          <div class="flex items-end justify-between">
            <div>
              <p class="text-3xl font-bold text-white mb-1">{{ metric.value }}</p>
              <div class="flex items-center text-sm">
                <span 
                  :class="[
                    metric.change >= 0 ? 'text-green-300' : 'text-red-300',
                    metric.icon === 'i-carbon-warning' && 'text-amber-300'
                  ]"
                >
                  <span v-if="metric.change >= 0" class="i-carbon-arrow-up mr-1"></span>
                  <span v-else class="i-carbon-arrow-down mr-1"></span>
                  {{ Math.abs(metric.change) }}%
                </span>
                <span class="text-gray-200 opacity-90 ml-1">vs last week</span>
              </div>
            </div>
            <NuxtLink :to="metric.link" class="text-xs text-white opacity-90 hover:opacity-100 underline underline-offset-2">
              View All
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Analytics and activity section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
      <!-- Analytics chart -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <div class="flex space-x-2">
            <button 
              v-for="period in ['7D', '30D', '3M', 'All']" 
              :key="period"
              :class="[
                'px-3 py-1 text-sm rounded-md transition-colors',
                selectedPeriod === period 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
              @click="selectedPeriod = period"
            >
              {{ period }}
            </button>
          </div>
        </div>
        
        <!-- Chart placeholder -->
        <div class="h-[240px] w-full bg-gray-50 dark:bg-gray-750 rounded-md relative overflow-hidden">
          <!-- Sample chart visualization (would be replaced with a real chart component) -->
          <div class="absolute inset-0 flex items-end justify-around px-6 pb-6">
            <div v-for="value in chartData" :key="value" 
              :style="`height: ${value}%`" 
              class="w-8 rounded-t-md bg-indigo-500 dark:bg-indigo-400 opacity-80"></div>
          </div>
          
          <!-- X-axis labels -->
          <div class="absolute bottom-0 inset-x-0 flex justify-around px-6">
            <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day" 
              class="text-xs text-gray-500 dark:text-gray-400 pb-1">{{ day }}</div>
          </div>
        </div>
        
        <!-- Metrics below chart -->
        <div class="grid grid-cols-3 gap-4 mt-6">
          <div v-for="(stat, index) in analyticsStats" :key="index" class="text-center">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ stat.label }}</p>
          </div>
        </div>
      </div>
      
      <!-- Recent activity feed with clean design -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <button class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            View All
          </button>
        </div>
        
        <div class="space-y-6">
          <div v-for="(activity, index) in activities" :key="index" class="relative">
            <!-- Timeline connector -->
            <div v-if="index < activities.length - 1" class="absolute top-8 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            <div class="flex gap-4">
              <!-- Activity icon -->
              <div :class="[
                'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                activity.iconBg
              ]">
                <span :class="[activity.icon, 'text-white']"></span>
              </div>
              
              <!-- Activity content -->
              <div class="flex-1 pt-1">
                <p class="text-sm text-gray-900 dark:text-white font-medium">
                  {{ activity.title }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {{ activity.time }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick access cards -->
    <div class="mb-10">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Access</h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <NuxtLink 
          v-for="action in quickActions" 
          :key="action.title" 
          :to="action.link"
          class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 hover:shadow-md"
        >
          <div :class="[action.iconBg, 'h-12 w-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300']">
            <span :class="[action.icon, 'text-white text-xl']"></span>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">{{ action.title }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ action.description }}</p>
        </NuxtLink>
      </div>
    </div>
    
    <!-- Latest updates section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
        <div class="flex space-x-2">
          <button class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            View All Updates
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="update in latestUpdates" :key="update.title" class="flex gap-4">
          <div :class="[update.iconBg, 'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0']">
            <span :class="[update.icon, 'text-white']"></span>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ update.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ update.description }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ update.time }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin-only']
});

// Get user store
const userStore = useUserStore();

// Personalized greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

// User name for greeting
const userName = computed(() => {
  return userStore.user?.displayName || 'Admin';
});

// Selected period for analytics
const selectedPeriod = ref('7D');

// Sample chart data (would be dynamic in a real app)
const chartData = ref([30, 45, 25, 60, 75, 45, 55]);

// Analytics stats
const analyticsStats = ref([
  { label: 'Total Users', value: '4,249' },
  { label: 'Weekly Growth', value: '+12.5%' },
  { label: 'Avg. Session', value: '3:42' }
]);

// Key metrics
const metrics = ref([
  {
    title: 'Applications',
    value: '24',
    change: 12,
    icon: 'i-carbon-application',
    gradientClass: 'from-blue-600 to-blue-800',
    link: '/admin/apps'
  },
  {
    title: 'Active Users',
    value: '857',
    change: 5,
    icon: 'i-carbon-user-multiple',
    gradientClass: 'from-indigo-600 to-indigo-800',
    link: '/admin/users'
  },
  {
    title: 'Pending Reviews',
    value: '12',
    change: -4,
    icon: 'i-carbon-star-review',
    gradientClass: 'from-purple-600 to-purple-800',
    link: '/admin/reviews'
  },
  {
    title: 'Support Tickets',
    value: '8',
    change: 10,
    icon: 'i-carbon-warning',
    gradientClass: 'from-amber-500 to-amber-700',
    link: '/admin/emails'
  }
]);

// Recent activity
const activities = ref([
  {
    title: 'New application "SylphChat" was added',
    time: '25 minutes ago',
    icon: 'i-carbon-application',
    iconBg: 'bg-blue-500'
  },
  {
    title: 'New 5-star review for "SylphNote" on App Store',
    time: '2 hours ago',
    icon: 'i-carbon-star',
    iconBg: 'bg-amber-500'
  },
  {
    title: 'John Doe was granted admin access',
    time: '5 hours ago',
    icon: 'i-carbon-user',
    iconBg: 'bg-green-500'
  },
  {
    title: 'New support request from customer@example.com',
    time: '8 hours ago',
    icon: 'i-carbon-email',
    iconBg: 'bg-indigo-500'
  },
  {
    title: 'Social media post published to Twitter and LinkedIn',
    time: '1 day ago',
    icon: 'i-carbon-share-knowledge',
    iconBg: 'bg-purple-500'
  }
]);

// Quick actions
const quickActions = ref([
  {
    title: 'New Application',
    description: 'Create and publish a new application',
    icon: 'i-carbon-add',
    iconBg: 'bg-green-500',
    link: '/admin/apps/create'
  },
  {
    title: 'Respond to Reviews',
    description: 'Manage and reply to recent reviews',
    icon: 'i-carbon-star-review',
    iconBg: 'bg-amber-500',
    link: '/admin/reviews'
  },
  {
    title: 'Upload Resources',
    description: 'Add new files to the resource library',
    icon: 'i-carbon-cloud-upload',
    iconBg: 'bg-blue-500',
    link: '/admin/resources'
  },
  {
    title: 'Social Publishing',
    description: 'Create and schedule social media posts',
    icon: 'i-carbon-share-knowledge',
    iconBg: 'bg-purple-500',
    link: '/admin/media'
  }
]);

// Latest updates
const latestUpdates = ref([
  {
    title: 'New API Version Released',
    description: 'Version 2.4.0 now includes improved authentication flow and better error handling.',
    time: '2 days ago',
    icon: 'i-carbon-api',
    iconBg: 'bg-indigo-500'
  },
  {
    title: 'System Maintenance Completed',
    description: 'All systems running normally after scheduled maintenance window.',
    time: '5 days ago',
    icon: 'i-carbon-terminal',
    iconBg: 'bg-green-500'
  },
  {
    title: 'User Analytics Updated',
    description: 'New dashboard metrics for tracking user engagement across platforms.',
    time: '1 week ago',
    icon: 'i-carbon-analytics',
    iconBg: 'bg-blue-500'
  },
  {
    title: 'New Review System Deployed',
    description: 'Improved review management system with AI-powered reply suggestions.',
    time: '2 weeks ago',
    icon: 'i-carbon-star',
    iconBg: 'bg-amber-500'
  }
]);
</script>