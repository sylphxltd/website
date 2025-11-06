'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type FoodType = 'coffee' | 'cookie' | 'pizza' | 'icecream'
type GameState = 'menu' | 'playing' | 'paused'

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
  color: string
  size: number
}

interface Button {
  x: number
  y: number
  width: number
  height: number
  label: string
  icon?: string
  action: () => void
  color: string
  enabled?: boolean
}

const FOODS = [
  { type: 'coffee' as FoodType, name: 'Coffee', price: 5, time: 2000, emoji: '☕', color: '#8B4513' },
  { type: 'cookie' as FoodType, name: 'Cookie', price: 3, time: 1500, emoji: '🍪', color: '#CD853F' },
  { type: 'pizza' as FoodType, name: 'Pizza', price: 10, time: 3000, emoji: '🍕', color: '#FF6347' },
  { type: 'icecream' as FoodType, name: 'Ice Cream', price: 7, time: 2500, emoji: '🍦', color: '#FF69B4' },
]

const SKIN_COLORS = ['#FFE0BD', '#F1C27D', '#C68642', '#8D5524', '#E0AC69', '#F4C2A0']
const SHIRT_COLORS = ['#FF6B9D', '#4169E1', '#32CD32', '#FFD700', '#9370DB', '#FF4500']

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>('menu')
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
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number>(0)
  const customerIdRef = useRef(0)
  const lastCustomerTimeRef = useRef(0)
  const comboTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const tablesRef = useRef<Array<{ x: number; y: number }>>([])
  const kitchenButtonsRef = useRef<Button[]>([])
  const hudButtonsRef = useRef<Button[]>([])

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem('cafe-highscore')
    if (saved) setHighScore(parseInt(saved, 10))

    const handleResize = () => {
      const container = containerRef.current
      if (!container) return

      const width = container.clientWidth
      const height = container.clientHeight
      setCanvasSize({ width, height })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update table positions based on canvas size
  useEffect(() => {
    const cols = 3
    const rows = 2
    const padding = 100
    const spaceX = (canvasSize.width - padding * 2) / (cols - 1)
    const spaceY = (canvasSize.height * 0.6 - padding) / (rows - 1)

    tablesRef.current = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        tablesRef.current.push({
          x: padding + col * spaceX,
          y: padding + row * spaceY,
        })
      }
    }
  }, [canvasSize])

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
        color,
        size: 3 + Math.random() * 4,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  const startGame = useCallback(() => {
    setGameState('playing')
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

  const togglePause = useCallback(() => {
    setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'))
  }, [])

  const quitGame = useCallback(() => {
    setGameState('menu')
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('cafe-highscore', score.toString())
    }
  }, [score, highScore])

  const spawnCustomer = useCallback(() => {
    const availableTables = tablesRef.current.filter(
      (_, index) => !customers.some((c) => c.tableIndex === index && c.state !== 'leaving')
    )
    if (availableTables.length === 0) return

    const tableIndex = tablesRef.current.findIndex(
      (t) => t === availableTables[Math.floor(Math.random() * availableTables.length)]
    )
    const table = tablesRef.current[tableIndex]
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
        setReadyFood((prev) => [
          ...prev,
          {
            type: foodType,
            x: canvasSize.width / 2 + (prev.length - 1.5) * 80,
            y: canvasSize.height - 100,
            scale: 1,
            pulse: 0,
          },
        ])
        setPreparing((prev) => {
          const next = new Set(prev)
          next.delete(foodType)
          return next
        })
        addParticles(canvasSize.width / 2, canvasSize.height - 100, food.color, 15)
      }, food.time)
    },
    [money, preparing, canvasSize, addParticles]
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

      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, state: 'leaving' as const } : c)))

      setTimeout(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
      }, 1000)

      setSelectedFood(null)
    },
    [selectedFood, readyFood, combo, addParticles]
  )

  // Render and game loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const render = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Clear
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (gameState === 'menu') {
        // Menu screen
        ctx.save()

        // Title
        ctx.fillStyle = '#F59E0B'
        ctx.font = 'bold 72px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('☕', canvas.width / 2, canvas.height / 2 - 100)

        ctx.fillStyle = 'white'
        ctx.font = 'bold 48px Arial'
        ctx.fillText('Café Tycoon', canvas.width / 2, canvas.height / 2)

        ctx.fillStyle = '#999'
        ctx.font = '20px Arial'
        ctx.fillText('Build your café empire!', canvas.width / 2, canvas.height / 2 + 50)

        if (highScore > 0) {
          ctx.fillStyle = '#FFD700'
          ctx.font = 'bold 24px Arial'
          ctx.fillText(`🏆 Best: ${highScore}`, canvas.width / 2, canvas.height / 2 + 100)
        }

        // Start button
        const btnWidth = 300
        const btnHeight = 80
        const btnX = canvas.width / 2 - btnWidth / 2
        const btnY = canvas.height / 2 + 150

        ctx.fillStyle = '#10B981'
        roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 16)

        ctx.fillStyle = 'white'
        ctx.font = 'bold 32px Arial'
        ctx.fillText('▶ Start Game', canvas.width / 2, btnY + btnHeight / 2)

        ctx.restore()
      } else if (gameState === 'playing' || gameState === 'paused') {
        // Game background
        ctx.fillStyle = '#E8D4B8'
        const gameHeight = canvas.height - 200
        ctx.fillRect(0, 80, canvas.width, gameHeight)

        // Floor pattern
        ctx.save()
        ctx.globalAlpha = 0.15
        const tileSize = 60
        for (let y = 80; y < 80 + gameHeight; y += tileSize) {
          for (let x = 0; x < canvas.width; x += tileSize) {
            ctx.fillStyle = (x / tileSize + y / tileSize) % 2 === 0 ? '#A0826B' : '#8B6F47'
            ctx.fillRect(x, y, tileSize, tileSize)
          }
        }
        ctx.restore()

        // Counter
        ctx.fillStyle = '#5D4E37'
        ctx.fillRect(0, canvas.height - 180, canvas.width, 180)
        ctx.fillStyle = '#6D5E47'
        ctx.fillRect(0, canvas.height - 180, canvas.width, 4)

        // Tables
        tablesRef.current.forEach((table) => {
          ctx.save()
          ctx.translate(table.x, table.y + 80)

          // Chair
          ctx.fillStyle = '#5D4E37'
          roundRect(ctx, -40, 5, 20, 30, 4)

          // Table shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
          ctx.beginPath()
          ctx.ellipse(0, 35, 35, 8, 0, 0, Math.PI * 2)
          ctx.fill()

          // Table
          ctx.fillStyle = '#5D4E37'
          roundRect(ctx, -35, -12, 70, 40, 10)
          ctx.strokeStyle = '#4D3E27'
          ctx.lineWidth = 2
          ctx.strokeRect(-30, -8, 60, 32)

          ctx.restore()
        })

        // Update and draw customers
        if (gameState === 'playing') {
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

              return updated
            })
          )
        }

        customers.forEach((customer) => {
          ctx.save()
          ctx.translate(customer.x, customer.y + 80)
          ctx.rotate(customer.rotation)
          ctx.scale(customer.scale, customer.scale)

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.beginPath()
          ctx.ellipse(0, 35, 25, 6, 0, 0, Math.PI * 2)
          ctx.fill()

          // VIP crown
          if (customer.isVIP) {
            ctx.font = '20px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('👑', 0, -45)
          }

          // Body
          ctx.fillStyle = customer.shirtColor
          ctx.beginPath()
          ctx.ellipse(0, 8, 18, 25, 0, 0, Math.PI * 2)
          ctx.fill()

          // Head
          ctx.fillStyle = customer.skinColor
          ctx.beginPath()
          ctx.arc(0, -18, 15, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2
          ctx.stroke()

          // Eyes
          ctx.fillStyle = '#000'
          ctx.beginPath()
          ctx.arc(-5, -20, 1.5, 0, Math.PI * 2)
          ctx.arc(5, -20, 1.5, 0, Math.PI * 2)
          ctx.fill()

          // Order bubble
          if (customer.state === 'waiting') {
            const foodData = FOODS.find((f) => f.type === customer.order)
            if (foodData) {
              ctx.save()
              ctx.translate(28, -25)
              ctx.fillStyle = 'white'
              roundRect(ctx, -16, -16, 32, 32, 6)
              ctx.font = '24px Arial'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(foodData.emoji, 0, 0)
              ctx.restore()

              // Patience bar
              const barWidth = 50
              const barHeight = 5
              ctx.translate(0, 42)
              ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
              roundRect(ctx, -barWidth / 2, 0, barWidth, barHeight, barHeight / 2)
              const patiencePercent = Math.max(0, customer.patience / customer.maxPatience)
              const barColor = patiencePercent > 0.6 ? '#10B981' : patiencePercent > 0.3 ? '#F59E0B' : '#EF4444'
              ctx.fillStyle = barColor
              roundRect(ctx, -barWidth / 2, 0, barWidth * patiencePercent, barHeight, barHeight / 2)
            }
          }

          if (customer.state === 'leaving' && customer.satisfaction > 0) {
            ctx.font = '16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('❤️', -8, -40)
            ctx.fillText('⭐', 8, -40)
          }

          ctx.restore()
        })

        // Update and draw ready food
        readyFood.forEach((food) => {
          const isSelected = selectedFood === food.type
          const targetScale = isSelected ? 1.2 : 1
          food.scale += (targetScale - food.scale) * 0.1
          food.pulse += 0.1

          ctx.save()
          ctx.translate(food.x, food.y)
          ctx.scale(food.scale, food.scale)

          if (isSelected) {
            ctx.globalAlpha = 0.3 + Math.sin(food.pulse) * 0.2
            ctx.fillStyle = '#F59E0B'
            ctx.beginPath()
            ctx.arc(0, 0, 40, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1
          }

          const foodData = FOODS.find((f) => f.type === food.type)
          if (foodData) {
            ctx.fillStyle = foodData.color
            ctx.beginPath()
            ctx.arc(0, 0, 30, 0, Math.PI * 2)
            ctx.fill()

            ctx.font = 'bold 32px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(foodData.emoji, 0, 0)

            if (isSelected) {
              ctx.font = 'bold 20px Arial'
              ctx.fillText('⚡', 20, -20)
            }
          }

          ctx.restore()
        })

        // Particles
        if (gameState === 'playing') {
          setParticles((prev) =>
            prev
              .map((particle) => {
                particle.x += particle.vx
                particle.y += particle.vy
                particle.vy += 0.2
                particle.life -= 0.016

                if (particle.life > 0) {
                  ctx.save()
                  ctx.globalAlpha = particle.life
                  ctx.fillStyle = particle.color
                  ctx.beginPath()
                  ctx.arc(particle.x, particle.y + 80, particle.size, 0, Math.PI * 2)
                  ctx.fill()
                  ctx.restore()
                }

                return particle
              })
              .filter((p) => p.life > 0)
          )
        }

        // Top HUD
        ctx.fillStyle = 'rgba(26, 26, 26, 0.95)'
        ctx.fillRect(0, 0, canvas.width, 80)

        // Stats
        const statsY = 40
        const statSpacing = canvas.width / 5

        // Money
        ctx.fillStyle = '#10B981'
        ctx.font = 'bold 28px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('💰', statSpacing, statsY - 5)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 20px Arial'
        ctx.fillText(`$${money}`, statSpacing, statsY + 20)

        // Score
        ctx.fillStyle = '#A78BFA'
        ctx.font = 'bold 28px Arial'
        ctx.fillText('⭐', statSpacing * 2, statsY - 5)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 20px Arial'
        ctx.fillText(`${score}`, statSpacing * 2, statsY + 20)

        // Level
        ctx.fillStyle = '#F59E0B'
        ctx.font = 'bold 28px Arial'
        ctx.fillText('🏆', statSpacing * 3, statsY - 5)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 20px Arial'
        ctx.fillText(`Lv.${level}`, statSpacing * 3, statsY + 20)

        // Combo
        ctx.fillStyle = combo > 0 ? '#F59E0B' : '#666'
        ctx.font = 'bold 28px Arial'
        ctx.fillText('🔥', statSpacing * 4, statsY - 5)
        ctx.fillStyle = combo > 0 ? 'white' : '#666'
        ctx.font = 'bold 20px Arial'
        ctx.fillText(combo > 0 ? `${combo}x` : '-', statSpacing * 4, statsY + 20)

        // Buttons (top right)
        hudButtonsRef.current = []
        const btnSize = 50
        const btnMargin = 10
        let btnX = canvas.width - btnSize - btnMargin

        // Quit button
        ctx.fillStyle = '#EF4444'
        roundRect(ctx, btnX, 15, btnSize, btnSize, 12)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 32px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('×', btnX + btnSize / 2, 40)
        hudButtonsRef.current.push({
          x: btnX,
          y: 15,
          width: btnSize,
          height: btnSize,
          label: 'quit',
          action: quitGame,
          color: '#EF4444',
        })

        btnX -= btnSize + btnMargin

        // Pause button
        ctx.fillStyle = '#F59E0B'
        roundRect(ctx, btnX, 15, btnSize, btnSize, 12)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 28px Arial'
        ctx.fillText(gameState === 'paused' ? '▶' : '⏸', btnX + btnSize / 2, 40)
        hudButtonsRef.current.push({
          x: btnX,
          y: 15,
          width: btnSize,
          height: btnSize,
          label: 'pause',
          action: togglePause,
          color: '#F59E0B',
        })

        // Kitchen buttons
        ctx.fillStyle = 'rgba(26, 26, 26, 0.95)'
        ctx.fillRect(0, canvas.height - 120, canvas.width, 120)

        kitchenButtonsRef.current = []
        const btnWidth = Math.min(150, (canvas.width - 80) / 4)
        const btnHeight = 100
        const totalWidth = btnWidth * 4 + 30
        const startX = (canvas.width - totalWidth) / 2

        FOODS.forEach((food, index) => {
          const x = startX + index * (btnWidth + 10)
          const y = canvas.height - 110
          const canAfford = money >= food.price
          const isPreparingFood = preparing.has(food.type)

          ctx.fillStyle = isPreparingFood ? '#F59E0B' : canAfford ? '#2a2a2a' : '#1a1a1a'
          roundRect(ctx, x, y, btnWidth, btnHeight, 12)

          if (isPreparingFood) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
            roundRect(ctx, x, y, btnWidth, btnHeight, 12)
          }

          ctx.font = '48px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(food.emoji, x + btnWidth / 2, y + 30)

          ctx.fillStyle = canAfford || isPreparingFood ? 'white' : '#666'
          ctx.font = 'bold 14px Arial'
          ctx.fillText(food.name, x + btnWidth / 2, y + 65)

          ctx.fillStyle = '#10B981'
          ctx.font = 'bold 12px Arial'
          ctx.fillText(`$${food.price}`, x + btnWidth / 2, y + 82)

          if (isPreparingFood) {
            ctx.fillStyle = 'white'
            ctx.font = 'bold 10px Arial'
            ctx.fillText('Cooking...', x + btnWidth / 2, y + 95)
          }

          kitchenButtonsRef.current.push({
            x,
            y,
            width: btnWidth,
            height: btnHeight,
            label: food.name,
            action: () => prepareFood(food.type),
            color: food.color,
            enabled: canAfford && !isPreparingFood,
          })
        })

        // Paused overlay
        if (gameState === 'paused') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          ctx.fillStyle = 'white'
          ctx.font = 'bold 48px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('⏸ PAUSED', canvas.width / 2, canvas.height / 2)

          ctx.font = '24px Arial'
          ctx.fillStyle = '#999'
          ctx.fillText('Click pause button to resume', canvas.width / 2, canvas.height / 2 + 50)
        }
      }

      // Spawn customers
      if (gameState === 'playing' && timestamp - lastCustomerTimeRef.current > Math.max(3000, 5000 - level * 200)) {
        spawnCustomer()
        lastCustomerTimeRef.current = timestamp
      }

      // Level up
      if (gameState === 'playing') {
        const newLevel = Math.floor(score / 500) + 1
        if (newLevel > level) {
          setLevel(newLevel)
          addParticles(canvas.width / 2, canvas.height / 2, '#FFD700', 50)
        }
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    animationFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    gameState,
    money,
    score,
    level,
    combo,
    customers,
    readyFood,
    selectedFood,
    particles,
    preparing,
    canvasSize,
    highScore,
    spawnCustomer,
    addParticles,
    prepareFood,
    togglePause,
    quitGame,
  ])

  // Canvas click handler
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      if (gameState === 'menu') {
        // Start button
        const btnWidth = 300
        const btnHeight = 80
        const btnX = canvas.width / 2 - btnWidth / 2
        const btnY = canvas.height / 2 + 150

        if (x >= btnX && x <= btnX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
          startGame()
        }
      } else if (gameState === 'playing' || gameState === 'paused') {
        // HUD buttons
        for (const btn of hudButtonsRef.current) {
          if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
            btn.action()
            return
          }
        }

        if (gameState === 'paused') return

        // Kitchen buttons
        for (const btn of kitchenButtonsRef.current) {
          if (btn.enabled !== false && x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
            btn.action()
            return
          }
        }

        // Food selection
        for (const food of readyFood) {
          const dx = x - food.x
          const dy = y - (food.y)
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 30) {
            setSelectedFood((prev) => (prev === food.type ? null : food.type))
            return
          }
        }

        // Customer click
        if (selectedFood) {
          for (const customer of customers) {
            if (customer.state === 'waiting') {
              const dx = x - customer.x
              const dy = y - (customer.y + 80)
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 35) {
                serveFood(customer)
                return
              }
            }
          }
        }
      }
    },
    [gameState, customers, readyFood, selectedFood, startGame, serveFood, canvasSize]
  )

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
    <div ref={containerRef} className="fixed inset-0 bg-[#1a1a1a]">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        className="h-full w-full cursor-pointer"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  )
}
