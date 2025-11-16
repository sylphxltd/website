import { createSignal, createEffect, onCleanup } from 'solid-js'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  timeout: number
  startTime: number
  timeLeft: number
}

// ASSUMPTION: Using SolidJS signals for reactive state management
const [toasts, setToasts] = createSignal<Toast[]>([])
let lastId = 0
let timer: number | null = null

// Update toasts and remove expired ones
function updateToasts() {
  const now = Date.now()
  const toastsToRemove: number[] = []

  const updatedToasts = toasts().map((toast) => {
    const elapsed = now - toast.startTime
    const timeLeft = Math.max(0, toast.timeout - elapsed)

    if (timeLeft <= 0 && toast.timeout > 0) {
      toastsToRemove.push(toast.id)
    }

    return { ...toast, timeLeft }
  })

  const filteredToasts = updatedToasts.filter((toast) => !toastsToRemove.includes(toast.id))

  setToasts(filteredToasts)

  // Stop timer if no toasts
  if (filteredToasts.length === 0 && timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

// Start timer
function startTimer() {
  if (timer === null) {
    timer = window.setInterval(updateToasts, 100)
  }
}

// Add toast
export function addToast(message: string, type: ToastType = 'info', timeout = 5000) {
  const id = ++lastId
  const nowTime = Date.now()

  const newToast: Toast = {
    id,
    message,
    type,
    timeout,
    startTime: nowTime,
    timeLeft: timeout,
  }

  setToasts((prev) => [...prev, newToast])

  // Start timer if first toast
  if (toasts().length === 1) {
    startTimer()
  }

  return id
}

// Helper functions
export function successToast(message: string, timeout?: number) {
  return addToast(message, 'success', timeout)
}

export function errorToast(message: string, timeout?: number) {
  return addToast(message, 'error', timeout)
}

export function warningToast(message: string, timeout?: number) {
  return addToast(message, 'warning', timeout)
}

export function infoToast(message: string, timeout?: number) {
  return addToast(message, 'info', timeout)
}

// Remove toast
export function removeToast(id: number) {
  const filteredToasts = toasts().filter((toast) => toast.id !== id)

  setToasts(filteredToasts)

  // Stop timer if no toasts
  if (filteredToasts.length === 0 && timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

// Clear all toasts
export function clearToasts() {
  setToasts([])

  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

// Get time left percentage
export function getTimeLeftPercentage(toast: Toast): number {
  if (toast.timeout <= 0) return 100
  return (toast.timeLeft / toast.timeout) * 100
}

// Export toasts signal
export { toasts }
