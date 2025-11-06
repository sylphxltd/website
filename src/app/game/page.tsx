'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, Maximize, Minimize, Trophy, Volume2, VolumeX } from 'lucide-react'

type FoodType = 'coffee' | 'cookie' | 'pizza' | 'icecream'

interface Customer {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  tableIndex: number
  order: FoodType
  patience: number
  maxPatience: number
  state: 'entering' | 'waiting' | 'leaving'
  satisfaction: number
  isVIP: boolean
  skinColor: string
  shirtColor: string
  scale: number
  rotation: number
}

interface FoodItem {
  type: FoodType
  x: number
  y: number
  scale: number
  pulse: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

const FOODS = [
  { type: 'coffee' as FoodType, name: 'Coffee', price: 5, time: 2000, emoji: '☕', color: '#8B4513' },
  { type: 'cookie' as FoodType, name: 'Cookie', price: 3, time: 1500, emoji: '🍪', color: '#D2691E' },
  { type: 'pizza' as FoodType, name: 'Pizza', price: 10, time: 3000, emoji: '🍕', color: '#FF6347' },
  { type: 'icecream' as FoodType, name: 'Ice Cream', price: 7, time: 2500, emoji: '🍦', color: '#FF69B4' },
]

const TABLES = [
  { x: 150, y: 220 },
  { x: 400, y: 220 },
  { x: 650, y: 220 },
  { x: 150, y: 420 },
  { x: 400, y: 420 },
  { x: 650, y: 420 },
]

const SKIN_COLORS = ['#FFE0BD', '#F1C27D', '#C68642', '#8D5524', '#E0AC69', '#F4C2A0']
const SHIRT_COLORS = ['#FF6B9D', '#4169E1', '#32CD32', '#FFD700', '#9370DB', '#FF4500']

export default function GamePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [money, setMoney] = useState(100)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [combo, setCombo] = useState(0)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [readyFood, setReadyFood] = useState<FoodItem[]>([])
  const [selectedFood, setSelectedFood] = useState<FoodType | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [preparing, setPreparing] = useState<Set<FoodType>>(new Set())

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const customerIdRef = useRef(0)
  const lastCustomerTimeRef = useRef(0)
  const comboTimerRef = useRef<NodeJS.Timeout>()

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem('cafe-highscore')
    if (saved) setHighScore(parseInt(saved, 10))

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await gameContainerRef.current?.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }, [])

  const addParticles = useCallback((x: number, y: number, color: string, count: number = 20) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const speed = 2 + Math.random() * 3
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        color,
        size: 3 + Math.random() * 4,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  const startGame = useCallback(() => {
    setIsPlaying(true)
    setIsPaused(false)
    setMoney(100)
    setScore(0)
    setLevel(1)
    setCombo(0)
    setCustomers([])
    setReadyFood([])
    setParticles([])
    setPreparing(new Set())
    customerIdRef.current = 0
    lastCustomerTimeRef.current = Date.now()
  }, [])

  const togglePause = useCallback(() => setIsPaused((prev) => !prev), [])

  const resetGame = useCallback(() => {
    setIsPlaying(false)
    setIsPaused(false)
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('cafe-highscore', score.toString())
    }
  }, [score, highScore])

  const spawnCustomer = useCallback(() => {
    const availableTables = TABLES.filter(
      (_, index) => !customers.some((c) => c.tableIndex === index && c.state !== 'leaving')
    )
    if (availableTables.length === 0) return

    const tableIndex = TABLES.findIndex((t) => t === availableTables[Math.floor(Math.random() * availableTables.length)])
    const table = TABLES[tableIndex]
    if (!table) return

    const isVIP = Math.random() < 0.15

    const newCustomer: Customer = {
      id: customerIdRef.current++,
      x: -80,
      y: table.y,
      targetX: table.x,
      targetY: table.y,
      tableIndex,
      order: FOODS[Math.floor(Math.random() * FOODS.length)]?.type ?? 'coffee',
      patience: isVIP ? 20000 : 15000,
      maxPatience: isVIP ? 20000 : 15000,
      state: 'entering',
      satisfaction: 100,
      isVIP,
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)] ?? SKIN_COLORS[0] ?? '#FFE0BD',
      shirtColor: SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)] ?? SHIRT_COLORS[0] ?? '#FF6B9D',
      scale: 0.8 + Math.random() * 0.4,
      rotation: 0,
    }

    setCustomers((prev) => [...prev, newCustomer])
  }, [customers])

  const prepareFood = useCallback(
    (foodType: FoodType) => {
      const food = FOODS.find((f) => f.type === foodType)
      if (!food || money < food.price || preparing.has(foodType)) return

      setMoney((prev) => prev - food.price)
      setPreparing((prev) => new Set(prev).add(foodType))

      setTimeout(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        setReadyFood((prev) => [
          ...prev,
          {
            type: foodType,
            x: canvas.width / 2 + (prev.length - 1.5) * 100,
            y: canvas.height - 140,
            scale: 1,
            pulse: 0,
          },
        ])
        setPreparing((prev) => {
          const next = new Set(prev)
          next.delete(foodType)
          return next
        })
        addParticles(canvas.width / 2, canvas.height - 140, food.color, 15)
      }, food.time)
    },
    [money, preparing, addParticles]
  )

  const serveFood = useCallback(
    (customer: Customer) => {
      if (!selectedFood || customer.order !== selectedFood) return

      const foodIndex = readyFood.findIndex((f) => f.type === selectedFood)
      if (foodIndex === -1) return

      const food = FOODS.find((f) => f.type === selectedFood)
      if (!food) return

      setReadyFood((prev) => prev.filter((_, i) => i !== foodIndex))

      const patiencePercent = customer.patience / customer.maxPatience
      const baseTip = Math.floor(food.price * patiencePercent * 2)
      const comboBonus = combo * 2
      const vipBonus = customer.isVIP ? 10 : 0
      const tip = baseTip + comboBonus + vipBonus
      const totalEarned = food.price + tip

      setMoney((prev) => prev + totalEarned)

      const comboMultiplier = 1 + combo * 0.1
      const scoreGain = Math.floor(customer.satisfaction * comboMultiplier * (customer.isVIP ? 2 : 1))
      setScore((prev) => prev + scoreGain)

      setCombo((prev) => prev + 1)
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
      comboTimerRef.current = setTimeout(() => setCombo(0), 3000)

      addParticles(customer.x, customer.y, customer.isVIP ? '#FFD700' : '#10B981', 30)

      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, state: 'leaving' as const } : c))
      )

      setTimeout(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
      }, 1000)

      setSelectedFood(null)
    },
    [selectedFood, readyFood, combo, addParticles]
  )

  // Game loop
  useEffect(() => {
    if (!isPlaying || isPaused) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const render = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Clear canvas
      ctx.fillStyle = '#E8D4B8'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw floor pattern
      ctx.save()
      ctx.globalAlpha = 0.15
      const tileSize = 60
      for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
          ctx.fillStyle = (x / tileSize + y / tileSize) % 2 === 0 ? '#A0826B' : '#8B6F47'
          ctx.fillRect(x, y, tileSize, tileSize)
        }
      }
      ctx.restore()

      // Draw counter
      ctx.fillStyle = '#5D4E37'
      ctx.fillRect(0, canvas.height - 120, canvas.width, 120)
      ctx.fillStyle = '#6D5E47'
      ctx.fillRect(0, canvas.height - 120, canvas.width, 4)

      // Draw tables
      TABLES.forEach((table) => {
        ctx.save()
        ctx.translate(table.x, table.y)

        // Chair
        ctx.fillStyle = '#5D4E37'
        roundRect(ctx, -50, 5, 25, 35, 4)
        ctx.fillStyle = '#6D5E47'
        roundRect(ctx, -50, 5, 25, 10, 4)

        // Table shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.beginPath()
        ctx.ellipse(0, 45, 40, 10, 0, 0, Math.PI * 2)
        ctx.fill()

        // Table
        ctx.fillStyle = '#5D4E37'
        roundRect(ctx, -45, -15, 90, 50, 12)
        ctx.strokeStyle = '#4D3E27'
        ctx.lineWidth = 3
        ctx.strokeRect(-40, -10, 80, 40)

        ctx.restore()
      })

      // Update and draw customers
      setCustomers((prev) =>
        prev.map((customer) => {
          let updated = { ...customer }

          if (customer.state === 'entering') {
            updated.x += 4
            if (updated.x >= customer.targetX) {
              updated.x = customer.targetX
              updated.state = 'waiting'
            }
          } else if (customer.state === 'waiting') {
            updated.patience -= deltaTime
            updated.satisfaction = (updated.patience / updated.maxPatience) * 100
            updated.rotation = Math.sin(timestamp / 500) * 0.05

            if (updated.patience <= 0) {
              updated.state = 'leaving'
              updated.satisfaction = 0
            }
          } else if (customer.state === 'leaving') {
            updated.x -= 4
          }

          // Draw customer
          ctx.save()
          ctx.translate(updated.x, updated.y)
          ctx.rotate(updated.rotation)
          ctx.scale(updated.scale, updated.scale)

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.beginPath()
          ctx.ellipse(0, 40, 30, 8, 0, 0, Math.PI * 2)
          ctx.fill()

          // VIP crown
          if (updated.isVIP) {
            ctx.save()
            ctx.translate(0, -55)
            ctx.fillStyle = '#FFD700'
            ctx.font = 'bold 24px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('👑', 0, 0)
            ctx.restore()
          }

          // Body
          ctx.fillStyle = updated.shirtColor
          ctx.beginPath()
          ctx.ellipse(0, 10, 22, 30, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
          ctx.fillRect(-15, 0, 30, 2)

          // Head
          ctx.fillStyle = updated.skinColor
          ctx.beginPath()
          ctx.arc(0, -20, 18, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2
          ctx.stroke()

          // Eyes
          ctx.fillStyle = '#000'
          ctx.beginPath()
          ctx.arc(-6, -22, 2, 0, Math.PI * 2)
          ctx.arc(6, -22, 2, 0, Math.PI * 2)
          ctx.fill()

          // Smile
          if (updated.satisfaction > 30) {
            ctx.strokeStyle = '#000'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(0, -15, 6, 0, Math.PI, false)
            ctx.stroke()
          }

          // Order bubble
          if (updated.state === 'waiting') {
            const foodData = FOODS.find((f) => f.type === updated.order)
            if (foodData) {
              ctx.save()
              ctx.translate(35, -30)
              ctx.fillStyle = 'white'
              roundRect(ctx, -20, -20, 40, 40, 8)
              ctx.font = '28px Arial'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(foodData.emoji, 0, 0)
              ctx.restore()

              // Patience bar
              ctx.save()
              ctx.translate(0, 50)
              const barWidth = 60
              const barHeight = 6
              ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
              roundRect(ctx, -barWidth / 2, 0, barWidth, barHeight, barHeight / 2)
              const patiencePercent = Math.max(0, updated.patience / updated.maxPatience)
              const barColor = patiencePercent > 0.6 ? '#10B981' : patiencePercent > 0.3 ? '#F59E0B' : '#EF4444'
              ctx.fillStyle = barColor
              roundRect(ctx, -barWidth / 2, 0, barWidth * patiencePercent, barHeight, barHeight / 2)
              ctx.restore()
            }
          }

          // Happy particles
          if (updated.state === 'leaving' && updated.satisfaction > 0) {
            ctx.save()
            ctx.translate(0, -45)
            ctx.font = '20px Arial'
            ctx.textAlign = 'center'
            const offset = Math.sin(timestamp / 100) * 5
            ctx.fillText('❤️', -10 + offset, 0)
            ctx.fillText('⭐', 10 - offset, 0)
            ctx.restore()
          }

          ctx.restore()

          return updated
        })
      )

      // Update and draw ready food
      setReadyFood((prev) =>
        prev.map((food, index) => {
          const isSelected = selectedFood === food.type
          const targetScale = isSelected ? 1.3 : 1
          food.scale += (targetScale - food.scale) * 0.1
          food.pulse += 0.1

          ctx.save()
          ctx.translate(food.x, food.y)
          ctx.scale(food.scale, food.scale)

          if (isSelected) {
            ctx.save()
            ctx.globalAlpha = 0.3 + Math.sin(food.pulse) * 0.2
            ctx.fillStyle = '#F59E0B'
            ctx.beginPath()
            ctx.arc(0, 0, 45, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }

          const foodData = FOODS.find((f) => f.type === food.type)
          if (foodData) {
            ctx.fillStyle = foodData.color
            ctx.beginPath()
            ctx.arc(0, 0, 35, 0, Math.PI * 2)
            ctx.fill()

            ctx.font = 'bold 40px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(foodData.emoji, 0, 0)

            if (isSelected) {
              ctx.save()
              ctx.translate(25, -25)
              ctx.fillStyle = '#F59E0B'
              ctx.font = 'bold 24px Arial'
              ctx.fillText('⚡', 0, 0)
              ctx.restore()
            }
          }

          ctx.restore()

          return food
        })
      )

      // Update and draw particles
      setParticles((prev) =>
        prev
          .map((particle) => {
            particle.x += particle.vx
            particle.y += particle.vy
            particle.vy += 0.2 // gravity
            particle.life -= 0.016

            if (particle.life > 0) {
              ctx.save()
              ctx.globalAlpha = particle.life
              ctx.fillStyle = particle.color
              ctx.beginPath()
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
              ctx.fill()
              ctx.restore()
            }

            return particle
          })
          .filter((p) => p.life > 0)
      )

      // Spawn customers
      if (timestamp - lastCustomerTimeRef.current > Math.max(3000, 5000 - level * 200)) {
        spawnCustomer()
        lastCustomerTimeRef.current = timestamp
      }

      // Level up
      const newLevel = Math.floor(score / 500) + 1
      if (newLevel > level) {
        setLevel(newLevel)
        addParticles(canvas.width / 2, canvas.height / 2, '#FFD700', 50)
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    animationFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, isPaused, customers, readyFood, selectedFood, particles, level, score, spawnCustomer, addParticles])

  // Canvas click handler
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isPlaying || isPaused) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check food clicks
      readyFood.forEach((food) => {
        const dx = x - food.x
        const dy = y - food.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 35) {
          setSelectedFood((prev) => (prev === food.type ? null : food.type))
        }
      })

      // Check customer clicks
      if (selectedFood) {
        customers.forEach((customer) => {
          if (customer.state === 'waiting') {
            const dx = x - customer.x
            const dy = y - customer.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 40) {
              serveFood(customer)
            }
          }
        })
      }
    },
    [isPlaying, isPaused, readyFood, customers, selectedFood, serveFood]
  )

  // Helper function for rounded rectangles
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fill()
  }

  return (
    <div ref={gameContainerRef} className="relative flex min-h-screen items-center justify-center bg-[#1a1a1a] p-4">
      {/* Game Container */}
      <div className="relative w-full max-w-5xl">
        {/* Top HUD */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#2a2a2a] px-6 py-4 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Money</div>
                <div className="text-xl font-black text-white">${money}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A78BFA]">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Score</div>
                <div className="text-xl font-black text-white">{score}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F59E0B]">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Combo</div>
                <div className="text-xl font-black text-white">{combo > 0 ? `${combo}x` : '-'}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying && (
              <>
                <button
                  onClick={togglePause}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3a3a3a] text-white transition-all hover:bg-[#4a4a4a] hover:scale-105"
                >
                  {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                </button>
                <button
                  onClick={resetGame}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3a3a3a] text-white transition-all hover:bg-[#4a4a4a] hover:scale-105"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3a3a3a] text-white transition-all hover:bg-[#4a4a4a] hover:scale-105"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3a3a3a] text-white transition-all hover:bg-[#4a4a4a] hover:scale-105"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Game Canvas */}
        {isPlaying ? (
          <>
            <canvas
              ref={canvasRef}
              width={900}
              height={600}
              onClick={handleCanvasClick}
              className="w-full cursor-pointer rounded-2xl shadow-2xl"
              style={{ imageRendering: 'crisp-edges' }}
            />

            {/* Kitchen Controls */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              {FOODS.map((food) => {
                const canAfford = money >= food.price
                const isPreparingFood = preparing.has(food.type)

                return (
                  <button
                    key={food.type}
                    onClick={() => prepareFood(food.type)}
                    disabled={!canAfford || isPreparingFood}
                    className={`group relative overflow-hidden rounded-xl p-4 transition-all ${
                      isPreparingFood
                        ? 'bg-[#F59E0B] shadow-lg'
                        : canAfford
                          ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] hover:scale-105 shadow-lg'
                          : 'cursor-not-allowed bg-[#1a1a1a] opacity-40'
                    }`}
                  >
                    {isPreparingFood && <div className="absolute inset-0 animate-pulse bg-white/10" />}
                    <div className="relative">
                      <div className="mb-2 text-center text-5xl">{food.emoji}</div>
                      <div className="mb-1 text-center text-sm font-bold text-white">{food.name}</div>
                      <div className="flex items-center justify-center gap-1 rounded-full bg-[#10B981] px-2 py-1">
                        <span className="text-xs font-bold text-white">${food.price}</span>
                      </div>
                      {isPreparingFood && (
                        <div className="mt-2 text-center text-xs font-bold text-white">Cooking...</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          // Start Screen
          <div className="rounded-3xl bg-[#2a2a2a] p-16 text-center shadow-2xl">
            <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
              <div className="absolute inset-0 animate-pulse rounded-full bg-[#F59E0B]/20" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[#F59E0B] text-6xl shadow-2xl">
                ☕
              </div>
            </div>

            <h1 className="mb-4 text-6xl font-black text-white">Café Tycoon</h1>
            <p className="mx-auto mb-8 max-w-lg text-xl text-gray-400">
              Build your café empire! Serve customers fast and master the combo system.
            </p>

            {highScore > 0 && (
              <div className="mx-auto mb-8 flex max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#3a3a3a] p-4">
                <Trophy className="h-6 w-6 text-[#FFD700]" />
                <span className="text-2xl font-black text-white">Best: {highScore}</span>
              </div>
            )}

            <button
              onClick={startGame}
              className="group flex items-center gap-3 rounded-2xl bg-[#10B981] px-20 py-8 font-black text-white shadow-2xl transition-all hover:scale-105 hover:bg-[#059669]"
            >
              <Play className="h-8 w-8" />
              <span className="text-3xl">Start Game</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
