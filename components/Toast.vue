<template>
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      name="toast"
      class="fixed z-50 top-4 right-4 flex flex-col gap-3 max-w-sm"
    >
      <div 
        v-for="toast in toasts" 
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
            @click="removeToast(toast.id)"
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
            :style="{ width: `${getTimeLeftPercentage(toast)}%` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  timeout: number;
  startTime: number;
  timeLeft: number;
}

// State
const toasts = ref<Toast[]>([]);
let lastId = 0;
let timer: number | null = null;

// Add a new toast
function addToast(message: string, type: ToastType = 'info', timeout: number = 5000) {
  const id = ++lastId;
  const nowTime = Date.now();
  
  toasts.value.push({
    id,
    message,
    type,
    timeout,
    startTime: nowTime,
    timeLeft: timeout
  });

  // Start timer if first toast
  if (toasts.value.length === 1) {
    startTimer();
  }

  return id;
}

// Remove a toast
function removeToast(id: number) {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
    
    // Stop timer if no toasts
    if (toasts.value.length === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }
}

// Update remaining time
function updateToasts() {
  const now = Date.now();
  const toastsToRemove: number[] = [];
  
  toasts.value.forEach(toast => {
    const elapsed = now - toast.startTime;
    toast.timeLeft = Math.max(0, toast.timeout - elapsed);
    
    if (toast.timeLeft <= 0 && toast.timeout > 0) {
      toastsToRemove.push(toast.id);
    }
  });
  
  toastsToRemove.forEach(id => removeToast(id));
}

// Calculate percentage of time left
function getTimeLeftPercentage(toast: Toast): number {
  if (toast.timeout <= 0) return 100;
  return (toast.timeLeft / toast.timeout) * 100;
}

// Start timer
function startTimer() {
  if (timer === null) {
    timer = window.setInterval(updateToasts, 100);
  }
}

// Clear all toasts
function clearToasts() {
  toasts.value = [];
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}

// Expose methods for external use
defineExpose({
  add: addToast,
  remove: removeToast,
  clear: clearToasts
});

// Clean up on unmount
onUnmounted(() => {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
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