import { For, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { type ToastType, getTimeLeftPercentage, removeToast, toasts } from '@/stores/toast'

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-500',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-500',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-500',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-500',
    icon: 'ℹ',
  },
}

export const ToastContainer: Component = () => {
  return (
    <Show when={toasts().length > 0}>
      <div class="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4 sm:p-6">
        <For each={toasts()}>
          {(toast) => {
            const style = toastStyles[toast.type]
            const percentage = () => getTimeLeftPercentage(toast)

            return (
              <div
                class={`pointer-events-auto relative overflow-hidden rounded-lg border-l-4 ${style.border} ${style.bg} shadow-lg transition-all duration-300`}
              >
                <div class="flex items-start gap-3 p-4">
                  <span class="text-xl">{style.icon}</span>
                  <p class="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {toast.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    class="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <Show when={toast.timeout > 0}>
                  <div class="h-1 bg-gray-200 dark:bg-gray-700">
                    <div
                      class={`h-full ${style.border.replace('border', 'bg')} transition-all duration-100`}
                      style={{ width: `${percentage()}%` }}
                    />
                  </div>
                </Show>
              </div>
            )
          }}
        </For>
      </div>
    </Show>
  )
}
