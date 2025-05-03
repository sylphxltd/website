<template>
  <div>
    <!-- Products Header -->
    <section class="py-20 md:py-24 bg-gradient-to-br from-blue-600 to-violet-600 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-pattern opacity-10"></div>
      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
          Digital Experiences That Matter
        </h1>
        <p class="text-lg sm:text-xl text-blue-100 max-w-2xl mb-8 animate-fade-in-up animate-delay-1s">
          We craft immersive games, intuitive applications, and seamless cross-platform experiences that empower users and create lasting value.
        </p>
      </div>
    </section>

    <!-- Future Products Section -->
    <section class="py-16 md:py-20 bg-white dark:bg-gray-900">
      <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 dark:text-white">Our Focus Areas</h2>
          <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            While we're a new studio currently in development, our expertise includes innovative products across these key areas:
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          <!-- Product Category 1: Games -->
          <div class="bg-blue-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/10 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                <div class="i-carbon-game-console text-3xl text-blue-600 dark:text-blue-400"></div>
              </div>
              <h3 class="text-xl font-semibold mb-4 dark:text-white">Immersive Games</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                We're developing games that blend captivating narratives with innovative gameplay mechanics, creating experiences that resonate emotionally while being technically impressive.
              </p>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                  <span class="text-gray-700 dark:text-gray-200">Mobile-first casual games</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                  <span class="text-gray-700 dark:text-gray-200">Cross-platform mid-core experiences</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                  <span class="text-gray-700 dark:text-gray-200">VR/AR immersive storytelling</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Product Category 2: Applications -->
          <div class="bg-green-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/10 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
                <div class="i-carbon-application text-3xl text-green-600 dark:text-green-400"></div>
              </div>
              <h3 class="text-xl font-semibold mb-4 dark:text-white">Intuitive Applications</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Our applications focus on delivering exceptional user experiences through clean design, powerful functionality, and thoughtful interfaces that simplify complex tasks.
              </p>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                  <span class="text-gray-700 dark:text-gray-200">Productivity tools</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                  <span class="text-gray-700 dark:text-gray-200">Creative software solutions</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                  <span class="text-gray-700 dark:text-gray-200">Business optimization apps</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Product Category 3: Cross-Platform Solutions -->
          <div class="bg-purple-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/10 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                <div class="i-carbon-software-resource text-3xl text-purple-600 dark:text-purple-400"></div>
              </div>
              <h3 class="text-xl font-semibold mb-4 dark:text-white">Cross-Platform Solutions</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                We specialize in building seamless experiences that work flawlessly across multiple platforms while maintaining consistent quality and functionality.
              </p>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                  <span class="text-gray-700 dark:text-gray-200">Mobile & desktop integration</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                  <span class="text-gray-700 dark:text-gray-200">Web applications with native features</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                  <span class="text-gray-700 dark:text-gray-200">Cross-device synchronization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- In Development Section -->
    <section class="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
      <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div class="text-center mb-10">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 dark:text-white">In Development</h2>
          <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're currently in the early stages of exploring several exciting project ideas. While specific details are still taking shape, here's a glimpse of what we're passionate about creating:
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <!-- Project Idea 1 -->
          <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-lg mx-auto md:mx-0">
            <div class="text-blue-600 dark:text-blue-400 font-bold mb-2 flex items-center gap-2">
              <div class="i-carbon-idea"></div>
              <span>Concept Exploration</span>
            </div>
            <h3 class="text-xl font-semibold mb-3 dark:text-white">Mobile Experience</h3>
            <p class="text-gray-600 dark:text-gray-300">
              We're researching concepts for a mobile application that brings a fresh approach to daily productivity and well-being, with a focus on minimalism and thoughtful design.
            </p>
          </div>
          
          <!-- Project Idea 2 -->
          <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-lg mx-auto md:mx-0">
            <div class="text-blue-600 dark:text-blue-400 font-bold mb-2 flex items-center gap-2">
              <div class="i-carbon-code"></div>
              <span>Early Prototype</span>
            </div>
            <h3 class="text-xl font-semibold mb-3 dark:text-white">Cross-Platform Framework</h3>
            <p class="text-gray-600 dark:text-gray-300">
              We've begun developing a toolkit that will help us create consistent, high-quality experiences across web, mobile, and desktop platforms with shared design principles.
            </p>
          </div>
        </div>
        
        <!-- Sign Up for Updates -->
        <div class="mt-16 bg-blue-600 dark:bg-blue-800 rounded-2xl p-6 md:p-8 text-white text-center">
          <h3 class="text-xl md:text-2xl font-bold mb-3">Stay Updated</h3>
          <p class="mb-6 max-w-2xl mx-auto">
            We're excited about what we're building. Sign up to be the first to hear about our launches, beta access, and development updates.
          </p>
          <a href="mailto:updates@sylphx.com" class="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
            <span class="i-carbon-email mr-2"></span>
            Join Our Mailing List
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.bg-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>