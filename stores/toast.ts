import { defineStore } from 'pinia'
import type { ToastType } from '~/components/Toast.vue'

export interface Toast {
  id: number
  message: string
  type: ToastType
  timeout: number
  startTime: number
  timeLeft: number
}

export const useToastStore = defineStore('toast', () => {
  // State
  const toasts = ref<Toast[]>([])
  let lastId = 0
  let timer = ref<number | null>(null)
  
  // Actions
  function add(message: string, type: ToastType = 'info', timeout: number = 5000) {
    const id = ++lastId
    const nowTime = Date.now()
    
    toasts.value.push({
      id,
      message,
      type,
      timeout,
      startTime: nowTime,
      timeLeft: timeout
    })
    
    // Start timer if first toast
    if (toasts.value.length === 1) {
      startTimer()
    }
    
    return id
  }
  
  function success(message: string, timeout?: number) {
    return add(message, 'success', timeout)
  }
  
  function error(message: string, timeout?: number) {
    return add(message, 'error', timeout)
  }
  
  function warning(message: string, timeout?: number) {
    return add(message, 'warning', timeout)
  }
  
  function info(message: string, timeout?: number) {
    return add(message, 'info', timeout)
  }
  
  function remove(id: number) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
      
      // Stop timer if no toasts
      if (toasts.value.length === 0 && timer.value !== null) {
        window.clearInterval(timer.value)
        timer.value = null
      }
    }
  }
  
  function clear() {
    toasts.value = []
    if (timer.value !== null) {
      window.clearInterval(timer.value)
      timer.value = null
    }
  }
  
  // Update remaining time
  function updateToasts() {
    const now = Date.now()
    const toastsToRemove: number[] = []
    
    toasts.value.forEach(toast => {
      const elapsed = now - toast.startTime
      toast.timeLeft = Math.max(0, toast.timeout - elapsed)
      
      if (toast.timeLeft <= 0 && toast.timeout > 0) {
        toastsToRemove.push(toast.id)
      }
    })
    
    toastsToRemove.forEach(id => remove(id))
  }
  
  // Calculate percentage of time left
  function getTimeLeftPercentage(toast: Toast): number {
    if (toast.timeout <= 0) return 100
    return (toast.timeLeft / toast.timeout) * 100
  }
  
  // Start timer
  function startTimer() {
    if (timer.value === null) {
      timer.value = window.setInterval(updateToasts, 100)
    }
  }
  
  // Clean up on page leave
  onUnmounted(() => {
    if (timer.value !== null) {
      window.clearInterval(timer.value)
      timer.value = null
    }
  })
  
  return {
    // State
    toasts,
    
    // Actions
    add,
    success,
    error,
    warning,
    info,
    remove,
    clear,
    getTimeLeftPercentage
  }
}) 