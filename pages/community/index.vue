<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header section -->
      <div class="max-w-4xl mx-auto mb-16">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Community Forum
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 text-center max-w-3xl mx-auto">
          Connect with other users, share ideas, and get help for all SylphX products.
        </p>
      </div>

      <div class="grid grid-cols-12 gap-8">
        <!-- Main content area -->
        <div class="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
          <!-- Category tabs -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div class="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div class="flex flex-wrap -mb-px">
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="[
                    'mr-2 py-3 px-4 text-sm font-medium border-b-2 -mb-px',
                    activeTab === tab.id 
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </div>
            </div>
            
            <!-- Discussion threads -->
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div
                v-for="thread in filteredThreads"
                :key="thread.id"
                class="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div class="flex items-start">
                  <div class="mr-4 hidden sm:block">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg font-medium">
                      {{ getInitials(thread.author) }}
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <a href="#" class="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                      {{ thread.title }}
                    </a>
                    <div class="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Started by <span class="font-medium text-gray-900 dark:text-white">{{ thread.author }}</span></span>
                      <span class="mx-2">•</span>
                      <span>{{ formatDate(thread.createdAt) }}</span>
                      <span 
                        v-if="thread.isNew" 
                        class="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full"
                      >
                        New
                      </span>
                    </div>
                    <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {{ thread.preview }}
                    </p>
                    <div class="mt-3 flex items-center gap-4">
                      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span class="i-carbon-chat mr-1 text-lg"></span>
                        {{ thread.commentCount }} replies
                      </div>
                      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span class="i-carbon-view mr-1 text-lg"></span>
                        {{ thread.viewCount }} views
                      </div>
                      <div class="flex items-center gap-1">
                        <span
                          v-for="tag in thread.tags"
                          :key="tag"
                          class="px-2 py-1 text-xs font-medium rounded-full"
                          :class="tagColors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0 hidden md:block text-right">
                    <div class="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mx-auto">
                      <span class="i-carbon-user text-lg"></span>
                    </div>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {{ thread.lastReplyAuthor }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500">
                      {{ formatRelativeTime(thread.lastReplyAt) }}
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Empty state -->
              <div v-if="filteredThreads.length === 0" class="p-12 text-center">
                <div class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                  <span class="i-carbon-chat-off text-4xl"></span>
                </div>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No discussions</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No discussions found in this category.
                </p>
                <div class="mt-6">
                  <button type="button" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span class="i-carbon-add mr-2"></span>
                    New Discussion
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Pagination -->
            <div class="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div class="hidden sm:block">
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">{{ filteredThreads.length }}</span> results
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button class="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span class="i-carbon-chevron-left mr-1"></span>
                    Previous
                  </button>
                  <button class="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Next
                    <span class="i-carbon-chevron-right ml-1"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="col-span-12 md:col-span-4 lg:col-span-3 space-y-6">
          <!-- New thread button -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
            <button class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span class="i-carbon-add mr-2"></span>
              New Discussion
            </button>
            
            <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Have a question or something to share? Start a new discussion thread.
            </div>
          </div>
          
          <!-- Popular tags -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">Popular Tags</h3>
            </div>
            <div class="p-6">
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="tag in popularTags" 
                  :key="tag.name"
                  @click="toggleTagFilter(tag.name)"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    activeTagFilters.includes(tag.name) 
                      ? tagColors[tag.name] || 'bg-gray-700 text-white dark:bg-gray-100 dark:text-gray-800'
                      : tagColors[tag.name] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  ]"
                >
                  {{ tag.name }} ({{ tag.count }})
                </button>
              </div>
            </div>
          </div>
          
          <!-- Top contributors -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">Top Contributors</h3>
            </div>
            <div class="p-6">
              <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                <li v-for="contributor in topContributors" :key="contributor.name" class="py-3 flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                      {{ getInitials(contributor.name) }}
                    </div>
                  </div>
                  <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ contributor.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ contributor.posts }} posts</p>
                  </div>
                  <div class="ml-3 flex-shrink-0">
                    <span 
                      :class="[
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        contributor.level === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        contributor.level === 'Moderator' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      ]"
                    >
                      {{ contributor.level }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Define page meta
definePageMeta({
  layout: 'default'
});

// Tabs
const tabs = [
  { id: 'all', name: 'All Discussions' },
  { id: 'general', name: 'General' },
  { id: 'sylphnote', name: 'SylphNote' },
  { id: 'vortexvr', name: 'VortexVR' },
  { id: 'sylphchat', name: 'SylphChat' },
  { id: 'announcements', name: 'Announcements' }
];

const activeTab = ref('all');
const activeTagFilters = ref([]);

// Tag colors
const tagColors = {
  'SylphNote': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'VortexVR': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'SylphChat': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Question': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Bug': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Feature Request': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Solved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Announcement': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Tutorial': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
};

// Sample threads data (in real app this would come from API)
const threads = [
  {
    id: 1,
    title: 'How to use the new cloud sync feature in SylphNote?',
    author: 'Alex Johnson',
    createdAt: new Date('2025-04-03T08:30:00'),
    preview: 'I just updated to the latest version of SylphNote and noticed there\'s a new cloud sync feature. Can anyone explain how to set it up and if there are any limitations?',
    commentCount: 12,
    viewCount: 235,
    category: 'sylphnote',
    tags: ['SylphNote', 'Question'],
    lastReplyAuthor: 'Sarah Chen',
    lastReplyAt: new Date('2025-04-04T15:20:00'),
    isNew: true
  },
  {
    id: 2,
    title: 'VortexVR performance optimization tips',
    author: 'Michael Zhang',
    createdAt: new Date('2025-03-28T14:15:00'),
    preview: 'I\'ve been using VortexVR for a few weeks now and I\'ve discovered some ways to optimize performance. Thought I\'d share my findings with the community.',
    commentCount: 8,
    viewCount: 176,
    category: 'vortexvr',
    tags: ['VortexVR', 'Tutorial'],
    lastReplyAuthor: 'James Wilson',
    lastReplyAt: new Date('2025-04-02T09:45:00'),
    isNew: false
  },
  {
    id: 3,
    title: 'Having trouble with SylphChat notifications',
    author: 'Emma Garcia',
    createdAt: new Date('2025-04-01T11:20:00'),
    preview: 'For some reason, I\'m not receiving notifications from SylphChat even though they\'re enabled in my settings. Has anyone else experienced this issue?',
    commentCount: 5,
    viewCount: 92,
    category: 'sylphchat',
    tags: ['SylphChat', 'Bug'],
    lastReplyAuthor: 'Robert Lee',
    lastReplyAt: new Date('2025-04-03T16:30:00'),
    isNew: true
  },
  {
    id: 4,
    title: 'Introducing SylphChat 3.0 - Now with AI Integration',
    author: 'SylphX Team',
    createdAt: new Date('2025-03-25T09:00:00'),
    preview: 'We\'re excited to announce the release of SylphChat 3.0, featuring advanced AI integration that makes communication smarter and more efficient.',
    commentCount: 23,
    viewCount: 487,
    category: 'announcements',
    tags: ['SylphChat', 'Announcement'],
    lastReplyAuthor: 'David Kim',
    lastReplyAt: new Date('2025-04-01T13:15:00'),
    isNew: false
  },
  {
    id: 5,
    title: 'Feature request: Dark mode for SylphNote',
    author: 'Olivia Brown',
    createdAt: new Date('2025-03-30T16:45:00'),
    preview: 'Would love to see a dark mode option in SylphNote. It would really help with eye strain during late-night note-taking sessions.',
    commentCount: 15,
    viewCount: 208,
    category: 'sylphnote',
    tags: ['SylphNote', 'Feature Request'],
    lastReplyAuthor: 'Ryan Murphy',
    lastReplyAt: new Date('2025-04-04T10:30:00'),
    isNew: false
  },
  {
    id: 6,
    title: 'General discussion: How has SylphX improved your workflow?',
    author: 'Daniel Taylor',
    createdAt: new Date('2025-03-29T13:10:00'),
    preview: 'Just curious to hear from other users - which SylphX products do you use regularly, and how have they improved your daily workflow?',
    commentCount: 19,
    viewCount: 312,
    category: 'general',
    tags: ['Question'],
    lastReplyAuthor: 'Sophia Martinez',
    lastReplyAt: new Date('2025-04-03T14:20:00'),
    isNew: false
  }
];

// Popular tags
const popularTags = [
  { name: 'SylphNote', count: 124 },
  { name: 'VortexVR', count: 98 },
  { name: 'SylphChat', count: 87 },
  { name: 'Question', count: 203 },
  { name: 'Bug', count: 65 },
  { name: 'Feature Request', count: 112 },
  { name: 'Solved', count: 184 },
  { name: 'Tutorial', count: 76 }
];

// Top contributors
const topContributors = [
  { name: 'Sarah Chen', posts: 156, level: 'Expert' },
  { name: 'Michael Zhang', posts: 142, level: 'Expert' },
  { name: 'Emma Garcia', posts: 128, level: 'Moderator' },
  { name: 'James Wilson', posts: 112, level: 'Admin' },
  { name: 'Robert Lee', posts: 95, level: 'Expert' }
];

// Filtered threads based on active tab and tag filters
const filteredThreads = computed(() => {
  let result = threads;
  
  // Filter by category if not 'all'
  if (activeTab.value !== 'all') {
    result = result.filter(thread => thread.category === activeTab.value);
  }
  
  // Filter by selected tags if any
  if (activeTagFilters.value.length > 0) {
    result = result.filter(thread => 
      thread.tags.some(tag => activeTagFilters.value.includes(tag))
    );
  }
  
  return result;
});

// Helper functions
const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
  }
  
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  }
  
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  }
  
  return 'Just now';
};

// Toggle tag filter
const toggleTagFilter = (tag) => {
  if (activeTagFilters.value.includes(tag)) {
    activeTagFilters.value = activeTagFilters.value.filter(t => t !== tag);
  } else {
    activeTagFilters.value.push(tag);
  }
};
</script>