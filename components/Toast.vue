<template>
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      name="toast"
      class="fixed z-50 top-4 right-4 flex flex-col gap-3 max-w-sm"
    >
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm animate-fadeIn', 
          toast.type === 'success' ? 'bg-green-500/90 text-white' : 
          toast.type === 'error' ? 'bg-red-500/90 text-white' : 
          toast.type === 'warning' ? 'bg-yellow-500/90 text-white' : 
          'bg-blue-500/90 text-white'
        ]"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0 mr-2">
            <div v-if="toast.type === 'success'" class="i-carbon-checkmark-outline text-xl"></div>
            <div v-else-if="toast.type === 'error'" class="i-carbon-warning text-xl"></div>
            <div v-else-if="toast.type === 'warning'" class="i-carbon-warning-alt text-xl"></div>
            <div v-else class="i-carbon-information text-xl"></div>
          </div>
          <div class="flex-1 pr-6">
            <p class="font-medium">{{ toast.message }}</p>
          </div>
          <button 
            @click="toastStore.remove(toast.id)"
            class="flex-shrink-0 -mt-1 -mr-1 ml-auto text-white/80 hover:text-white"
          >
            <div class="i-carbon-close text-lg"></div>
          </button>
        </div>
        <!-- Progress bar -->
        <div 
          v-if="toast.timeout > 0" 
          class="h-1 bg-white/30 mt-2 rounded-full overflow-hidden"
        >
          <div 
            class="h-full bg-white/70 rounded-full" 
            :style="{ width: `${toastStore.getTimeLeftPercentage(toast)}%` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useToastStore } from '~/stores/toast';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

const toastStore = useToastStore();

// Mount the Toast component globally when app starts
onMounted(() => {
  // Not needed - the state is managed directly in the Pinia store
  console.log('Toast component mounted');
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
</style> 