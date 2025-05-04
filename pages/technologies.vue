<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-16">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header section -->
      <div class="max-w-4xl mx-auto text-center mb-20">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Our Technologies
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          The cutting-edge technologies powering our innovative digital experiences.
        </p>
      </div>
      
      <!-- Main technologies grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
        <!-- AI Technology -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all hover:-translate-y-1 hover:shadow-xl">
          <div class="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
            <!-- Decorative elements -->
            <div class="absolute top-6 left-6">
              <div class="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span class="i-carbon-ai-status text-3xl text-white"></span>
              </div>
            </div>
            
            <!-- Grid background pattern -->
            <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
            
            <!-- Floating geometric shapes -->
            <div class="absolute -right-6 -bottom-10 w-32 h-32 bg-purple-500/20 backdrop-blur-md rounded-full transform rotate-12"></div>
            <div class="absolute right-12 bottom-6 w-16 h-16 bg-indigo-500/20 backdrop-blur-md rounded-lg transform -rotate-6"></div>
          </div>
          
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Artificial Intelligence</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Our proprietary AI systems deliver intelligent, adaptive experiences that learn and evolve with user behavior. From natural language processing to recommendation systems, our AI technology powers many of our innovative features.
            </p>
            
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
                Machine Learning
              </span>
              <span class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
                Natural Language Processing
              </span>
              <span class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
                Neural Networks
              </span>
            </div>
            
            <div class="flex items-center text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              <span>Key Applications:</span>
              <ul class="ml-3 flex space-x-2">
                <li>
                  <NuxtLink to="/apps/sylph-note" class="hover:underline flex items-center">
                    <span class="i-carbon-document text-lg mr-1"></span> SylphNote
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/apps/sylph-chat" class="hover:underline flex items-center">
                    <span class="i-carbon-chat text-lg mr-1"></span> SylphChat
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- VR Technology -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all hover:-translate-y-1 hover:shadow-xl">
          <div class="h-48 bg-gradient-to-r from-purple-500 to-pink-600 relative overflow-hidden">
            <!-- Decorative elements -->
            <div class="absolute top-6 left-6">
              <div class="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span class="i-carbon-view-3d text-3xl text-white"></span>
              </div>
            </div>
            
            <!-- Grid background pattern -->
            <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
            
            <!-- Floating geometric shapes -->
            <div class="absolute -right-6 -bottom-10 w-32 h-32 bg-pink-500/20 backdrop-blur-md rounded-full transform rotate-12"></div>
            <div class="absolute right-12 bottom-6 w-16 h-16 bg-purple-500/20 backdrop-blur-md rounded-lg transform -rotate-6"></div>
          </div>
          
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Virtual Reality</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Our VR technology creates immersive, high-fidelity digital environments that respond naturally to user interactions. We've optimized our rendering engines and motion tracking to minimize latency and maximize presence.
            </p>
            
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                Immersive Environments
              </span>
              <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                Motion Tracking
              </span>
              <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                Spatial Audio
              </span>
            </div>
            
            <div class="flex items-center text-sm text-purple-600 dark:text-purple-400 font-medium">
              <span>Key Applications:</span>
              <ul class="ml-3 flex space-x-2">
                <li>
                  <NuxtLink to="/apps/vortex-vr" class="hover:underline flex items-center">
                    <span class="i-carbon-virtual-column text-lg mr-1"></span> VortexVR
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- AR Technology -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all hover:-translate-y-1 hover:shadow-xl">
          <div class="h-48 bg-gradient-to-r from-amber-500 to-orange-600 relative overflow-hidden">
            <!-- Decorative elements -->
            <div class="absolute top-6 left-6">
              <div class="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span class="i-carbon-augmented-reality text-3xl text-white"></span>
              </div>
            </div>
            
            <!-- Grid background pattern -->
            <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
            
            <!-- Floating geometric shapes -->
            <div class="absolute -right-6 -bottom-10 w-32 h-32 bg-orange-500/20 backdrop-blur-md rounded-full transform rotate-12"></div>
            <div class="absolute right-12 bottom-6 w-16 h-16 bg-amber-500/20 backdrop-blur-md rounded-lg transform -rotate-6"></div>
          </div>
          
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Augmented Reality</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Our AR technology blends digital content with the real world, creating interactive experiences that enhance everyday life. Advanced object recognition and tracking enable precise placement of virtual objects in physical space.
            </p>
            
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm">
                Object Recognition
              </span>
              <span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm">
                Surface Detection
              </span>
              <span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm">
                Spatial Mapping
              </span>
            </div>
            
            <div class="flex items-center text-sm text-amber-600 dark:text-amber-400 font-medium">
              <span>Key Applications:</span>
              <ul class="ml-3 flex space-x-2">
                <li>
                  <NuxtLink to="/apps/pocket-ar" class="hover:underline flex items-center">
                    <span class="i-carbon-augmented-reality text-lg mr-1"></span> PocketAR
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Cloud Technology -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all hover:-translate-y-1 hover:shadow-xl">
          <div class="h-48 bg-gradient-to-r from-blue-500 to-teal-600 relative overflow-hidden">
            <!-- Decorative elements -->
            <div class="absolute top-6 left-6">
              <div class="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span class="i-carbon-cloud text-3xl text-white"></span>
              </div>
            </div>
            
            <!-- Grid background pattern -->
            <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
            
            <!-- Floating geometric shapes -->
            <div class="absolute -right-6 -bottom-10 w-32 h-32 bg-teal-500/20 backdrop-blur-md rounded-full transform rotate-12"></div>
            <div class="absolute right-12 bottom-6 w-16 h-16 bg-blue-500/20 backdrop-blur-md rounded-lg transform -rotate-6"></div>
          </div>
          
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cloud Infrastructure</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Our scalable cloud architecture enables seamless experiences across devices, with real-time synchronization and low-latency data processing. Auto-scaling ensures optimal performance even during peak usage.
            </p>
            
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                Distributed Systems
              </span>
              <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                Real-time Sync
              </span>
              <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                Auto-scaling
              </span>
            </div>
            
            <div class="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
              <span>Key Applications:</span>
              <ul class="ml-3 flex space-x-2">
                <li>
                  <span class="flex items-center">
                    <span class="i-carbon-cloud-app text-lg mr-1"></span> All Products
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Mobile Technology -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all hover:-translate-y-1 hover:shadow-xl">
          <div class="h-48 bg-gradient-to-r from-green-500 to-emerald-600 relative overflow-hidden">
            <!-- Decorative elements -->
            <div class="absolute top-6 left-6">
              <div class="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span class="i-carbon-mobile text-3xl text-white"></span>
              </div>
            </div>
            
            <!-- Grid background pattern -->
            <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
            
            <!-- Floating geometric shapes -->
            <div class="absolute -right-6 -bottom-10 w-32 h-32 bg-emerald-500/20 backdrop-blur-md rounded-full transform rotate-12"></div>
            <div class="absolute right-12 bottom-6 w-16 h-16 bg-green-500/20 backdrop-blur-md rounded-lg transform -rotate-6"></div>
          </div>
          
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mobile Development</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Our cross-platform mobile framework enables high-performance applications that deliver native-like experiences. Advanced optimization techniques ensure smooth performance and minimal battery usage.
            </p>
            
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                Cross-platform
              </span>
              <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                Performance Optimization
              </span>
              <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                Battery Efficiency
              </span>
            </div>
            
            <div class="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
              <span>Key Applications:</span>
              <ul class="ml-3 flex space-x-2">
                <li>
                  <NuxtLink to="/apps/sylph-note" class="hover:underline flex items-center">
                    <span class="i-carbon-document text-lg mr-1"></span> SylphNote
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/apps/sylph-chat" class="hover:underline flex items-center">
                    <span class="i-carbon-chat text-lg mr-1"></span> SylphChat
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Game Technology -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all hover:-translate-y-1 hover:shadow-xl">
          <div class="h-48 bg-gradient-to-r from-red-500 to-rose-600 relative overflow-hidden">
            <!-- Decorative elements -->
            <div class="absolute top-6 left-6">
              <div class="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span class="i-carbon-game-console text-3xl text-white"></span>
              </div>
            </div>
            
            <!-- Grid background pattern -->
            <div class="absolute inset-0 bg-grid-white/[0.05] bg-[top_1px_left_1px]"></div>
            
            <!-- Floating geometric shapes -->
            <div class="absolute -right-6 -bottom-10 w-32 h-32 bg-rose-500/20 backdrop-blur-md rounded-full transform rotate-12"></div>
            <div class="absolute right-12 bottom-6 w-16 h-16 bg-red-500/20 backdrop-blur-md rounded-lg transform -rotate-6"></div>
          </div>
          
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Game Development</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Our game engine delivers high-performance, visually stunning experiences across platforms. Advanced physics simulation and procedural generation create dynamic, responsive game worlds.
            </p>
            
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm">
                Physics Simulation
              </span>
              <span class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm">
                Procedural Generation
              </span>
              <span class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm">
                Advanced Rendering
              </span>
            </div>
            
            <div class="flex items-center text-sm text-red-600 dark:text-red-400 font-medium">
              <span>Key Applications:</span>
              <ul class="ml-3 flex space-x-2">
                <li>
                  <NuxtLink to="/apps/cosmic-explorer" class="hover:underline flex items-center">
                    <span class="i-carbon-rocket text-lg mr-1"></span> Cosmic Explorer
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Technical capabilities section -->
      <div class="max-w-5xl mx-auto mb-20">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
          Technical Capabilities
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Performance metrics -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span class="i-carbon-chart-line-data h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2"></span>
              Performance Benchmarks
            </h3>
            
            <div class="space-y-6">
              <!-- Rendering speed -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rendering Speed</span>
                  <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">95%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div class="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style="width: 95%"></div>
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">120+ FPS on high-end devices</p>
              </div>
              
              <!-- Battery efficiency -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Battery Efficiency</span>
                  <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">85%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div class="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style="width: 85%"></div>
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Optimized for low power consumption</p>
              </div>
              
              <!-- Load time -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Load Time</span>
                  <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">90%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div class="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style="width: 90%"></div>
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Sub-second initial load on 4G+</p>
              </div>
              
              <!-- AI response time -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">AI Response Time</span>
                  <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">80%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div class="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style="width: 80%"></div>
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">~150ms response for ML predictions</p>
              </div>
            </div>
          </div>
          
          <!-- Tech stack -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span class="i-carbon-stack h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2"></span>
              Tech Stack
            </h3>
            
            <div class="grid grid-cols-2 gap-6">
              <!-- Frontend -->
              <div>
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  Frontend
                </h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">Vue.js / Nuxt</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">React Native</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">Three.js / WebGL</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">TailwindCSS</span>
                  </li>
                </ul>
              </div>
              
              <!-- Backend -->
              <div>
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  Backend
                </h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">Node.js / Express</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">Firebase</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">PostgreSQL / MongoDB</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">GraphQL</span>
                  </li>
                </ul>
              </div>
              
              <!-- ML/AI -->
              <div>
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  ML/AI
                </h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">TensorFlow / PyTorch</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">OpenAI / GPT</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">ONNX Runtime</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">Proprietary LLMs</span>
                  </li>
                </ul>
              </div>
              
              <!-- Infrastructure -->
              <div>
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  Infrastructure
                </h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">Docker / Kubernetes</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">AWS / GCP</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">Vercel / Cloudflare</span>
                  </li>
                  <li class="flex items-center">
                    <span class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400">•</span>
                    <span class="text-gray-600 dark:text-gray-300">CI/CD Pipelines</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- CTA section -->
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Interested in Our Technologies?
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Explore our products to see our technologies in action, or get in touch to learn more about potential partnerships and integrations.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/apps" class="px-8 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl">
            Explore Products
          </NuxtLink>
          <NuxtLink to="/contact" class="px-8 py-3 text-white hover:text-indigo-200 bg-transparent border border-indigo-600 hover:bg-indigo-600/10 rounded-full font-medium transition-colors">
            Contact Us
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Define page meta
definePageMeta({
  layout: 'default'
});
</script>

<style>
/* Custom utility classes */
.bg-grid-white {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
}
</style>