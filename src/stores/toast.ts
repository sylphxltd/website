import { deepMap, get, setDeepMapPath as setPath } from '@sylphx/zen'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  timeout: number
  startTime: number
  timeLeft: number
}

export interface ToastState {
  toasts: Toast[]
  lastId: number
  timer: number | null
}

// ASSUMPTION: Using deepMap for nested state structure
export const toastStore = deepMap<ToastState>({
  toasts: [],
  lastId: 0,
  timer: null,
})

// Update toasts and remove expired ones
function updateToasts() {
  const state = get(toastStore)
  const now = Date.now()
  const toastsToRemove: number[] = []

  const updatedToasts = state.toasts.map((toast) => {
    const elapsed = now - toast.startTime
    const timeLeft = Math.max(0, toast.timeout - elapsed)

    if (timeLeft <= 0 && toast.timeout > 0) {
      toastsToRemove.push(toast.id)
    }

    return { ...toast, timeLeft }
  })

  const filteredToasts = updatedToasts.filter((toast) => !toastsToRemove.includes(toast.id))

  setPath(toastStore, ['toasts'], filteredToasts)

  // Stop timer if no toasts
  if (filteredToasts.length === 0 && state.timer !== null) {
    window.clearInterval(state.timer)
    setPath(toastStore, ['timer'], null)
  }
}

// Start timer
function startTimer() {
  const state = get(toastStore)
  if (state.timer === null) {
    const timerId = window.setInterval(updateToasts, 100)
    setPath(toastStore, ['timer'], timerId)
  }
}

// Add toast
export function addToast(message: string, type: ToastType = 'info', timeout = 5000) {
  const state = get(toastStore)
  const id = state.lastId + 1
  const nowTime = Date.now()

  const newToast: Toast = {
    id,
    message,
    type,
    timeout,
    startTime: nowTime,
    timeLeft: timeout,
  }

  setPath(toastStore, ['toasts'], [...state.toasts, newToast])
  setPath(toastStore, ['lastId'], id)

  // Start timer if first toast
  if (state.toasts.length === 0) {
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
  const state = get(toastStore)
  const filteredToasts = state.toasts.filter((toast) => toast.id !== id)

  setPath(toastStore, ['toasts'], filteredToasts)

  // Stop timer if no toasts
  if (filteredToasts.length === 0 && state.timer !== null) {
    window.clearInterval(state.timer)
    setPath(toastStore, ['timer'], null)
  }
}

// Clear all toasts
export function clearToasts() {
  const state = get(toastStore)

  setPath(toastStore, ['toasts'], [])

  if (state.timer !== null) {
    window.clearInterval(state.timer)
    setPath(toastStore, ['timer'], null)
  }
}

// Get time left percentage
export function getTimeLeftPercentage(toast: Toast): number {
  if (toast.timeout <= 0) return 100
  return (toast.timeLeft / toast.timeout) * 100
}
