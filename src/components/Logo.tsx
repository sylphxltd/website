import { Zap } from 'lucide-react'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Abstract icon combining lightning (speed) with elegance */}
      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
          <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
          Sylphx
        </span>
      )}
    </div>
  )
}
