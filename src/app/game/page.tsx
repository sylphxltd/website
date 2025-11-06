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

interface FloatingText {
  x: number
  y: number
  text: string
  life: number
  color: string
  scale: number
}

const FOODS = [
  { type: 'coffee' as FoodType, name: 'Coffee', price: 5, time: 2000, emoji: '☕', color: '#6F4E37', gradient: ['#8B6F47', '#6F4E37'] },
  { type: 'cookie' as FoodType, name: 'Cookie', price: 3, time: 1500, emoji: '🍪', color: '#D2691E', gradient: ['#DEB887', '#D2691E'] },
  { type: 'pizza' as FoodType, name: 'Pizza', price: 10, time: 3000, emoji: '🍕', color: '#FF6347', gradient: ['#FF7F50', '#FF6347'] },
  { type: 'icecream' as FoodType, name: 'Ice Cream', price: 7, time: 2500, emoji: '🍦', color: '#FFB6C1', gradient: ['#FFC0CB', '#FFB6C1'] },
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
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [preparing, setPreparing] = useState<Set<FoodType>>(new Set())
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

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
  const menuButtonRef = useRef<Button | null>(null)

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
    const padding = 120
    const spaceX = (canvasSize.width - padding * 2) / (cols - 1)
    const spaceY = (canvasSize.height * 0.55 - padding) / (rows - 1)

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

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    setFloatingTexts((prev) => [
      ...prev,
      {
        x,
        y,
        text,
        life: 1,
        color,
        scale: 0.5,
      },
    ])
  }, [])

  const addParticles = useCallback((x: number, y: number, color: string, count: number = 20) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const speed = 2 + Math.random() * 4
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        color,
        size: 4 + Math.random() * 6,
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
    setFloatingTexts([])
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
            x: canvasSize.width / 2 + (prev.length - 1.5) * 90,
            y: canvasSize.height - 120,
            scale: 0,
            pulse: 0,
          },
        ])
        setPreparing((prev) => {
          const next = new Set(prev)
          next.delete(foodType)
          return next
        })
        addParticles(canvasSize.width / 2, canvasSize.height - 120, food.gradient[0] ?? food.color, 20)
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

      addParticles(customer.x, customer.y + 80, customer.isVIP ? '#FFD700' : '#10B981', 40)
      addFloatingText(customer.x, customer.y + 50, `+$${totalEarned}`, '#10B981')
      addFloatingText(customer.x + 40, customer.y + 50, `+${scoreGain}`, '#F59E0B')

      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, state: 'leaving' as const } : c)))

      setTimeout(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
      }, 1000)

      setSelectedFood(null)
    },
    [selectedFood, readyFood, combo, addParticles, addFloatingText]
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
      ctx.fillStyle = '#0f0f0f'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (gameState === 'menu') {
        // Animated background
        ctx.save()
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2
        )
        gradient.addColorStop(0, '#1a1a2e')
        gradient.addColorStop(1, '#0f0f0f')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Floating particles
        for (let i = 0; i < 50; i++) {
          const x = (i * canvas.width) / 50
          const y = ((Math.sin(timestamp / 1000 + i) * 0.5 + 0.5) * canvas.height) / 2
          ctx.fillStyle = `rgba(139, 111, 71, ${0.1 + Math.sin(timestamp / 500 + i) * 0.05})`
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()

        // Title card with glassmorphism
        ctx.save()
        const cardWidth = Math.min(500, canvas.width - 80)
        const cardHeight = 600
        const cardX = canvas.width / 2 - cardWidth / 2
        const cardY = canvas.height / 2 - cardHeight / 2

        // Card shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 40
        ctx.shadowOffsetY = 20

        // Card background with gradient
        const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight)
        cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
        cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)')
        ctx.fillStyle = cardGradient
        roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 24)

        // Card border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 2
        ctx.strokeRect(cardX + 1, cardY + 1, cardWidth - 2, cardHeight - 2)

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0
        ctx.restore()

        // Icon with glow
        ctx.save()
        ctx.shadowColor = '#F59E0B'
        ctx.shadowBlur = 30
        ctx.font = 'bold 120px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('☕', canvas.width / 2, canvas.height / 2 - 150)
        ctx.restore()

        // Title with gradient
        const titleGradient = ctx.createLinearGradient(
          canvas.width / 2 - 200,
          canvas.height / 2 - 50,
          canvas.width / 2 + 200,
          canvas.height / 2 - 50
        )
        titleGradient.addColorStop(0, '#F59E0B')
        titleGradient.addColorStop(0.5, '#FCD34D')
        titleGradient.addColorStop(1, '#F59E0B')
        ctx.fillStyle = titleGradient
        ctx.font = 'bold 64px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Café Tycoon', canvas.width / 2, canvas.height / 2 - 40)

        // Subtitle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '24px Arial'
        ctx.fillText('Build your café empire!', canvas.width / 2, canvas.height / 2 + 20)

        // High score badge
        if (highScore > 0) {
          ctx.save()
          const badgeY = canvas.height / 2 + 70
          ctx.shadowColor = 'rgba(255, 215, 0, 0.5)'
          ctx.shadowBlur = 20
          ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'
          roundRect(ctx, canvas.width / 2 - 120, badgeY, 240, 50, 25)
          ctx.shadowBlur = 0
          ctx.fillStyle = '#FFD700'
          ctx.font = 'bold 28px Arial'
          ctx.fillText(`🏆 Best: ${highScore}`, canvas.width / 2, badgeY + 28)
          ctx.restore()
        }

        // Start button with modern design
        const btnWidth = 320
        const btnHeight = 80
        const btnX = canvas.width / 2 - btnWidth / 2
        const btnY = canvas.height / 2 + 150

        ctx.save()
        ctx.shadowColor = 'rgba(16, 185, 129, 0.5)'
        ctx.shadowBlur = 30
        ctx.shadowOffsetY = 10

        const btnGradient = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnHeight)
        btnGradient.addColorStop(0, '#10B981')
        btnGradient.addColorStop(1, '#059669')
        ctx.fillStyle = btnGradient
        roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 20)

        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        // Button highlight
        const highlightGradient = ctx.createLinearGradient(btnX, btnY, btnX, btnY + 30)
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = highlightGradient
        roundRect(ctx, btnX, btnY, btnWidth, 30, 20)

        ctx.fillStyle = 'white'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('▶ Start Game', canvas.width / 2, btnY + btnHeight / 2 + 3)
        ctx.restore()

        // Store menu button ref
        menuButtonRef.current = {
          x: btnX,
          y: btnY,
          width: btnWidth,
          height: btnHeight,
          label: 'start',
          action: startGame,
          color: '#10B981',
        }
      } else if (gameState === 'playing' || gameState === 'paused') {
        // Modern gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        bgGradient.addColorStop(0, '#2d2d2d')
        bgGradient.addColorStop(0.3, '#3a3a3a')
        bgGradient.addColorStop(1, '#1a1a1a')
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Game area with modern design
        const gameAreaY = 100
        const gameAreaHeight = canvas.height - 280

        // Game area background with texture
        ctx.save()
        const areaGradient = ctx.createLinearGradient(0, gameAreaY, 0, gameAreaY + gameAreaHeight)
        areaGradient.addColorStop(0, '#f5e6d3')
        areaGradient.addColorStop(1, '#e8d4b8')
        ctx.fillStyle = areaGradient
        ctx.fillRect(0, gameAreaY, canvas.width, gameAreaHeight)

        // Wooden floor pattern
        ctx.globalAlpha = 0.1
        const plankHeight = 50
        for (let y = gameAreaY; y < gameAreaY + gameAreaHeight; y += plankHeight) {
          ctx.fillStyle = y % (plankHeight * 2) === 0 ? '#8B7355' : '#A0826D'
          ctx.fillRect(0, y, canvas.width, plankHeight)
          ctx.strokeStyle = '#6F5C4D'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        ctx.restore()

        // Modern tables with depth
        tablesRef.current.forEach((table) => {
          ctx.save()
          ctx.translate(table.x, table.y + gameAreaY)

          // Table shadow (soft, realistic)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
          ctx.beginPath()
          ctx.ellipse(0, 40, 45, 10, 0, 0, Math.PI * 2)
          ctx.fill()

          // Chair (modern design)
          ctx.fillStyle = '#3d3d3d'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
          ctx.shadowBlur = 8
          roundRect(ctx, -45, 0, 24, 35, 6)
          ctx.shadowBlur = 0

          // Chair back
          ctx.fillStyle = '#4a4a4a'
          roundRect(ctx, -45, 0, 24, 12, 6)

          // Table top (modern round)
          const tableGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 45)
          tableGradient.addColorStop(0, '#5D4E37')
          tableGradient.addColorStop(1, '#4a3c2a')
          ctx.fillStyle = tableGradient
          ctx.beginPath()
          ctx.arc(0, 0, 45, 0, Math.PI * 2)
          ctx.fill()

          // Table highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
          ctx.beginPath()
          ctx.arc(-10, -10, 20, 0, Math.PI * 2)
          ctx.fill()

          // Table edge
          ctx.strokeStyle = '#3d2f1f'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(0, 0, 45, 0, Math.PI * 2)
          ctx.stroke()

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

        // Draw customers with modern style
        customers.forEach((customer) => {
          ctx.save()
          ctx.translate(customer.x, customer.y + gameAreaY)
          ctx.rotate(customer.rotation)
          ctx.scale(customer.scale, customer.scale)

          // Shadow (soft and realistic)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
          ctx.beginPath()
          ctx.ellipse(0, 40, 30, 8, 0, 0, Math.PI * 2)
          ctx.fill()

          // VIP glow effect
          if (customer.isVIP) {
            ctx.shadowColor = '#FFD700'
            ctx.shadowBlur = 20
          }

          // Body (with shading)
          const bodyGradient = ctx.createRadialGradient(-5, 0, 0, 0, 0, 25)
          bodyGradient.addColorStop(0, customer.shirtColor)
          bodyGradient.addColorStop(1, adjustColor(customer.shirtColor, -30))
          ctx.fillStyle = bodyGradient
          ctx.beginPath()
          ctx.ellipse(0, 8, 20, 28, 0, 0, Math.PI * 2)
          ctx.fill()

          // Head (with shading)
          const headGradient = ctx.createRadialGradient(-3, -20, 0, 0, -18, 16)
          headGradient.addColorStop(0, customer.skinColor)
          headGradient.addColorStop(1, adjustColor(customer.skinColor, -20))
          ctx.fillStyle = headGradient
          ctx.beginPath()
          ctx.arc(0, -18, 16, 0, Math.PI * 2)
          ctx.fill()

          ctx.shadowBlur = 0

          // Eyes
          ctx.fillStyle = '#000'
          ctx.beginPath()
          ctx.arc(-5, -20, 2, 0, Math.PI * 2)
          ctx.arc(5, -20, 2, 0, Math.PI * 2)
          ctx.fill()

          // Smile
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(0, -15, 5, 0.2, Math.PI - 0.2)
          ctx.stroke()

          // VIP crown with glow
          if (customer.isVIP) {
            ctx.save()
            ctx.shadowColor = '#FFD700'
            ctx.shadowBlur = 15
            ctx.font = '24px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('👑', 0, -45)
            ctx.restore()
          }

          // Order bubble (modern design)
          if (customer.state === 'waiting') {
            const foodData = FOODS.find((f) => f.type === customer.order)
            if (foodData) {
              ctx.save()
              ctx.translate(35, -30)

              // Bubble shadow
              ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
              ctx.shadowBlur = 10
              ctx.shadowOffsetY = 5

              // Bubble background
              ctx.fillStyle = 'white'
              roundRect(ctx, -20, -20, 40, 40, 10)

              ctx.shadowBlur = 0
              ctx.shadowOffsetY = 0

              // Bubble border
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
              ctx.lineWidth = 2
              ctx.strokeRect(-19, -19, 38, 38)

              // Food emoji
              ctx.font = '28px Arial'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(foodData.emoji, 0, 0)
              ctx.restore()

              // Modern patience bar
              ctx.save()
              ctx.translate(0, 48)
              const barWidth = 60
              const barHeight = 8
              const patiencePercent = Math.max(0, customer.patience / customer.maxPatience)

              // Bar background
              ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
              roundRect(ctx, -barWidth / 2, 0, barWidth, barHeight, 4)

              // Bar fill with gradient
              const barGradient = ctx.createLinearGradient(-barWidth / 2, 0, barWidth / 2, 0)
              if (patiencePercent > 0.6) {
                barGradient.addColorStop(0, '#10B981')
                barGradient.addColorStop(1, '#059669')
              } else if (patiencePercent > 0.3) {
                barGradient.addColorStop(0, '#F59E0B')
                barGradient.addColorStop(1, '#D97706')
              } else {
                barGradient.addColorStop(0, '#EF4444')
                barGradient.addColorStop(1, '#DC2626')
              }
              ctx.fillStyle = barGradient
              roundRect(ctx, -barWidth / 2, 0, barWidth * patiencePercent, barHeight, 4)

              // Bar shine
              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
              roundRect(ctx, -barWidth / 2, 0, barWidth * patiencePercent, 3, 4)
              ctx.restore()
            }
          }

          // Leaving animation
          if (customer.state === 'leaving' && customer.satisfaction > 0) {
            ctx.font = '20px Arial'
            ctx.textAlign = 'center'
            const bounce = Math.sin(timestamp / 100) * 3
            ctx.fillText('❤️', -10, -50 + bounce)
            ctx.fillText('⭐', 10, -50 - bounce)
          }

          ctx.restore()
        })

        // Update and draw ready food
        readyFood.forEach((food) => {
          const isSelected = selectedFood === food.type
          const targetScale = isSelected ? 1.3 : 1
          food.scale += (targetScale - food.scale) * 0.15
          food.pulse += 0.15

          ctx.save()
          ctx.translate(food.x, food.y)
          ctx.scale(food.scale, food.scale)

          // Selection glow
          if (isSelected) {
            ctx.shadowColor = '#F59E0B'
            ctx.shadowBlur = 30
            ctx.fillStyle = 'rgba(245, 158, 11, 0.2)'
            ctx.beginPath()
            ctx.arc(0, 0, 45, 0, Math.PI * 2)
            ctx.fill()
          }

          // Food plate shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
          ctx.shadowBlur = 15
          ctx.shadowOffsetY = 8
          ctx.fillStyle = 'white'
          ctx.beginPath()
          ctx.arc(0, 0, 35, 0, Math.PI * 2)
          ctx.fill()

          ctx.shadowBlur = 0
          ctx.shadowOffsetY = 0

          // Plate rim
          ctx.strokeStyle = '#e5e5e5'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(0, 0, 35, 0, Math.PI * 2)
          ctx.stroke()

          // Food emoji with bounce
          const bounce = Math.sin(food.pulse) * 2
          ctx.font = 'bold 36px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            FOODS.find((f) => f.type === food.type)?.emoji ?? '',
            0,
            bounce
          )

          // Selection indicator
          if (isSelected) {
            ctx.save()
            ctx.globalAlpha = 0.6 + Math.sin(food.pulse * 2) * 0.4
            ctx.fillStyle = '#F59E0B'
            ctx.font = 'bold 24px Arial'
            ctx.fillText('✓', 25, -25)
            ctx.restore()
          }

          ctx.restore()
        })

        // Floating texts
        if (gameState === 'playing') {
          setFloatingTexts((prev) =>
            prev
              .map((text) => {
                text.y -= 1.5
                text.life -= 0.015
                text.scale = Math.min(1, text.scale + 0.05)

                if (text.life > 0) {
                  ctx.save()
                  ctx.globalAlpha = text.life
                  ctx.fillStyle = text.color
                  ctx.font = `bold ${20 * text.scale}px Arial`
                  ctx.textAlign = 'center'
                  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
                  ctx.lineWidth = 3
                  ctx.strokeText(text.text, text.x, text.y + gameAreaY)
                  ctx.fillText(text.text, text.x, text.y + gameAreaY)
                  ctx.restore()
                }

                return text
              })
              .filter((t) => t.life > 0)
          )
        }

        // Particles
        if (gameState === 'playing') {
          setParticles((prev) =>
            prev
              .map((particle) => {
                particle.x += particle.vx
                particle.y += particle.vy
                particle.vy += 0.3
                particle.life -= 0.02

                if (particle.life > 0) {
                  ctx.save()
                  ctx.globalAlpha = particle.life
                  ctx.fillStyle = particle.color
                  ctx.shadowColor = particle.color
                  ctx.shadowBlur = 10
                  ctx.beginPath()
                  ctx.arc(particle.x, particle.y + gameAreaY, particle.size, 0, Math.PI * 2)
                  ctx.fill()
                  ctx.restore()
                }

                return particle
              })
              .filter((p) => p.life > 0)
          )
        }

        // Modern HUD with glassmorphism
        ctx.save()
        const hudGradient = ctx.createLinearGradient(0, 0, 0, 100)
        hudGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)')
        hudGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)')
        ctx.fillStyle = hudGradient
        ctx.fillRect(0, 0, canvas.width, 100)

        // HUD border
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.fillRect(0, 98, canvas.width, 2)
        ctx.restore()

        // Stats with modern icons and animations
        const statsY = 50
        const statCount = 4
        const statSpacing = (canvas.width - 200) / statCount

        // Money
        drawStat(ctx, statSpacing * 0.7, statsY, '💰', money.toString(), '#10B981', timestamp)

        // Score
        drawStat(ctx, statSpacing * 1.7, statsY, '⭐', score.toString(), '#A78BFA', timestamp + 500)

        // Level
        drawStat(ctx, statSpacing * 2.7, statsY, '🏆', `Lv.${level}`, '#F59E0B', timestamp + 1000)

        // Combo
        const comboColor = combo > 0 ? '#EF4444' : '#555'
        const comboText = combo > 0 ? `${combo}x` : '-'
        drawStat(ctx, statSpacing * 3.7, statsY, '🔥', comboText, comboColor, timestamp + 1500, combo > 0)

        // Modern HUD buttons
        hudButtonsRef.current = []
        const btnSize = 60
        const btnMargin = 15
        let btnX = canvas.width - btnSize - btnMargin

        // Quit button
        drawModernButton(ctx, btnX, 20, btnSize, btnSize, '×', '#EF4444', hoveredButton === 'quit')
        hudButtonsRef.current.push({
          x: btnX,
          y: 20,
          width: btnSize,
          height: btnSize,
          label: 'quit',
          action: quitGame,
          color: '#EF4444',
        })

        btnX -= btnSize + btnMargin

        // Pause button
        const pauseIcon = gameState === 'paused' ? '▶' : '⏸'
        drawModernButton(ctx, btnX, 20, btnSize, btnSize, pauseIcon, '#F59E0B', hoveredButton === 'pause')
        hudButtonsRef.current.push({
          x: btnX,
          y: 20,
          width: btnSize,
          height: btnSize,
          label: 'pause',
          action: togglePause,
          color: '#F59E0B',
        })

        // Modern kitchen area
        ctx.save()
        const kitchenY = canvas.height - 180
        const kitchenGradient = ctx.createLinearGradient(0, kitchenY, 0, canvas.height)
        kitchenGradient.addColorStop(0, 'rgba(20, 20, 20, 0.95)')
        kitchenGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)')
        ctx.fillStyle = kitchenGradient
        ctx.fillRect(0, kitchenY, canvas.width, 180)

        // Kitchen border
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.fillRect(0, kitchenY, canvas.width, 2)
        ctx.restore()

        // Kitchen buttons with modern design
        kitchenButtonsRef.current = []
        const btnWidth = Math.min(160, (canvas.width - 100) / 4)
        const btnHeight = 130
        const totalWidth = btnWidth * 4 + 45
        const startX = (canvas.width - totalWidth) / 2

        FOODS.forEach((food, index) => {
          const x = startX + index * (btnWidth + 15)
          const y = canvas.height - 160
          const canAfford = money >= food.price
          const isPreparingFood = preparing.has(food.type)
          const isHovered = hoveredButton === food.type

          ctx.save()

          // Button shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 15
          ctx.shadowOffsetY = 8

          // Button background with gradient
          const btnGradient = ctx.createLinearGradient(x, y, x, y + btnHeight)
          if (isPreparingFood) {
            btnGradient.addColorStop(0, '#F59E0B')
            btnGradient.addColorStop(1, '#D97706')
          } else if (canAfford) {
            btnGradient.addColorStop(0, '#2d2d2d')
            btnGradient.addColorStop(1, '#1a1a1a')
          } else {
            btnGradient.addColorStop(0, '#1a1a1a')
            btnGradient.addColorStop(1, '#0d0d0d')
          }
          ctx.fillStyle = btnGradient
          roundRect(ctx, x, y, btnWidth, btnHeight, 16)

          ctx.shadowBlur = 0
          ctx.shadowOffsetY = 0

          // Hover glow
          if (isHovered && canAfford && !isPreparingFood) {
            ctx.strokeStyle = food.gradient[0] ?? food.color
            ctx.lineWidth = 3
            ctx.shadowColor = food.gradient[0] ?? food.color
            ctx.shadowBlur = 20
            ctx.strokeRect(x + 1.5, y + 1.5, btnWidth - 3, btnHeight - 3)
            ctx.shadowBlur = 0
          }

          // Button border
          ctx.strokeStyle = canAfford ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'
          ctx.lineWidth = 2
          ctx.strokeRect(x + 1, y + 1, btnWidth - 2, btnHeight - 2)

          // Preparing overlay animation
          if (isPreparingFood) {
            ctx.save()
            const progress = (timestamp % food.time) / food.time
            ctx.globalAlpha = 0.3
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
            roundRect(ctx, x, y + btnHeight * (1 - progress), btnWidth, btnHeight * progress, 16)
            ctx.restore()
          }

          // Food emoji
          ctx.font = '56px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const emojiY = y + 45
          if (isPreparingFood) {
            const wobble = Math.sin(timestamp / 100) * 3
            ctx.save()
            ctx.translate(x + btnWidth / 2 + wobble, emojiY)
            ctx.rotate(Math.sin(timestamp / 200) * 0.1)
            ctx.fillText(food.emoji, 0, 0)
            ctx.restore()
          } else {
            ctx.fillText(food.emoji, x + btnWidth / 2, emojiY)
          }

          // Food name
          ctx.fillStyle = canAfford || isPreparingFood ? 'white' : '#555'
          ctx.font = 'bold 16px Arial'
          ctx.fillText(food.name, x + btnWidth / 2, y + 85)

          // Price badge
          ctx.save()
          const priceY = y + 105
          ctx.fillStyle = canAfford ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 0, 0, 0.2)'
          roundRect(ctx, x + btnWidth / 2 - 35, priceY, 70, 24, 12)
          ctx.fillStyle = canAfford ? '#10B981' : '#EF4444'
          ctx.font = 'bold 14px Arial'
          ctx.fillText(`$${food.price}`, x + btnWidth / 2, priceY + 13)
          ctx.restore()

          // Preparing label
          if (isPreparingFood) {
            ctx.fillStyle = 'white'
            ctx.font = 'bold 11px Arial'
            ctx.fillText('Cooking...', x + btnWidth / 2, y + 15)
          }

          ctx.restore()

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

        // Paused overlay with modern design
        if (gameState === 'paused') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Paused card
          ctx.save()
          const pauseCardWidth = 400
          const pauseCardHeight = 200
          const pauseCardX = canvas.width / 2 - pauseCardWidth / 2
          const pauseCardY = canvas.height / 2 - pauseCardHeight / 2

          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 40

          const pauseGradient = ctx.createLinearGradient(
            pauseCardX,
            pauseCardY,
            pauseCardX,
            pauseCardY + pauseCardHeight
          )
          pauseGradient.addColorStop(0, 'rgba(60, 60, 60, 0.95)')
          pauseGradient.addColorStop(1, 'rgba(40, 40, 40, 0.95)')
          ctx.fillStyle = pauseGradient
          roundRect(ctx, pauseCardX, pauseCardY, pauseCardWidth, pauseCardHeight, 24)

          ctx.shadowBlur = 0

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
          ctx.lineWidth = 2
          ctx.strokeRect(pauseCardX + 1, pauseCardY + 1, pauseCardWidth - 2, pauseCardHeight - 2)

          ctx.fillStyle = 'white'
          ctx.font = 'bold 48px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('⏸', canvas.width / 2, canvas.height / 2 - 20)

          ctx.font = 'bold 36px Arial'
          ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 + 30)

          ctx.font = '18px Arial'
          ctx.fillStyle = '#aaa'
          ctx.fillText('Click pause button to resume', canvas.width / 2, canvas.height / 2 + 65)

          ctx.restore()
        }
      }

      // Spawn customers
      if (
        gameState === 'playing' &&
        timestamp - lastCustomerTimeRef.current > Math.max(3000, 5000 - level * 200)
      ) {
        spawnCustomer()
        lastCustomerTimeRef.current = timestamp
      }

      // Level up
      if (gameState === 'playing') {
        const newLevel = Math.floor(score / 500) + 1
        if (newLevel > level) {
          setLevel(newLevel)
          addParticles(canvas.width / 2, canvas.height / 2, '#FFD700', 50)
          addFloatingText(canvas.width / 2, canvas.height / 2 - 100, 'LEVEL UP!', '#FFD700')
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
    floatingTexts,
    preparing,
    canvasSize,
    highScore,
    hoveredButton,
    spawnCustomer,
    addParticles,
    addFloatingText,
    prepareFood,
    togglePause,
    quitGame,
  ])

  // Canvas click and hover handler
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
        const btn = menuButtonRef.current
        if (btn && x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
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
          const dy = y - food.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 35) {
            setSelectedFood((prev) => (prev === food.type ? null : food.type))
            return
          }
        }

        // Customer click
        if (selectedFood) {
          for (const customer of customers) {
            if (customer.state === 'waiting') {
              const gameAreaY = 100
              const dx = x - customer.x
              const dy = y - (customer.y + gameAreaY)
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 40) {
                serveFood(customer)
                return
              }
            }
          }
        }
      }
    },
    [gameState, customers, readyFood, selectedFood, startGame, serveFood]
  )

  const handleCanvasMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      let newHoveredButton: string | null = null

      if (gameState === 'playing' || gameState === 'paused') {
        // Check HUD buttons
        for (const btn of hudButtonsRef.current) {
          if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
            newHoveredButton = btn.label
            break
          }
        }

        // Check kitchen buttons
        if (!newHoveredButton) {
          for (const btn of kitchenButtonsRef.current) {
            if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
              newHoveredButton = FOODS.find((f) => f.name === btn.label)?.type ?? null
              break
            }
          }
        }
      }

      setHoveredButton(newHoveredButton)
    },
    [gameState]
  )

  // Helper functions
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

  function drawStat(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    icon: string,
    value: string,
    color: string,
    timestamp: number,
    animated: boolean = false
  ) {
    ctx.save()

    // Icon with glow
    if (animated) {
      const pulse = Math.sin(timestamp / 200) * 0.5 + 0.5
      ctx.shadowColor = color
      ctx.shadowBlur = 15 + pulse * 10
    }
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(icon, x, y - 8)
    ctx.shadowBlur = 0

    // Value with modern font
    ctx.fillStyle = color
    ctx.font = 'bold 18px Arial'
    ctx.fillText(value, x, y + 20)

    ctx.restore()
  }

  function drawModernButton(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    icon: string,
    color: string,
    hovered: boolean
  ) {
    ctx.save()

    // Button shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 15
    ctx.shadowOffsetY = 5

    // Button background
    const btnGradient = ctx.createLinearGradient(x, y, x, y + h)
    btnGradient.addColorStop(0, color)
    btnGradient.addColorStop(1, adjustColor(color, -30))
    ctx.fillStyle = btnGradient
    roundRect(ctx, x, y, w, h, 14)

    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // Hover glow
    if (hovered) {
      ctx.shadowColor = color
      ctx.shadowBlur = 25
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3)
      ctx.shadowBlur = 0
    }

    // Button highlight
    const highlightGradient = ctx.createLinearGradient(x, y, x, y + h / 2)
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = highlightGradient
    roundRect(ctx, x, y, w, h / 2, 14)

    // Icon
    ctx.fillStyle = 'white'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(icon, x + w / 2, y + h / 2 + 2)

    ctx.restore()
  }

  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-[#0f0f0f]">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        className="h-full w-full cursor-pointer"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  )
}
