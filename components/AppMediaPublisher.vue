<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Social Media Publisher</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Compose post section -->
      <div class="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Compose Post</h4>
        
        <div class="space-y-4">
          <!-- Post title -->
          <div>
            <label for="postTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="postTitle"
              v-model="newPost.title"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Post title"
            />
          </div>
          
          <!-- Post content -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <label for="postContent" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content
              </label>
              <button
                @click="generatePostContent"
                :disabled="isGeneratingContent || !newPost.title"
                class="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isGeneratingContent">Generating...</span>
                <span v-else>
                  <span class="i-carbon-ai-status"></span>
                  Generate with AI
                </span>
              </button>
            </div>
            <MilkdownEditorWrapper
              v-model="newPost.content"
              placeholder="Write your post content here..."
              class="border border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] bg-white dark:bg-gray-700"
            />
          </div>
          
          <!-- Image upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image (optional)
            </label>
            <div class="flex items-start gap-4">
              <div v-if="newPost.imageUrl" class="h-32 w-32 border rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img :src="newPost.imageUrl" alt="Post image" class="h-full w-full object-cover" @error="handleImageError" />
              </div>
              <div v-else class="h-32 w-32 border rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                No image
              </div>
              <div class="space-y-2">
                <div>
                  <label class="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                    <span class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm inline-block">Upload image</span>
                    <input type="file" class="sr-only" accept="image/*" @change="handleImageSelect" />
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    v-model="newPost.imageUrl"
                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Or paste image URL"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Platform selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Publish to platforms
            </label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label class="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750">
                <input type="checkbox" v-model="newPost.platforms.twitter" class="form-checkbox h-4 w-4 text-indigo-600 dark:text-indigo-400">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span class="i-carbon-logo-twitter"></span>
                  Twitter
                </span>
              </label>
              <label class="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750">
                <input type="checkbox" v-model="newPost.platforms.facebook" class="form-checkbox h-4 w-4 text-indigo-600 dark:text-indigo-400">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span class="i-carbon-logo-facebook"></span>
                  Facebook
                </span>
              </label>
              <label class="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750">
                <input type="checkbox" v-model="newPost.platforms.linkedin" class="form-checkbox h-4 w-4 text-indigo-600 dark:text-indigo-400">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span class="i-carbon-logo-linkedin"></span>
                  LinkedIn
                </span>
              </label>
              <label class="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750">
                <input type="checkbox" v-model="newPost.platforms.medium" class="form-checkbox h-4 w-4 text-indigo-600 dark:text-indigo-400">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span class="i-carbon-medium"></span>
                  Medium
                </span>
              </label>
              <label class="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750">
                <input type="checkbox" v-model="newPost.platforms.instagram" class="form-checkbox h-4 w-4 text-indigo-600 dark:text-indigo-400">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span class="i-carbon-logo-instagram"></span>
                  Instagram
                </span>
              </label>
              <label class="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750">
                <input type="checkbox" v-model="newPost.platforms.website" class="form-checkbox h-4 w-4 text-indigo-600 dark:text-indigo-400">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <span class="i-carbon-globe"></span>
                  Website
                </span>
              </label>
            </div>
          </div>
          
          <!-- Schedule or publish -->
          <div>
            <div class="flex items-center mt-2">
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="schedulePost" class="form-checkbox h-4 w-4 text-indigo-600 dark:text-indigo-400">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Schedule for later</span>
              </label>
            </div>
            
            <div v-if="schedulePost" class="mt-3">
              <label for="scheduleDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                id="scheduleDate"
                v-model="newPost.scheduleDate"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <!-- Submit buttons -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="resetForm"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear
            </button>
            
            <button
              @click="publishPost"
              :disabled="isPublishing || !isFormValid"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isPublishing ? 'Publishing...' : (schedulePost ? 'Schedule Post' : 'Publish Now') }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Recent posts and preview -->
      <div class="md:col-span-1 space-y-6">
        <!-- Post preview -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Preview</h4>
          
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div class="bg-gray-50 dark:bg-gray-750 p-3 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <div class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
                  <span class="text-indigo-600 dark:text-indigo-400 font-medium">C</span>
                </div>
                <div class="ml-2">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">Company Name</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Just now</div>
                </div>
              </div>
            </div>
            
            <div class="p-3">
              <h5 class="font-medium text-gray-900 dark:text-white mb-2">{{ newPost.title || 'Post Title' }}</h5>
              <div class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {{ stripMarkdown(newPost.content) || 'Your post content will appear here...' }}
              </div>
              <div v-if="newPost.imageUrl" class="rounded-md overflow-hidden mb-3">
                <img :src="newPost.imageUrl" alt="Post image" class="w-full h-40 object-cover" @error="handleImageError" />
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 flex gap-3">
                <span>0 Likes</span>
                <span>0 Comments</span>
                <span>0 Shares</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent posts -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Recent Posts</h4>
          
          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center py-10">
            <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
          
          <!-- Empty state -->
          <div v-else-if="previousPosts.length === 0" class="text-center py-6">
            <div class="mx-auto h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
              <span class="i-carbon-share-knowledge text-gray-400 dark:text-gray-500"></span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">No posts yet</p>
          </div>
          
          <!-- Posts list -->
          <div v-else class="space-y-3">
            <div v-for="post in previousPosts" :key="post.id" class="border border-gray-200 dark:border-gray-700 rounded-md p-2">
              <div class="flex justify-between items-start mb-1">
                <h5 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ post.title }}</h5>
                <span 
                  class="text-xs px-1.5 py-0.5 rounded-full"
                  :class="getStatusClass(post.status)"
                >
                  {{ post.status }}
                </span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <div>
                  <span v-for="platform in getPlatforms(post)" :key="platform" class="mr-1">
                    <span :class="getPlatformIcon(platform)"></span>
                  </span>
                </div>
                <div>{{ formatDate(post.date) }}</div>
              </div>
            </div>
          </div>
          
          <div v-if="previousPosts.length > 0" class="mt-3">
            <button class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all posts</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';
import { useUserStore } from '~/stores/user';

// Props
const props = defineProps({
  appId: {
    type: String,
    required: true
  },
  appName: {
    type: String,
    required: true
  }
});

// State
const userStore = useUserStore();
const schedulePost = ref(false);
const isGeneratingContent = ref(false);
const isPublishing = ref(false);
const loading = ref(true);
const previousPosts = ref([]);

// New post form
const newPost = ref({
  title: '',
  content: '',
  imageUrl: '',
  scheduleDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  platforms: {
    twitter: false,
    facebook: false,
    linkedin: false,
    medium: false,
    instagram: false,
    website: true
  }
});

// Computed properties
const isFormValid = computed(() => {
  // Check if at least title and content are provided
  if (!newPost.value.title || !newPost.value.content) {
    return false;
  }
  
  // Check if at least one platform is selected
  const hasPlatform = Object.values(newPost.value.platforms).some(value => value === true);
  if (!hasPlatform) {
    return false;
  }
  
  // If scheduling, check if a date is provided
  if (schedulePost.value && !newPost.value.scheduleDate) {
    return false;
  }
  
  return true;
});

// Methods
const fetchPreviousPosts = async () => {
  loading.value = true;
  
  try {
    // In a real implementation, this would call an API
    // For this demo, we'll generate some mock data
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    previousPosts.value = [
      {
        id: '1',
        title: 'Announcing our latest app update',
        status: 'published',
        platforms: ['website', 'twitter', 'facebook'],
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: '2',
        title: 'New features coming soon',
        status: 'scheduled',
        platforms: ['website', 'linkedin'],
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days in future
      },
      {
        id: '3',
        title: 'Join our webinar this Friday',
        status: 'published',
        platforms: ['website', 'twitter', 'linkedin', 'facebook'],
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      }
    ];
  } catch (err) {
    console.error('Error fetching previous posts:', err);
    userStore.showToast('Failed to load previous posts', 'error');
  } finally {
    loading.value = false;
  }
};

const generatePostContent = async () => {
  if (!newPost.value.title || isGeneratingContent.value) return;
  
  isGeneratingContent.value = true;
  const originalContent = newPost.value.content;
  newPost.value.content = 'Generating...';
  
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/api/ai/generate-social-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        appName: props.appName,
        postTitle: newPost.value.title,
        platforms: Object.keys(newPost.value.platforms).filter(key => newPost.value.platforms[key])
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    newPost.value.content = data.content;
    
  } catch (err) {
    console.error('Error generating post content:', err);
    userStore.showToast(err instanceof Error ? err.message : 'Failed to generate content', 'error');
    newPost.value.content = originalContent;
  } finally {
    isGeneratingContent.value = false;
  }
};

const handleImageSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // In a real implementation, this would upload the file to a server
  // For this demo, we'll just create a local URL
  newPost.value.imageUrl = URL.createObjectURL(file);
};

const handleImageError = () => {
  console.warn('Image failed to load');
  newPost.value.imageUrl = '';
};

const resetForm = () => {
  newPost.value = {
    title: '',
    content: '',
    imageUrl: '',
    scheduleDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    platforms: {
      twitter: false,
      facebook: false,
      linkedin: false,
      medium: false,
      instagram: false,
      website: true
    }
  };
  schedulePost.value = false;
};

const publishPost = async () => {
  if (!isFormValid.value || isPublishing.value) return;
  
  isPublishing.value = true;
  
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // In a real implementation, this would call an API
    // For this demo, we'll just show a success message
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    userStore.showToast(
      schedulePost.value 
        ? 'Post scheduled successfully' 
        : 'Post published successfully', 
      'success'
    );
    
    // Add to previous posts
    previousPosts.value.unshift({
      id: Date.now().toString(),
      title: newPost.value.title,
      status: schedulePost.value ? 'scheduled' : 'published',
      platforms: Object.keys(newPost.value.platforms).filter(key => newPost.value.platforms[key]),
      date: schedulePost.value ? newPost.value.scheduleDate : new Date().toISOString()
    });
    
    // Reset form
    resetForm();
    
  } catch (err) {
    console.error('Error publishing post:', err);
    userStore.showToast(err instanceof Error ? err.message : 'Failed to publish post', 'error');
  } finally {
    isPublishing.value = false;
  }
};

const stripMarkdown = (markdownText) => {
  if (!markdownText) return '';
  // Very simple markdown stripper for preview
  return markdownText
    .replace(/#+\s+/g, '') // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/!\[.+?\]\(.+?\)/g, '') // Remove images
    .substring(0, 150); // Limit length
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const isFuture = date > now;
  
  if (isFuture) {
    return `Scheduled for ${date.toLocaleDateString()}`;
  }
  
  return date.toLocaleDateString();
};

const getStatusClass = (status) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getPlatforms = (post) => {
  return Array.isArray(post.platforms) ? post.platforms : [];
};

const getPlatformIcon = (platform) => {
  const iconMap = {
    twitter: 'i-carbon-logo-twitter',
    facebook: 'i-carbon-logo-facebook',
    linkedin: 'i-carbon-logo-linkedin',
    medium: 'i-carbon-medium',
    instagram: 'i-carbon-logo-instagram',
    website: 'i-carbon-globe'
  };
  
  return iconMap[platform] || 'i-carbon-share-knowledge';
};

// Initialize
onMounted(() => {
  fetchPreviousPosts();
});
</script>