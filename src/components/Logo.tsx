import { Zap } from 'lucide-solid'
import type { Component } from 'solid-js'

interface LogoProps {
  class?: string
  showText?: boolean
}

export const Logo: Component<LogoProps> = (props) => {
  return (
    <div class={`flex items-center gap-2 ${props.class || ''}`}>
      {/* Abstract icon combining lightning (speed) with elegance */}
      <div class="relative">
        <div class="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm" />
        <div class="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
          <Zap class="h-6 w-6 text-white" stroke-width={2.5} />
        </div>
      </div>
      {(props.showText ?? true) && (
        <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
          Sylphx
        </span>
      )}
    </div>
  )
}
