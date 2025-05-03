<template>
  <div class="fixed inset-0 z-30 bg-white dark:bg-gray-900 pt-16">
    <div class="px-4 py-6 flex flex-col gap-4 text-center">
      <template v-for="link in navLinks" :key="link.path">
        <NuxtLink
          v-if="!link.external"
          :to="link.path"
          @click="$emit('close-menu')"
          class="text-gray-800 dark:text-gray-200 font-medium text-lg py-3"
        >
          {{ link.name }}
        </NuxtLink>
        <a
          v-else
          :href="link.path"
          @click="$emit('close-menu')"
          class="text-gray-800 dark:text-gray-200 font-medium text-lg py-3"
        >
          {{ link.name }}
        </a>
      </template>
      <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
        <button @click="$emit('toggle-dark'); $emit('close-menu')" class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div v-if="isDark" class="i-carbon-moon text-base text-indigo-400"></div>
          <div v-else class="i-carbon-sun text-base text-blue-600"></div>
          <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isDark: Boolean,
  navLinks: Array
});

defineEmits(['close-menu', 'toggle-dark']);
</script>