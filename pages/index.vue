<template>
  <div class="min-h-screen">
    <!-- Hero section with background image -->
    <section class="relative h-screen flex items-center overflow-hidden">
      <!-- Background with overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 z-0"></div>
      <div class="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center bg-no-repeat mix-blend-overlay opacity-30"></div>
      
      <!-- Animated particles/shapes for visual interest -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- Using fixed positioning with style binding instead of class binding -->
        <div v-for="n in 5" :key="n" 
          :class="[
            'absolute rounded-full mix-blend-screen animate-float',
            n % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'
          ]"
          :style="{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            width: `${(Math.random() * 80) + 140}px`,
            height: `${(Math.random() * 80) + 140}px`,
            opacity: Math.random() * 0.15 + 0.05,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 10 + 20}s`
          }"
        ></div>
      </div>
      
      <!-- Hero content -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-3xl">
          <h1 class="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Innovative Digital Experiences for the Modern World
          </h1>
          <p class="text-xl md:text-2xl text-indigo-100 mb-8">
            We create cutting-edge applications and immersive software solutions 
            that transform how people connect, work, and play.
          </p>
          <div class="flex flex-wrap gap-4">
            <NuxtLink to="/apps" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Explore Our Products
            </NuxtLink>
            <NuxtLink to="/contact" class="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
              Get in Touch
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <span class="i-carbon-arrow-down text-white text-3xl"></span>
      </div>
    </section>
    
    <!-- Featured products section -->
    <section class="py-20 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Featured Products
          </h2>
          <p class="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            Discover our suite of innovative applications designed to enhance productivity, 
            creativity, and entertainment.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- App Card 1 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl">
            <div class="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
              <div class="relative h-20 w-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span class="i-carbon-document text-white text-4xl"></span>
              </div>
              <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">SylphxNote</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                A powerful note-taking app with AI integration, cloud sync, and collaborative features.
                Perfect for students, researchers, and professionals.
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">iOS</span>
                <span class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">Android</span>
                <span class="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs">Web</span>
              </div>
              <NuxtLink to="/apps/sylphx-note" class="text-indigo-600 dark:text-indigo-400 font-medium flex items-center hover:underline">
                Learn More
                <span class="i-carbon-arrow-right ml-1"></span>
              </NuxtLink>
            </div>
          </div>
          
          <!-- App Card 2 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl">
            <div class="h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center relative overflow-hidden">
              <div class="relative h-20 w-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span class="i-carbon-view-3d text-white text-4xl"></span>
              </div>
              <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Vortex VR</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                An immersive virtual reality platform that transforms how users experience digital content,
                from gaming to virtual workspaces.
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs">Oculus</span>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">SteamVR</span>
              </div>
              <NuxtLink to="/apps/vortex-vr" class="text-indigo-600 dark:text-indigo-400 font-medium flex items-center hover:underline">
                Learn More
                <span class="i-carbon-arrow-right ml-1"></span>
              </NuxtLink>
            </div>
          </div>
          
          <!-- App Card 3 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl">
            <div class="h-48 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center relative overflow-hidden">
              <div class="relative h-20 w-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span class="i-carbon-chat text-white text-4xl"></span>
              </div>
              <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">SylphxChat</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                A secure messaging platform with end-to-end encryption, real-time translation,
                and advanced AI assistants to enhance communication.
              </p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">iOS</span>
                <span class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">Android</span>
              </div>
              <NuxtLink to="/apps/sylphx-chat" class="text-indigo-600 dark:text-indigo-400 font-medium flex items-center hover:underline">
                Learn More
                <span class="i-carbon-arrow-right ml-1"></span>
              </NuxtLink>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <NuxtLink to="/apps" class="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm">
            View All Products
            <span class="i-carbon-arrow-right ml-2"></span>
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <!-- Technologies section -->
    <section class="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Cutting-Edge Technologies
          </h2>
          <p class="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            We leverage the latest advancements in software development to create exceptional digital experiences.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Technology 1 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm relative overflow-hidden border border-gray-100 dark:border-gray-700">
            <div class="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 bg-indigo-500/10 rounded-full"></div>
            <div class="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 bg-indigo-500/10 rounded-full"></div>
            
            <div class="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center rounded-lg text-indigo-600 dark:text-indigo-400 mb-6">
              <span class="i-carbon-ai-status text-2xl"></span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Artificial Intelligence</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Our advanced AI systems enable intelligent features like natural language processing, 
              content generation, and predictive analytics.
            </p>
            <NuxtLink to="/technologies" class="text-indigo-600 dark:text-indigo-400 font-medium flex items-center hover:underline">
              Learn More
              <span class="i-carbon-arrow-right ml-1"></span>
            </NuxtLink>
          </div>
          
          <!-- Technology 2 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm relative overflow-hidden border border-gray-100 dark:border-gray-700">
            <div class="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 bg-purple-500/10 rounded-full"></div>
            <div class="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 bg-purple-500/10 rounded-full"></div>
            
            <div class="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center rounded-lg text-purple-600 dark:text-purple-400 mb-6">
              <span class="i-carbon-augmented-reality text-2xl"></span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">AR & VR</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Our immersive technologies blend digital content with reality, creating interactive 
              experiences across virtual and augmented realities.
            </p>
            <NuxtLink to="/technologies" class="text-indigo-600 dark:text-indigo-400 font-medium flex items-center hover:underline">
              Learn More
              <span class="i-carbon-arrow-right ml-1"></span>
            </NuxtLink>
          </div>
          
          <!-- Technology 3 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm relative overflow-hidden border border-gray-100 dark:border-gray-700">
            <div class="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 bg-blue-500/10 rounded-full"></div>
            <div class="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 bg-blue-500/10 rounded-full"></div>
            
            <div class="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-lg text-blue-600 dark:text-blue-400 mb-6">
              <span class="i-carbon-cloud text-2xl"></span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Cloud Infrastructure</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Our scalable cloud architecture enables seamless cross-device experiences with 
              real-time synchronization and high availability.
            </p>
            <NuxtLink to="/technologies" class="text-indigo-600 dark:text-indigo-400 font-medium flex items-center hover:underline">
              Learn More
              <span class="i-carbon-arrow-right ml-1"></span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Support & Community section -->
    <section class="py-20 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Support & Community
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Join our community of users for support, discussions, and the latest updates on our products.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <!-- Support card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div class="p-8">
              <div class="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <span class="i-carbon-help text-3xl"></span>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Customer Support</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Our dedicated support team is available to help you with any questions or issues you have with our products.
              </p>
              <ul class="space-y-4 mb-8">
                <li class="flex items-start">
                  <span class="i-carbon-checkmark text-green-600 dark:text-green-400 flex-shrink-0 mt-1"></span>
                  <p class="ml-3 text-gray-600 dark:text-gray-300">24/7 email support for all users</p>
                </li>
                <li class="flex items-start">
                  <span class="i-carbon-checkmark text-green-600 dark:text-green-400 flex-shrink-0 mt-1"></span>
                  <p class="ml-3 text-gray-600 dark:text-gray-300">Live chat assistance during business hours</p>
                </li>
                <li class="flex items-start">
                  <span class="i-carbon-checkmark text-green-600 dark:text-green-400 flex-shrink-0 mt-1"></span>
                  <p class="ml-3 text-gray-600 dark:text-gray-300">Comprehensive documentation and guides</p>
                </li>
              </ul>
              <NuxtLink to="/contact" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Contact Support
              </NuxtLink>
            </div>
          </div>
          
          <!-- Community card -->
          <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg overflow-hidden text-white">
            <div class="p-8">
              <div class="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white mb-6">
                <span class="i-carbon-user-multiple text-3xl"></span>
              </div>
              <h3 class="text-2xl font-bold mb-4">Join Our Community</h3>
              <p class="text-indigo-100 mb-6">
                Connect with other users, share ideas, and get early access to new features by joining our community.
              </p>
              <ul class="space-y-4 mb-8">
                <li class="flex items-start">
                  <span class="i-carbon-checkmark flex-shrink-0 mt-1"></span>
                  <p class="ml-3 text-indigo-100">Discussion forums for all products</p>
                </li>
                <li class="flex items-start">
                  <span class="i-carbon-checkmark flex-shrink-0 mt-1"></span>
                  <p class="ml-3 text-indigo-100">Beta testing opportunities</p>
                </li>
                <li class="flex items-start">
                  <span class="i-carbon-checkmark flex-shrink-0 mt-1"></span>
                  <p class="ml-3 text-indigo-100">Regular webinars and online events</p>
                </li>
              </ul>
              <NuxtLink to="/community" class="inline-flex items-center px-4 py-2 border border-white/20 backdrop-blur-sm rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20">
                Join Community
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Call to action -->
    <section class="py-24 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden">
      <!-- Animated background elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute w-[500px] h-[500px] -top-[250px] -right-[100px] bg-purple-500/20 rounded-full blur-3xl"></div>
        <div class="absolute w-[500px] h-[500px] -bottom-[300px] -left-[200px] bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to experience our cutting-edge applications?
          </h2>
          <p class="text-xl text-indigo-100 mb-12 max-w-3xl mx-auto">
            Join thousands of users worldwide who are already enhancing their digital experiences with Sylphx products.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/apps" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-indigo-700 bg-white hover:bg-gray-50">
              Explore Our Products
            </NuxtLink>
            <NuxtLink to="/contact" class="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10">
              Contact Us
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'default'
});
</script>

<style scoped>
/* Floating animation for the hero background elements */
@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(10px, 10px) rotate(5deg); }
  50% { transform: translate(5px, 15px) rotate(0deg); }
  75% { transform: translate(-5px, 5px) rotate(-5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

.animate-float {
  animation: float 20s infinite ease-in-out;
}

/* Background grid pattern */
.bg-grid-white {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
}
</style>