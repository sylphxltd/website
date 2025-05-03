import { defineNuxtPlugin, useNuxtApp } from '#app'
import { ref } from 'vue'
import type { ToastType } from '~/components/Toast.vue'

export interface ToastOptions {
  message: string
  type?: ToastType
  timeout?: number
}

export default defineNuxtPlugin((nuxtApp) => {
  // Create a refs to store the toast component reference
  const toastComponent = ref(null)

  // Toast methods
  const toast = {
    // Register the toast component
    setComponent(component: any) {
      toastComponent.value = component
    },

    // Add a toast notification
    add(options: ToastOptions) {
      if (toastComponent.value) {
        return toastComponent.value.add(
          options.message, 
          options.type || 'info', 
          options.timeout || 5000
        )
      }
      // Fallback to console if component not available
      console.log(`Toast: ${options.type || 'info'} - ${options.message}`)
      return -1
    },

    // Show a success toast
    success(message: string, timeout?: number) {
      return this.add({ message, type: 'success', timeout })
    },

    // Show an error toast
    error(message: string, timeout?: number) {
      return this.add({ message, type: 'error', timeout })
    },

    // Show a warning toast
    warning(message: string, timeout?: number) {
      return this.add({ message, type: 'warning', timeout })
    },

    // Show an info toast
    info(message: string, timeout?: number) {
      return this.add({ message, type: 'info', timeout })
    },

    // Remove a toast by ID
    remove(id: number) {
      if (toastComponent.value) {
        toastComponent.value.remove(id)
      }
    },

    // Clear all toast notifications
    clear() {
      if (toastComponent.value) {
        toastComponent.value.clear()
      }
    }
  }

  // Provide the toast service to all components
  nuxtApp.provide('toast', toast)
})

// Helper to use toast outside of components
export function useToast() {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$toast
} 