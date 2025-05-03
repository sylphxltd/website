<template>
  <div>
    <!-- Technologies Header -->
    <section class="py-20 md:py-24 bg-gradient-to-br from-indigo-700 to-purple-700 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-tech-pattern opacity-10"></div>
      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
          Cutting-Edge Technologies
        </h1>
        <p class="text-lg sm:text-xl text-indigo-100 max-w-2xl mb-8 animate-fade-in-up animate-delay-1s">
          We're focused on the technologies of tomorrow, pushing boundaries to create experiences that feel like the future, today.
        </p>
      </div>
    </section>

    <!-- Core Technologies Section -->
    <section class="py-16 md:py-20 bg-white dark:bg-gray-900">
      <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 dark:text-white">Core Technology Focus</h2>
          <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're investing in these transformative technologies that are reshaping industries and creating new possibilities:
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-16">
          <!-- Core Technology: AI -->
          <div class="bg-indigo-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg transition hover:-translate-y-2 hover:shadow-xl">
            <div class="h-48 sm:h-64 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden flex items-center justify-center">
              <div class="absolute inset-0 bg-ai-pattern opacity-20 mix-blend-overlay"></div>
              <div class="relative z-10 p-8 text-center">
                <div class="i-carbon-machine-learning text-5xl sm:text-7xl text-white mb-3 mx-auto"></div>
                <h3 class="text-xl sm:text-2xl font-bold text-white">Artificial Intelligence</h3>
              </div>
            </div>
            <div class="p-6 md:p-8">
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                We're harnessing the transformative power of AI to create more intuitive, personalized, and intelligent products that adapt to users' needs and preferences.
              </p>
              <div class="space-y-4">
                <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm flex gap-4 items-start">
                  <div class="i-carbon-machine-learning-model text-xl text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 class="font-semibold mb-1 dark:text-white">Machine Learning</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      Developing adaptive systems that learn from user behavior to personalize experiences and improve over time.
                    </p>
                  </div>
                </div>
                <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm flex gap-4 items-start">
                  <div class="i-carbon-chat text-xl text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 class="font-semibold mb-1 dark:text-white">Natural Language Processing</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      Creating more intuitive interfaces through advanced language understanding and generation capabilities.
                    </p>
                  </div>
                </div>
                <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm flex gap-4 items-start">
                  <div class="i-carbon-image-search text-xl text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 class="font-semibold mb-1 dark:text-white">Computer Vision</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      Enabling applications to understand and interact with visual content for enhanced interactivity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Core Technology: VR/AR -->
          <div class="bg-blue-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg transition hover:-translate-y-2 hover:shadow-xl">
            <div class="h-48 sm:h-64 bg-gradient-to-br from-blue-500 to-cyan-600 relative overflow-hidden flex items-center justify-center">
              <div class="absolute inset-0 bg-vr-pattern opacity-20 mix-blend-overlay"></div>
              <div class="relative z-10 p-8 text-center">
                <div class="i-carbon-face-activated-add text-5xl sm:text-7xl text-white mb-3 mx-auto"></div>
                <h3 class="text-xl sm:text-2xl font-bold text-white">Virtual & Augmented Reality</h3>
              </div>
            </div>
            <div class="p-6 md:p-8">
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                We're building immersive experiences that blur the line between digital and physical worlds, creating new ways to experience content, play games, and interact with information.
              </p>
              <div class="space-y-4">
                <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm flex gap-4 items-start">
                  <div class="i-carbon-view-360 text-xl text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 class="font-semibold mb-1 dark:text-white">Immersive Environments</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      Creating richly detailed virtual worlds that respond naturally to user interaction with realistic physics.
                    </p>
                  </div>
                </div>
                <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm flex gap-4 items-start">
                  <div class="i-carbon-touch-1 text-xl text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 class="font-semibold mb-1 dark:text-white">Spatial Computing</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      Developing intuitive hand tracking and gesture controls for natural interaction in virtual spaces.
                    </p>
                  </div>
                </div>
                <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm flex gap-4 items-start">
                  <div class="i-carbon-augmented-reality text-xl text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0"></div>
                  <div>
                    <h4 class="font-semibold mb-1 dark:text-white">AR Overlays</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      Blending digital information seamlessly with the physical world to enhance everyday experiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Supporting Technologies -->
        <div class="mt-20">
          <h3 class="text-xl sm:text-2xl font-bold mb-10 md:mb-12 text-center dark:text-white">Supporting Technologies</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
            <!-- Tech 1 -->
            <div class="text-center">
              <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-4">
                <div class="i-carbon-cloud text-2xl md:text-3xl text-pink-600 dark:text-pink-400"></div>
              </div>
              <h4 class="font-semibold mb-2 dark:text-white">Cloud Computing</h4>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Scalable infrastructure for seamless cross-device experiences
              </p>
            </div>
            
            <!-- Tech 2 -->
            <div class="text-center">
              <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                <div class="i-carbon-security text-2xl md:text-3xl text-orange-600 dark:text-orange-400"></div>
              </div>
              <h4 class="font-semibold mb-2 dark:text-white">Security & Privacy</h4>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Advanced encryption and privacy-preserving technologies
              </p>
            </div>
            
            <!-- Tech 3 -->
            <div class="text-center">
              <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <div class="i-carbon-chart-network text-2xl md:text-3xl text-green-600 dark:text-green-400"></div>
              </div>
              <h4 class="font-semibold mb-2 dark:text-white">Distributed Systems</h4>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Resilient architecture for reliable performance at scale
              </p>
            </div>
            
            <!-- Tech 4 -->
            <div class="text-center">
              <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <div class="i-carbon-data-vis-1 text-2xl md:text-3xl text-purple-600 dark:text-purple-400"></div>
              </div>
              <h4 class="font-semibold mb-2 dark:text-white">Data Analytics</h4>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Insightful analytics for continuous product improvement
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technology Process Section -->
    <section class="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
      <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 dark:text-white">Our Technology Approach</h2>
          <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We bring cutting-edge technologies to market through a disciplined, user-centered development process:
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row flex-wrap gap-6 mb-12">
          <!-- Step 1 -->
          <div class="flex-1 min-w-[250px] bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md relative">
            <div class="absolute -top-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">1</div>
            <div class="pt-2">
              <h3 class="text-lg sm:text-xl font-semibold mb-3 dark:text-white">Research & Exploration</h3>
              <p class="text-gray-600 dark:text-gray-300">
                We identify promising technologies with real-world applications and thoroughly research their capabilities and limitations.
              </p>
            </div>
          </div>
          
          <!-- Step 2 -->
          <div class="flex-1 min-w-[250px] bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md relative">
            <div class="absolute -top-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">2</div>
            <div class="pt-2">
              <h3 class="text-lg sm:text-xl font-semibold mb-3 dark:text-white">Prototyping & Testing</h3>
              <p class="text-gray-600 dark:text-gray-300">
                We build rapid prototypes to validate technical concepts and gather early user feedback to refine our approach.
              </p>
            </div>
          </div>
          
          <!-- Step 3 -->
          <div class="flex-1 min-w-[250px] bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md relative">
            <div class="absolute -top-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">3</div>
            <div class="pt-2">
              <h3 class="text-lg sm:text-xl font-semibold mb-3 dark:text-white">Integration & Refinement</h3>
              <p class="text-gray-600 dark:text-gray-300">
                We seamlessly integrate technologies into cohesive products, optimizing for performance, reliability, and user experience.
              </p>
            </div>
          </div>
          
          <!-- Step 4 -->
          <div class="flex-1 min-w-[250px] bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md relative">
            <div class="absolute -top-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">4</div>
            <div class="pt-2">
              <h3 class="text-lg sm:text-xl font-semibold mb-3 dark:text-white">Continuous Evolution</h3>
              <p class="text-gray-600 dark:text-gray-300">
                We constantly refine and enhance our technologies based on usage data, emerging capabilities, and user feedback.
              </p>
            </div>
          </div>
        </div>
        
        <!-- CTA Section -->
        <div class="bg-indigo-600 dark:bg-indigo-700 rounded-2xl overflow-hidden shadow-xl mt-16">
          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
              <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">Interested in Our Technology?</h3>
              <p class="text-indigo-100 mb-6">
                We're always looking for technology partners, early adopters, and talented people passionate about pushing boundaries.
              </p>
              <div class="flex flex-wrap gap-4">
                <a href="mailto:tech@sylphx.com" class="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition">
                  <span class="i-carbon-email mr-2"></span>
                  Contact Our Tech Team
                </a>
                <a href="https://github.com/sylphxltd" target="_blank" class="inline-flex items-center px-6 py-3 bg-indigo-500/20 text-white rounded-lg font-medium border border-white/20 hover:bg-indigo-500/30 transition">
                  <span class="i-carbon-logo-github mr-2"></span>
                  GitHub
                </a>
              </div>
            </div>
            <div class="hidden md:block bg-tech-illustration h-full bg-cover bg-center"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.bg-tech-pattern {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z' opacity='0.5'/%3E%3Cpath d='M15 15h50v50H15V15zm20 20v10h10V35h-10zm-5-5h20v20H30V30z'/%3E%3C/g%3E%3C/svg%3E");
}

.bg-ai-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M21.5 24.5l-10-10h19v19l-10-10v20l20 20v-19l-10-10h19l-10 10'/%3E%3C/g%3E%3C/svg%3E");
}

.bg-vr-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M50 50l20-20 20 20zm-30 0l20-20 20 20zm0 30l20-20 20 20zM0 80l20-20 20 20z'/%3E%3C/g%3E%3C/svg%3E");
}

.bg-tech-illustration {
  background-image: linear-gradient(45deg, rgba(79, 70, 229, 0.4), rgba(147, 51, 234, 0.6)), url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
</style>