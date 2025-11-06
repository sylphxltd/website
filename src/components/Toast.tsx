'use client'

import { useDeepMap } from '@/hooks/useZen'
import {
  type ToastState,
  type ToastType,
  getTimeLeftPercentage,
  removeToast,
  toastStore,
} from '@/stores/toast'

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

export function ToastContainer() {
  const state = useDeepMap<ToastState>(toastStore)

  if (state.toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4 sm:p-6">
      {state.toasts.map((toast) => {
        const style = toastStyles[toast.type]
        const percentage = getTimeLeftPercentage(toast)

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden rounded-lg border-l-4 ${style.border} ${style.bg} shadow-lg transition-all duration-300`}
          >
            <div className="flex items-start gap-3 p-4">
              <span className="text-xl">{style.icon}</span>
              <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {toast.timeout > 0 && (
              <div className="h-1 bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full ${style.border.replace('border', 'bg')} transition-all duration-100`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
