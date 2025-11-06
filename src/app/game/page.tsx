'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sparkles,
  Zap,
  Wind,
  Orbit,
  Wand2,
  RotateCcw,
  Info,
  Palette,
  Settings,
} from 'lucide-react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  mass: number
  radius: number
  color: string
  trail: { x: number; y: number }[]
}

type Mode = 'attract' | 'repel' | 'orbit' | 'blackhole' | 'create'

const COLORS = [
  '#4F46E5', // indigo
  '#7C3AED', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#EF4444', // red
]

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<Mode>('attract')
  const [particles, setParticles] = useState<Particle[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [particleCount, setParticleCount] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | undefined>(undefined)
  const isMouseDownRef = useRef(false)
  const particlesRef = useRef<Particle[]>([])

  // Initialize with some particles
  const initializeParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const newParticles: Particle[] = []
    for (let i = 0; i < 80; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        mass: 2 + Math.random() * 3,
        radius: 3 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0],
        trail: [],
      })
    }
    particlesRef.current = newParticles
    setParticles(newParticles)
    setParticleCount(newParticles.length)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    initializeParticles()

    return () => window.removeEventListener('resize', updateSize)
  }, [initializeParticles])

  const applyForce = useCallback(
    (p: Particle, mouseX: number, mouseY: number, canvas: HTMLCanvasElement) => {
      const dx = mouseX - p.x
      const dy = mouseY - p.y
      const distSq = dx * dx + dy * dy
      const dist = Math.sqrt(distSq)

      if (dist < 5) return

      switch (mode) {
        case 'attract': {
          const force = (300 * p.mass) / (distSq + 100)
          p.vx += (dx / dist) * force * 0.01
          p.vy += (dy / dist) * force * 0.01
          break
        }
        case 'repel': {
          const force = (500 * p.mass) / (distSq + 100)
          p.vx -= (dx / dist) * force * 0.01
          p.vy -= (dy / dist) * force * 0.01
          break
        }
        case 'orbit': {
          const force = 200 / (dist + 50)
          p.vx += (-dy / dist) * force * 0.01
          p.vy += (dx / dist) * force * 0.01
          break
        }
        case 'blackhole': {
          if (dist < 50) {
            p.mass *= 0.95
            p.radius *= 0.98
            if (p.radius < 0.5) {
              p.radius = 0
            }
          } else {
            const force = (800 * p.mass) / (distSq + 50)
            p.vx += (dx / dist) * force * 0.01
            p.vy += (dy / dist) * force * 0.01
          }
          break
        }
      }

      // Boundary collision
      if (p.x < p.radius) {
        p.x = p.radius
        p.vx *= -0.8
      }
      if (p.x > canvas.width - p.radius) {
        p.x = canvas.width - p.radius
        p.vx *= -0.8
      }
      if (p.y < p.radius) {
        p.y = p.radius
        p.vy *= -0.8
      }
      if (p.y > canvas.height - p.radius) {
        p.y = canvas.height - p.radius
        p.vy *= -0.8
      }

      // Damping
      p.vx *= 0.995
      p.vy *= 0.995

      // Update position
      p.x += p.vx
      p.y += p.vy

      // Trail
      if (p.trail.length > 15) {
        p.trail.shift()
      }
      p.trail.push({ x: p.x, y: p.y })
    },
    [mode]
  )

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Clear with fade effect
    ctx.fillStyle = 'rgba(17, 24, 39, 0.15)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const currentParticles = particlesRef.current

    // Apply forces
    if (isMouseDownRef.current) {
      currentParticles.forEach((p) => {
        applyForce(p, mousePos.x, mousePos.y, canvas)
      })
    }

    // Particle interaction (simplified for performance)
    for (let i = 0; i < currentParticles.length; i++) {
      const p1 = currentParticles[i]
      if (!p1 || p1.radius === 0) continue

      for (let j = i + 1; j < currentParticles.length; j++) {
        const p2 = currentParticles[j]
        if (!p2 || p2.radius === 0) continue

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const distSq = dx * dx + dy * dy
        const dist = Math.sqrt(distSq)

        if (dist < p1.radius + p2.radius) {
          // Collision
          const angle = Math.atan2(dy, dx)
          const sin = Math.sin(angle)
          const cos = Math.cos(angle)

          // Separate particles
          const overlap = (p1.radius + p2.radius - dist) / 2
          p1.x -= overlap * cos
          p1.y -= overlap * sin
          p2.x += overlap * cos
          p2.y += overlap * sin

          // Elastic collision
          const v1 = { x: p1.vx * cos + p1.vy * sin, y: p1.vy * cos - p1.vx * sin }
          const v2 = { x: p2.vx * cos + p2.vy * sin, y: p2.vy * cos - p2.vx * sin }

          const m1 = p1.mass
          const m2 = p2.mass
          const vx1 = ((m1 - m2) * v1.x + 2 * m2 * v2.x) / (m1 + m2)
          const vx2 = ((m2 - m1) * v2.x + 2 * m1 * v1.x) / (m1 + m2)

          p1.vx = vx1 * cos - v1.y * sin
          p1.vy = v1.y * cos + vx1 * sin
          p2.vx = vx2 * cos - v2.y * sin
          p2.vy = v2.y * cos + vx2 * sin
        } else if (dist < 150 && mode !== 'blackhole') {
          // Attraction between particles
          const force = (p1.mass * p2.mass) / (distSq + 1000)
          const fx = (dx / dist) * force * 0.0005
          const fy = (dy / dist) * force * 0.0005

          p1.vx += fx
          p1.vy += fy
          p2.vx -= fx
          p2.vy -= fy

          // Draw connection
          const alpha = Math.max(0, 1 - dist / 150)
          ctx.strokeStyle = `rgba(79, 70, 229, ${alpha * 0.3})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }
    }

    // Draw particles
    currentParticles.forEach((p) => {
      if (p.radius === 0) return

      // Draw trail
      ctx.strokeStyle = p.color + '40'
      ctx.lineWidth = 1
      ctx.beginPath()
      p.trail.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()

      // Draw particle
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius)
      gradient.addColorStop(0, p.color + 'FF')
      gradient.addColorStop(0.5, p.color + 'CC')
      gradient.addColorStop(1, p.color + '00')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()

      // Glow effect
      ctx.shadowBlur = 10
      ctx.shadowColor = p.color
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    })

    // Draw mouse cursor effect
    if (isMouseDownRef.current) {
      const gradient = ctx.createRadialGradient(mousePos.x, mousePos.y, 0, mousePos.x, mousePos.y, 50)
      const color = mode === 'blackhole' ? '#000' : mode === 'repel' ? '#EF4444' : '#4F46E5'
      gradient.addColorStop(0, color + '40')
      gradient.addColorStop(1, color + '00')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(mousePos.x, mousePos.y, 50, 0, Math.PI * 2)
      ctx.fill()
    }

    // Clean up destroyed particles
    particlesRef.current = currentParticles.filter((p) => p.radius > 0)
    setParticleCount(particlesRef.current.length)

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [mousePos, applyForce, mode])

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate)
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [isPlaying, animate])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (mode === 'create') {
      const newParticle: Particle = {
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        mass: 3 + Math.random() * 5,
        radius: 4 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0],
        trail: [],
      }
      particlesRef.current = [...particlesRef.current, newParticle]
      setParticleCount(particlesRef.current.length)
    } else {
      isMouseDownRef.current = true
      setMousePos({ x, y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseUp = () => {
    isMouseDownRef.current = false
  }

  const modes = [
    {
      id: 'attract' as Mode,
      name: 'Attract',
      icon: Zap,
      color: 'from-indigo-500 to-purple-600',
      desc: 'Pull particles towards cursor',
    },
    {
      id: 'repel' as Mode,
      name: 'Repel',
      icon: Wind,
      color: 'from-red-500 to-orange-600',
      desc: 'Push particles away',
    },
    {
      id: 'orbit' as Mode,
      name: 'Orbit',
      icon: Orbit,
      color: 'from-cyan-500 to-blue-600',
      desc: 'Create orbital motion',
    },
    {
      id: 'blackhole' as Mode,
      name: 'Black Hole',
      icon: Sparkles,
      color: 'from-gray-800 to-gray-900',
      desc: 'Consume nearby particles',
    },
    {
      id: 'create' as Mode,
      name: 'Create',
      icon: Wand2,
      color: 'from-emerald-500 to-green-600',
      desc: 'Spawn new particles',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-200 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>Interactive Physics Sandbox</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">Gravity Sandbox</h1>
          <p className="text-lg text-gray-300">
            Real-time particle physics with gravitational forces
          </p>
        </div>

        {/* Controls */}
        <div className="mx-auto mb-6 max-w-6xl">
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/90 p-4 backdrop-blur-md md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`rounded-lg px-6 py-2 font-semibold text-white transition-all ${
                    isPlaying
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg'
                  }`}
                >
                  {isPlaying ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={initializeParticles}
                  className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white transition-all hover:bg-gray-600"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white transition-all hover:bg-gray-600"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-300">
                Particles: <span className="font-bold text-white">{particleCount}</span>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`group relative overflow-hidden rounded-xl p-4 transition-all ${
                    mode === m.id
                      ? 'scale-105 ring-2 ring-white'
                      : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${m.color} ${
                      mode === m.id ? 'opacity-100' : 'opacity-70'
                    }`}
                  />
                  <div className="relative">
                    <m.icon className="mx-auto mb-2 h-6 w-6 text-white" />
                    <div className="text-sm font-semibold text-white">{m.name}</div>
                  </div>
                </button>
              ))}
            </div>

            {showInfo && (
              <div className="mt-4 rounded-lg bg-gray-700/50 p-4">
                <p className="text-sm text-gray-300">
                  <strong className="text-white">{modes.find((m) => m.id === mode)?.name}:</strong>{' '}
                  {modes.find((m) => m.id === mode)?.desc}
                  {mode !== 'create' && ' (Click and drag)'}
                  {mode === 'create' && ' (Click to spawn)'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="mx-auto max-w-6xl">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full cursor-crosshair rounded-2xl border border-gray-700/50 bg-gray-900 shadow-2xl"
            style={{ height: '600px' }}
          />
        </div>

        {/* Tech Stack */}
        <div className="mx-auto mt-8 max-w-6xl">
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/90 p-6 backdrop-blur-md">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <Settings className="h-5 w-5" />
              Technical Features
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {[
                { name: 'Canvas API', desc: '2D Graphics Rendering' },
                { name: 'Physics Engine', desc: 'Gravity & Collision' },
                { name: 'Particle System', desc: 'Real-time Simulation' },
                { name: '60 FPS', desc: 'Smooth Animation' },
              ].map((tech) => (
                <div key={tech.name} className="text-center">
                  <div className="font-semibold text-white">{tech.name}</div>
                  <div className="text-sm text-gray-400">{tech.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
