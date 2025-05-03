<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-16 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-tr from-blue-50/40 to-indigo-50/40 dark:from-blue-950/40 dark:to-indigo-950/40"></div>
      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pt-4 md:pt-8">
        <div class="md:grid md:grid-cols-2 gap-12 items-center">
          <!-- Hero Content -->
          <div class="max-w-xl mb-16 md:mb-0">
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 dark:text-white">
              <span class="text-blue-600 dark:text-blue-400 relative z-10 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[30%] after:bg-blue-100/60 dark:after:bg-blue-900/30 after:-z-10">Simple</span>,
              <span class="text-indigo-600 dark:text-indigo-400 relative z-10 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[30%] after:bg-indigo-100/60 dark:after:bg-indigo-900/30 after:-z-10">Elegant</span> &
              <span class="text-violet-600 dark:text-violet-400 relative z-10 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[30%] after:bg-violet-100/60 dark:after:bg-violet-900/30 after:-z-10">Usable</span> Software
            </h1>
            <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Sylphx creates digital products that empower without overwhelming. We believe technology should serve life, not disrupt it.
            </p>
            <div class="flex flex-wrap gap-4 mb-12 md:mb-0">
              <a href="/products" class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20 transition hover:-translate-y-1 hover:shadow-xl">
                <span class="i-carbon-application mr-2"></span>
                Explore Our Products
              </a>
              <a href="/technologies" class="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg transition hover:bg-indigo-50 dark:hover:bg-indigo-950">
                <span class="i-carbon-machine-learning mr-2"></span>
                Our Technologies
              </a>
            </div>
          </div>
          <!-- Hero Visual - Only shown on medium screens and up -->
          <div class="relative h-[400px] hidden md:flex justify-center">
            <!-- Device mockup -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] md:w-[300px] h-[580px] md:h-[620px] bg-white dark:bg-gray-800 rounded-[36px] shadow-2xl overflow-hidden border-[10px] border-gray-800 dark:border-gray-950 z-20">
              <div class="w-full h-full bg-white dark:bg-gray-800 overflow-hidden">
                <div class="w-full h-full flex flex-col">
                  <div class="h-[60px] bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700"></div>
                  <div class="flex-1 p-5 flex flex-col gap-5">
                    <div class="h-[100px] bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
                    <div class="h-[140px] bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
                    <div class="h-[100px] bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Decorative shapes -->
            <div class="absolute w-[200px] h-[200px] bg-gradient-to-tr from-blue-600/20 to-indigo-400/20 dark:from-blue-700/20 dark:to-indigo-600/20 rounded-full top-[-40px] right-[20px] blur-[40px] z-10"></div>
            <div class="absolute w-[300px] h-[300px] bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 dark:from-indigo-600/20 dark:to-blue-700/20 rounded-full bottom-[-80px] right-[-100px] blur-[50px] z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Principles Section -->
    <section class="py-16 md:py-20 bg-white dark:bg-gray-900">
      <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div class="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 dark:text-white">Our Core Principles</h2>
          <p class="text-base md:text-lg text-gray-600 dark:text-gray-300">
            Every product we create embodies our commitment to design and technology excellence.
          </p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <!-- Principle 1 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl">
            <div class="w-[70px] h-[70px] bg-blue-100 dark:bg-blue-900/30 rounded-[18px] flex items-center justify-center mb-6 transition group-hover:rotate-10">
              <div class="w-[30px] h-[30px] bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-lg"></div>
            </div>
            <h3 class="text-xl font-semibold mb-4 dark:text-white">Minimalism with Purpose</h3>
            <p class="text-gray-600 dark:text-gray-300">We reduce clutter and friction, so you can focus on what matters. Streamlined but not stripped, focused but not limiting.</p>
          </div>
          
          <!-- Principle 2 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl">
            <div class="w-[70px] h-[70px] bg-indigo-100 dark:bg-indigo-900/30 rounded-[18px] flex items-center justify-center mb-6 relative transition group-hover:rotate-10">
              <div class="w-[30px] h-[10px] bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400 relative">
                <div class="absolute top-[-10px] left-0 w-[15px] h-[10px] bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400"></div>
                <div class="absolute bottom-[-10px] right-0 w-[15px] h-[10px] bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400"></div>
              </div>
            </div>
            <h3 class="text-xl font-semibold mb-4 dark:text-white">Performance without Compromise</h3>
            <p class="text-gray-600 dark:text-gray-300">Smooth experiences on all devices. No ads, no bloat, just pure functionality. Speed is a feature we prioritize.</p>
          </div>
          
          <!-- Principle 3 -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl">
            <div class="w-[70px] h-[70px] bg-violet-100 dark:bg-violet-900/30 rounded-[18px] flex items-center justify-center mb-6 transition group-hover:rotate-10">
              <div class="w-[30px] h-[30px] border-[6px] border-violet-500 dark:border-violet-400 rounded-full"></div>
            </div>
            <h3 class="text-xl font-semibold mb-4 dark:text-white">Design with Integrity</h3>
            <p class="text-gray-600 dark:text-gray-300">Natural interfaces, intentional visuals, and interactions that respect your time. Our design serves rather than demands attention.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Focus Areas Section -->
    <section class="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
      <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div class="mb-12 md:mb-16 text-center">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 dark:text-white">What We Focus On</h2>
          <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our expertise spans multiple domains, combining technical excellence with creative vision.
          </p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <!-- Focus 1: Games -->
          <a href="/products" class="block group">
            <div class="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 h-64 rounded-2xl p-6 flex flex-col justify-end text-white shadow-lg transition hover:-translate-y-2 hover:shadow-xl overflow-hidden relative">
              <div class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                <div class="i-carbon-game-console text-8xl text-white/10"></div>
              </div>
              <h3 class="text-2xl font-bold mb-2 relative">Immersive Games</h3>
              <p class="text-blue-100 relative">
                Games that blend captivating narratives with innovative mechanics.
              </p>
            </div>
          </a>
          
          <!-- Focus 2: Applications -->
          <a href="/products" class="block group">
            <div class="bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 h-64 rounded-2xl p-6 flex flex-col justify-end text-white shadow-lg transition hover:-translate-y-2 hover:shadow-xl overflow-hidden relative">
              <div class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                <div class="i-carbon-application text-8xl text-white/10"></div>
              </div>
              <h3 class="text-2xl font-bold mb-2 relative">Intuitive Applications</h3>
              <p class="text-indigo-100 relative">
                Apps that deliver exceptional experiences through clean design.
              </p>
            </div>
          </a>
          
          <!-- Focus 3: Cross-Platform -->
          <a href="/products" class="block group">
            <div class="bg-gradient-to-br from-purple-500 to-violet-600 dark:from-purple-600 dark:to-violet-700 h-64 rounded-2xl p-6 flex flex-col justify-end text-white shadow-lg transition hover:-translate-y-2 hover:shadow-xl overflow-hidden relative">
              <div class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                <div class="i-carbon-software-resource text-8xl text-white/10"></div>
              </div>
              <h3 class="text-2xl font-bold mb-2 relative">Cross-Platform Solutions</h3>
              <p class="text-purple-100 relative">
                Seamless experiences that work flawlessly across platforms.
              </p>
            </div>
          </a>
          
          <!-- Focus 4: AI -->
          <a href="/technologies" class="block group">
            <div class="bg-gradient-to-br from-blue-600 to-violet-600 dark:from-blue-700 dark:to-violet-700 h-64 rounded-2xl p-6 flex flex-col justify-end text-white shadow-lg transition hover:-translate-y-2 hover:shadow-xl overflow-hidden relative">
              <div class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                <div class="i-carbon-machine-learning text-8xl text-white/10"></div>
              </div>
              <h3 class="text-2xl font-bold mb-2 relative">Artificial Intelligence</h3>
              <p class="text-blue-100 relative">
                AI that creates more intuitive and personalized experiences.
              </p>
            </div>
          </a>
          
          <!-- Focus 5: VR/AR -->
          <a href="/technologies" class="block group">
            <div class="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 h-64 rounded-2xl p-6 flex flex-col justify-end text-white shadow-lg transition hover:-translate-y-2 hover:shadow-xl overflow-hidden relative">
              <div class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                <div class="i-carbon-face-activated-add text-8xl text-white/10"></div>
              </div>
              <h3 class="text-2xl font-bold mb-2 relative">VR & AR Experiences</h3>
              <p class="text-indigo-100 relative">
                Immersive experiences that blur digital and physical worlds.
              </p>
            </div>
          </a>
          
          <!-- Focus 6: Innovation -->
          <a href="/technologies" class="block group">
            <div class="bg-gradient-to-br from-violet-600 to-blue-600 dark:from-violet-700 dark:to-blue-700 h-64 rounded-2xl p-6 flex flex-col justify-end text-white shadow-lg transition hover:-translate-y-2 hover:shadow-xl overflow-hidden relative">
              <div class="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                <div class="i-carbon-idea text-8xl text-white/10"></div>
              </div>
              <h3 class="text-2xl font-bold mb-2 relative">Future Technologies</h3>
              <p class="text-violet-100 relative">
                Exploring emerging tech to create tomorrow's experiences.
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Vision Section -->
    <section class="py-16 md:py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/20"></div>
      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 dark:text-white">Our Vision</h2>
            <blockquote class="border-l-4 border-indigo-600 dark:border-indigo-500 pl-5 py-2 mb-8 text-lg md:text-xl font-light text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-white/5 rounded-r-lg shadow-sm">
              We envision a world filled with calm, focused, high-quality digital experiences. Sylphx exists to bring that world closer—one thoughtfully crafted app at a time.
            </blockquote>
            <p class="text-gray-600 dark:text-gray-300 text-lg italic">
              We don't aim to be the biggest studio. We aim to be the most trusted. For us, good software isn't just about functionality—it's about how it makes you feel.
            </p>
          </div>
          <div class="h-[300px] relative hidden sm:block">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-morph"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA Section -->
    <section class="py-16 md:py-20">
      <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div class="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="p-8 md:p-12 flex flex-col justify-center">
              <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">Let's Build Something Amazing</h3>
              <p class="text-blue-100 mb-6">
                Whether you have a project in mind or just want to learn more about our capabilities, we'd love to hear from you.
              </p>
              <div class="flex flex-wrap gap-4">
                <a href="mailto:support@sylphx.com" class="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-blue-50 transition">
                  <span class="i-carbon-email mr-2"></span>
                  Get in Touch
                </a>
                <a href="https://github.com/sylphxltd" target="_blank" class="inline-flex items-center px-6 py-3 bg-indigo-500/20 text-white rounded-lg font-medium border border-white/20 hover:bg-indigo-500/30 transition">
                  <span class="i-carbon-logo-github mr-2"></span>
                  GitHub
                </a>
              </div>
            </div>
            <div class="hidden md:block relative">
              <div class="absolute inset-0 bg-pattern opacity-10 mix-blend-overlay"></div>
              <div class="h-full w-full bg-gradient-to-br from-indigo-600/30 to-violet-600/30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
@keyframes morph {
  0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
  25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
  50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
  75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
  100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
}

.animate-morph {
  animation: morph 15s ease-in-out infinite alternate;
}

.bg-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>