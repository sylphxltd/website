<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-indigo-600 to-blue-800 text-white py-20 md:py-28">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold mb-4">Powering the Next Generation of Applications</h1>
            <p class="text-lg mb-8 text-indigo-100">
              SylphX delivers innovative solutions for modern businesses. Our suite of applications helps you streamline operations, increase productivity, and achieve your goals.
            </p>
            <div class="flex flex-wrap gap-4">
              <NuxtLink to="/apps" class="px-6 py-3 bg-white text-indigo-700 rounded-md font-semibold hover:bg-indigo-50 transition-colors">
                Explore Our Apps
              </NuxtLink>
              <a href="#contact" class="px-6 py-3 bg-transparent border border-white text-white rounded-md font-semibold hover:bg-white/10 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
          <div class="hidden md:flex justify-center">
            <div class="max-w-md rounded-lg shadow-xl bg-indigo-500/20 h-80 flex items-center justify-center">
              <img src="/images/logo.png" alt="SylphX Applications" class="h-32 w-32">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Wave separator -->
      <div class="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg class="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff" class="fill-white dark:fill-gray-900" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="#ffffff" class="fill-white dark:fill-gray-900" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ffffff" class="fill-white dark:fill-gray-900"></path>
        </svg>
      </div>
    </section>

    <!-- Featured Apps Section -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Featured Applications</h2>
          <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our suite of powerful applications designed to enhance productivity and streamline your workflow.
          </p>
        </div>

        <!-- App cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="app in featuredApps" :key="app.id" class="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="h-12 w-12 rounded-lg overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
                  <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.name" class="h-10 w-10 object-contain">
                  <span v-else class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ app.name.charAt(0) }}</span>
                </div>
                <h3 class="ml-4 text-xl font-semibold text-gray-900 dark:text-white">{{ app.name }}</h3>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{{ app.description }}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span v-for="(tag, index) in app.tags" :key="index" class="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                  {{ tag }}
                </span>
              </div>
              <div class="flex items-center justify-between mt-4">
                <div class="flex space-x-2">
                  <a v-if="app.links?.googlePlay" :href="app.links.googlePlay" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                    <span class="i-carbon-logo-google"></span>
                  </a>
                  <a v-if="app.links?.appStore" :href="app.links.appStore" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                    <span class="i-carbon-logo-apple"></span>
                  </a>
                  <a v-if="app.links?.website" :href="app.links.website" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                    <span class="i-carbon-globe"></span>
                  </a>
                </div>
                <NuxtLink :to="`/apps/${app.id}`" class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                  View Details <span class="i-carbon-arrow-right"></span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <NuxtLink to="/apps" class="px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center">
            View All Applications <span class="i-carbon-arrow-right ml-2"></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-800">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">About SylphX</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              SylphX is a leading technology company specializing in developing innovative applications for businesses across various industries. Our mission is to empower organizations with powerful tools that enhance efficiency and drive growth.
            </p>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              With a team of experienced developers and designers, we create intuitive, user-friendly applications that solve complex problems and deliver measurable results.
            </p>
            <div class="mt-6">
              <NuxtLink to="/technologies" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center">
                Learn More About Our Technologies <span class="i-carbon-arrow-right ml-1"></span>
              </NuxtLink>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div class="text-3xl text-indigo-600 dark:text-indigo-400 mb-2">
                <span class="i-carbon-application"></span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Custom Applications</h3>
              <p class="text-gray-600 dark:text-gray-300">Tailored solutions designed specifically for your business needs.</p>
            </div>
            <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div class="text-3xl text-indigo-600 dark:text-indigo-400 mb-2">
                <span class="i-carbon-ai-status"></span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Integration</h3>
              <p class="text-gray-600 dark:text-gray-300">Cutting-edge artificial intelligence to automate and optimize workflows.</p>
            </div>
            <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div class="text-3xl text-indigo-600 dark:text-indigo-400 mb-2">
                <span class="i-carbon-cloud"></span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cloud Solutions</h3>
              <p class="text-gray-600 dark:text-gray-300">Secure, scalable cloud infrastructure for your applications.</p>
            </div>
            <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div class="text-3xl text-indigo-600 dark:text-indigo-400 mb-2">
                <span class="i-carbon-chat-support"></span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
              <p class="text-gray-600 dark:text-gray-300">Dedicated support team ready to assist whenever you need help.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-16 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get In Touch</h2>
          <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions about our applications or services? Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>

        <div class="max-w-3xl mx-auto">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" 
                  placeholder="Your name"
                />
              </div>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" 
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            <div class="mb-6">
              <label for="subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <input 
                type="text" 
                id="subject" 
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" 
                placeholder="How can we help?"
              />
            </div>
            <div class="mb-6">
              <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea 
                id="message" 
                rows="4" 
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" 
                placeholder="Enter your message..."
              ></textarea>
            </div>
            <button class="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppsStore } from '~/stores/apps';

// Define page meta
definePageMeta({
  layout: 'default'
});

// Get apps store
const appsStore = useAppsStore();
const featuredApps = ref([]);

// Add sample tags for featured apps display
const addTagsToApps = (apps) => {
  return apps.map(app => {
    // Generate some sample tags based on app description if available
    const tags = [];
    const description = app.description?.toLowerCase() || '';
    
    if (description.includes('ai') || description.includes('intelligence')) {
      tags.push('AI-Powered');
    }
    
    if (description.includes('cloud') || description.includes('online')) {
      tags.push('Cloud');
    }
    
    if (description.includes('mobile') || app.links?.appStore || app.links?.googlePlay) {
      tags.push('Mobile');
    }
    
    // Add at least one tag if none were added
    if (tags.length === 0) {
      tags.push('Application');
    }
    
    return {
      ...app,
      tags
    };
  });
};

// Load apps for the featured section
onMounted(async () => {
  if (appsStore.apps.length === 0) {
    await appsStore.fetchApps();
  }
  
  // Get the top 3 apps (or whatever is available) for featured display
  const appsWithTags = addTagsToApps([...appsStore.apps]);
  featuredApps.value = appsWithTags.slice(0, 3);
});
</script>