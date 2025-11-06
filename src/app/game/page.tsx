'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Coffee,
  Cookie,
  Pizza,
  IceCream,
  DollarSign,
  Users,
  Star,
  RotateCcw,
  Play,
  Pause,
  Heart,
  Clock,
  Zap,
  Award,
  Crown,
  Flame,
  Maximize,
  Minimize,
  X,
} from 'lucide-react'

type FoodType = 'coffee' | 'cookie' | 'pizza' | 'icecream'

interface Customer {
  id: number
  x: number
  y: number
  tableIndex: number
  order: FoodType
  patience: number
  maxPatience: number
  state: 'entering' | 'waiting' | 'eating' | 'leaving'
  satisfaction: number
  isVIP: boolean
  skinColor: string
  shirtColor: string
}

interface FoodItem {
  type: FoodType
  preparing: boolean
  ready: boolean
}

interface FloatingText {
  id: number
  text: string
  x: number
  y: number
  color: string
}

const FOODS = [
  { type: 'coffee' as FoodType, name: 'Coffee', icon: Coffee, price: 5, time: 2000, color: '#6F4E37', emoji: '☕' },
  { type: 'cookie' as FoodType, name: 'Cookie', icon: Cookie, price: 3, time: 1500, color: '#CD853F', emoji: '🍪' },
  { type: 'pizza' as FoodType, name: 'Pizza', icon: Pizza, price: 10, time: 3000, color: '#FF6347', emoji: '🍕' },
  { type: 'icecream' as FoodType, name: 'Ice Cream', icon: IceCream, price: 7, time: 2500, color: '#FF69B4', emoji: '🍦' },
]

const TABLES = [
  { x: 100, y: 180 },
  { x: 320, y: 180 },
  { x: 540, y: 180 },
  { x: 100, y: 340 },
  { x: 320, y: 340 },
  { x: 540, y: 340 },
]

const SKIN_COLORS = ['#FFE0BD', '#F1C27D', '#C68642', '#8D5524', '#E0AC69', '#F4C2A0']
const SHIRT_COLORS = ['#FF6B9D', '#4169E1', '#32CD32', '#FFD700', '#9370DB', '#FF4500']

export default function GamePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [money, setMoney] = useState(100)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [combo, setCombo] = useState(0)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [foodQueue, setFoodQueue] = useState<FoodItem[]>([])
  const [selectedFood, setSelectedFood] = useState<FoodType | null>(null)
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [totalServed, setTotalServed] = useState(0)

  const gameContainerRef = useRef<HTMLDivElement>(null)
  const nextCustomerId = useRef(0)
  const lastCustomerTime = useRef(0)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null)
  const floatingTextId = useRef(0)
  const customerDelay = Math.max(3000, 5000 - level * 200)

  useEffect(() => {
    const saved = localStorage.getItem('cafe-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
  }, [])

  useEffect(() => {
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

  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    const id = floatingTextId.current++
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }])
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id))
    }, 2000)
  }, [])

  const updateCombo = useCallback(() => {
    setCombo((prev) => prev + 1)
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
    comboTimerRef.current = setTimeout(() => setCombo(0), 3000)
  }, [])

  const startGame = useCallback(() => {
    setIsPlaying(true)
    setIsPaused(false)
    setMoney(100)
    setScore(0)
    setLevel(1)
    setCombo(0)
    setTotalServed(0)
    setCustomers([])
    setFoodQueue([])
    setFloatingTexts([])
    nextCustomerId.current = 0
    lastCustomerTime.current = Date.now()
  }, [])

  const togglePause = useCallback(() => setIsPaused((prev) => !prev), [])

  const resetGame = useCallback(() => {
    setIsPlaying(false)
    setIsPaused(false)
    setCustomers([])
    setFoodQueue([])
    setSelectedFood(null)
    setFloatingTexts([])
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('cafe-highscore', score.toString())
    }
  }, [score, highScore])

  const spawnCustomer = useCallback(() => {
    const availableTables = TABLES.map((_, i) => i).filter(
      (tableIndex) => !customers.some((c) => c.tableIndex === tableIndex && c.state !== 'leaving')
    )

    if (availableTables.length === 0) return

    const tableIndex = availableTables[Math.floor(Math.random() * availableTables.length)]
    if (tableIndex === undefined) return

    const table = TABLES[tableIndex]
    if (!table) return

    const isVIP = Math.random() < 0.15
    const basePatience = isVIP ? 20000 : 15000

    const newCustomer: Customer = {
      id: nextCustomerId.current++,
      x: -100,
      y: table.y,
      tableIndex,
      order: FOODS[Math.floor(Math.random() * FOODS.length)]?.type ?? 'coffee',
      patience: basePatience,
      maxPatience: basePatience,
      state: 'entering',
      satisfaction: 100,
      isVIP,
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)] ?? SKIN_COLORS[0] ?? '#FFE0BD',
      shirtColor: SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)] ?? SHIRT_COLORS[0] ?? '#FF6B9D',
    }

    setCustomers((prev) => [...prev, newCustomer])
  }, [customers])

  const prepareFood = useCallback(
    (foodType: FoodType) => {
      const food = FOODS.find((f) => f.type === foodType)
      if (!food || money < food.price) return

      if (foodQueue.some((f) => f.type === foodType && f.preparing)) return

      setMoney((prev) => prev - food.price)
      setFoodQueue((prev) => [...prev, { type: foodType, preparing: true, ready: false }])

      setTimeout(() => {
        setFoodQueue((prev) =>
          prev.map((f) => (f.type === foodType && f.preparing ? { ...f, preparing: false, ready: true } : f))
        )
      }, food.time)
    },
    [money, foodQueue]
  )

  const serveFood = useCallback(
    (customerId: number) => {
      if (!selectedFood) return

      const customer = customers.find((c) => c.id === customerId && c.state === 'waiting')
      if (!customer || customer.order !== selectedFood) return

      const foodInQueue = foodQueue.find((f) => f.type === selectedFood && f.ready)
      if (!foodInQueue) return

      const food = FOODS.find((f) => f.type === selectedFood)
      if (!food) return

      setFoodQueue((prev) => {
        const index = prev.findIndex((f) => f.type === selectedFood && f.ready)
        if (index === -1) return prev
        return [...prev.slice(0, index), ...prev.slice(index + 1)]
      })

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
      setTotalServed((prev) => prev + 1)

      updateCombo()

      addFloatingText(
        `+$${totalEarned}${combo > 0 ? ` x${combo + 1}` : ''}`,
        customer.x,
        customer.y - 50,
        '#10B981'
      )

      if (customer.isVIP) {
        addFloatingText('VIP!', customer.x, customer.y - 70, '#FFD700')
      }

      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, state: 'leaving' as const } : c))
      )

      setTimeout(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== customerId))
      }, 1000)

      setSelectedFood(null)
    },
    [selectedFood, customers, foodQueue, combo, updateCombo, addFloatingText]
  )

  useEffect(() => {
    if (!isPlaying || isPaused) return

    const gameLoop = () => {
      const now = Date.now()

      if (now - lastCustomerTime.current > customerDelay) {
        spawnCustomer()
        lastCustomerTime.current = now
      }

      setCustomers((prev) =>
        prev.map((customer) => {
          const table = TABLES[customer.tableIndex]
          if (!table) return customer

          if (customer.state === 'entering') {
            if (customer.x < table.x) {
              return { ...customer, x: customer.x + 3 }
            }
            return { ...customer, state: 'waiting' }
          }

          if (customer.state === 'waiting') {
            const newPatience = customer.patience - 16
            const newSatisfaction = (newPatience / customer.maxPatience) * 100

            if (newPatience <= 0) {
              return { ...customer, state: 'leaving', satisfaction: 0 }
            }

            return { ...customer, patience: newPatience, satisfaction: newSatisfaction }
          }

          if (customer.state === 'leaving') {
            return { ...customer, x: customer.x - 3 }
          }

          return customer
        })
      )

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, isPaused, spawnCustomer, customerDelay])

  useEffect(() => {
    const newLevel = Math.floor(score / 500) + 1
    if (newLevel > level) {
      setLevel(newLevel)
      addFloatingText('LEVEL UP!', 400, 280, '#FFD700')
    }
  }, [score, level, addFloatingText])

  const selectFood = useCallback(
    (foodType: FoodType) => {
      const foodInQueue = foodQueue.find((f) => f.type === foodType && f.ready)
      if (!foodInQueue) return
      setSelectedFood((prev) => (prev === foodType ? null : foodType))
    },
    [foodQueue]
  )

  return (
    <div
      ref={gameContainerRef}
      className={`relative min-h-screen bg-[#2A2D3A] ${isFullscreen ? 'p-0' : 'pt-20'}`}
    >
      {/* Top Bar */}
      <div className="absolute left-0 right-0 top-0 z-50 bg-[#1F2128] shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F59E0B]">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Café Tycoon</h1>
              {highScore > 0 && (
                <p className="text-xs text-gray-400">Best: {highScore}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying && (
              <>
                <button
                  onClick={togglePause}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#3A3D4A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4A4D5A]"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={resetGame}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#3A3D4A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4A4D5A]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </button>
              </>
            )}
            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3A3D4A] text-white transition-colors hover:bg-[#4A4D5A]"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex min-h-screen items-center justify-center ${isFullscreen ? 'pt-0' : 'pt-20'} p-6`}>
        <div className="w-full max-w-7xl">
          {isPlaying ? (
            <>
              {/* Stats Bar */}
              <div className="mb-4 grid grid-cols-5 gap-3">
                <div className="rounded-xl bg-[#1F2128] p-3 shadow-lg">
                  <div className="mb-1 flex items-center gap-2 text-[#10B981]">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Money</span>
                  </div>
                  <p className="text-2xl font-bold text-white">${money}</p>
                </div>
                <div className="rounded-xl bg-[#1F2128] p-3 shadow-lg">
                  <div className="mb-1 flex items-center gap-2 text-[#A78BFA]">
                    <Star className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Score</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{score}</p>
                </div>
                <div className="rounded-xl bg-[#1F2128] p-3 shadow-lg">
                  <div className="mb-1 flex items-center gap-2 text-[#60A5FA]">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Guests</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{customers.length}/6</p>
                </div>
                <div className="rounded-xl bg-[#1F2128] p-3 shadow-lg">
                  <div className="mb-1 flex items-center gap-2 text-[#F59E0B]">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Level</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{level}</p>
                </div>
                <div className={`rounded-xl p-3 shadow-lg ${combo > 0 ? 'bg-[#F59E0B]' : 'bg-[#1F2128]'}`}>
                  <div className={`mb-1 flex items-center gap-2 ${combo > 0 ? 'text-white' : 'text-[#F59E0B]'}`}>
                    <Flame className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Combo</span>
                  </div>
                  <p className={`text-2xl font-bold ${combo > 0 ? 'text-white' : 'text-gray-600'}`}>
                    {combo > 0 ? `${combo}x` : '-'}
                  </p>
                </div>
              </div>

              {/* Game Area */}
              <div className="mb-4 overflow-hidden rounded-2xl bg-[#D4A574] shadow-2xl">
                {/* Cafe Scene */}
                <div className="relative h-[560px]">
                  {/* Floor Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="h-full w-full">
                      <defs>
                        <pattern id="floor" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                          <rect width="80" height="80" fill="#8B6F47" />
                          <rect x="0" y="0" width="40" height="40" fill="#A0826B" />
                          <rect x="40" y="40" width="40" height="40" fill="#A0826B" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#floor)" />
                    </svg>
                  </div>

                  {/* Counter */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#5D4E37] shadow-2xl">
                    <div className="absolute left-0 right-0 top-0 h-1 bg-[#8B7355]" />
                  </div>

                  {/* Tables */}
                  {TABLES.map((table, index) => (
                    <div key={index} className="absolute" style={{ left: `${table.x}px`, top: `${table.y}px` }}>
                      <div className="relative">
                        {/* Chair */}
                        <div className="absolute -left-9 top-3 h-12 w-9 rounded-md bg-[#5D4E37] shadow-lg">
                          <div className="absolute top-0 h-4 w-full rounded-t-md bg-[#6D5E47]" />
                        </div>
                        {/* Table */}
                        <div className="h-20 w-32 rounded-2xl bg-[#5D4E37] shadow-2xl">
                          <div className="absolute inset-3 rounded-xl border-2 border-[#4D3E27]/30" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-black/30 blur-lg" />
                      </div>
                    </div>
                  ))}

                  {/* Customers */}
                  {customers.map((customer) => {
                    const emoji = FOODS.find((f) => f.type === customer.order)?.emoji

                    return (
                      <div
                        key={customer.id}
                        className={`absolute transition-all duration-300 ${
                          customer.state === 'leaving' && customer.x < -50 ? 'opacity-0' : 'opacity-100'
                        }`}
                        style={{ left: `${customer.x}px`, top: `${customer.y - 55}px` }}
                      >
                        <div className="relative">
                          {customer.isVIP && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                              <Crown className="h-7 w-7 fill-[#FFD700] text-[#FFD700] drop-shadow-lg" />
                            </div>
                          )}

                          <div className="absolute -bottom-5 left-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-black/40 blur-md" />

                          <div
                            className={`group relative h-28 w-24 cursor-pointer transition-all ${
                              customer.state === 'waiting' ? 'hover:scale-105' : ''
                            }`}
                            onClick={() => customer.state === 'waiting' && serveFood(customer.id)}
                          >
                            {/* Body */}
                            <div
                              className="absolute bottom-4 left-1/2 h-16 w-16 -translate-x-1/2 rounded-t-full shadow-2xl"
                              style={{ backgroundColor: customer.shirtColor }}
                            >
                              <div className="absolute inset-x-5 top-3 h-1 rounded-full bg-white/20" />
                            </div>

                            {/* Head */}
                            <div
                              className="absolute left-1/2 top-4 h-12 w-12 -translate-x-1/2 rounded-full border-2 border-white shadow-xl"
                              style={{ backgroundColor: customer.skinColor }}
                            >
                              <div className="absolute left-3.5 top-4 h-1.5 w-1.5 rounded-full bg-gray-900" />
                              <div className="absolute right-3.5 top-4 h-1.5 w-1.5 rounded-full bg-gray-900" />
                              {customer.state === 'waiting' && customer.patience / customer.maxPatience > 0.3 && (
                                <div className="absolute bottom-2 left-1/2 h-2 w-4 -translate-x-1/2 rounded-b-full border-b-2 border-gray-900" />
                              )}
                            </div>

                            {/* Order Bubble */}
                            {customer.state === 'waiting' && (
                              <div className="absolute -right-3 top-0">
                                <div className="rounded-xl bg-white p-2 shadow-xl">
                                  <div className="text-2xl">{emoji}</div>
                                </div>
                              </div>
                            )}

                            {/* Patience Bar */}
                            {customer.state === 'waiting' && (
                              <div className="absolute -bottom-8 left-1/2 w-24 -translate-x-1/2">
                                <div className="h-2 overflow-hidden rounded-full bg-black/40">
                                  <div
                                    className="h-full rounded-full transition-all duration-100"
                                    style={{
                                      width: `${(customer.patience / customer.maxPatience) * 100}%`,
                                      backgroundColor:
                                        customer.patience / customer.maxPatience > 0.6
                                          ? '#10B981'
                                          : customer.patience / customer.maxPatience > 0.3
                                            ? '#F59E0B'
                                            : '#EF4444',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {customer.state === 'leaving' && customer.satisfaction > 0 && (
                              <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 gap-1">
                                <Heart className="h-5 w-5 fill-[#EF4444] text-[#EF4444] animate-ping" />
                                <Star className="h-5 w-5 fill-[#FFD700] text-[#FFD700] animate-pulse" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Floating Texts */}
                  {floatingTexts.map((text) => (
                    <div
                      key={text.id}
                      className="pointer-events-none absolute text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      style={{
                        left: `${text.x}px`,
                        top: `${text.y}px`,
                        color: text.color,
                        animation: 'float 2s ease-out forwards',
                      }}
                    >
                      {text.text}
                    </div>
                  ))}

                  {/* Food at Counter */}
                  <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-4">
                    {foodQueue
                      .filter((f) => f.ready)
                      .map((food, index) => {
                        const foodData = FOODS.find((f) => f.type === food.type)
                        const isSelected = selectedFood === food.type
                        const emoji = foodData?.emoji

                        return (
                          <div
                            key={`${food.type}-${index}`}
                            onClick={() => selectFood(food.type)}
                            className={`relative cursor-pointer transition-all hover:scale-110 ${
                              isSelected ? 'scale-110' : ''
                            }`}
                          >
                            <div
                              className={`flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl ${
                                isSelected ? 'ring-4 ring-[#F59E0B]' : ''
                              }`}
                              style={{ backgroundColor: foodData?.color }}
                            >
                              <div className="text-4xl drop-shadow-lg">{emoji}</div>
                              {isSelected && (
                                <div className="absolute -right-2 -top-2">
                                  <Zap className="h-7 w-7 fill-[#F59E0B] text-[#F59E0B]" />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* Kitchen */}
              <div className="rounded-2xl bg-[#1F2128] p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#F59E0B]" />
                    <h3 className="text-lg font-bold text-white">Kitchen</h3>
                  </div>
                  <div className="rounded-full bg-[#3A3D4A] px-4 py-1.5">
                    <span className="text-sm font-semibold text-gray-300">Served: {totalServed}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {FOODS.map((food) => {
                    const Icon = food.icon
                    const canAfford = money >= food.price
                    const preparing = foodQueue.some((f) => f.type === food.type && f.preparing)
                    const readyCount = foodQueue.filter((f) => f.type === food.type && f.ready).length

                    return (
                      <button
                        key={food.type}
                        onClick={() => !preparing && prepareFood(food.type)}
                        disabled={!canAfford || preparing}
                        className={`relative overflow-hidden rounded-xl p-4 transition-all ${
                          preparing
                            ? 'bg-[#F59E0B] shadow-lg'
                            : canAfford
                              ? 'bg-[#3A3D4A] hover:bg-[#4A4D5A] hover:scale-105 shadow-lg'
                              : 'cursor-not-allowed bg-[#2A2D3A] opacity-40'
                        }`}
                      >
                        {preparing && (
                          <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        )}

                        <div className="relative">
                          <div
                            className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl shadow-xl"
                            style={{ backgroundColor: food.color }}
                          >
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <p className="mb-2 text-center text-sm font-bold text-white">{food.name}</p>
                          <div className="flex items-center justify-center gap-1 rounded-full bg-[#10B981] px-2 py-1">
                            <DollarSign className="h-3 w-3 text-white" />
                            <span className="text-xs font-bold text-white">{food.price}</span>
                          </div>
                          {preparing && (
                            <p className="mt-2 text-center text-xs font-bold text-white">Cooking...</p>
                          )}
                          {readyCount > 0 && (
                            <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#10B981] text-sm font-bold text-white shadow-xl">
                              {readyCount}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            // Start Screen
            <div className="rounded-3xl bg-[#1F2128] p-16 text-center shadow-2xl">
              <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
                <div className="absolute inset-0 animate-pulse rounded-full bg-[#F59E0B]/20" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-[#F59E0B] shadow-2xl">
                  <Coffee className="h-16 w-16 text-white" />
                </div>
              </div>

              <h2 className="mb-4 text-5xl font-black text-white">Café Tycoon</h2>
              <p className="mx-auto mb-8 max-w-lg text-lg text-gray-400">
                Build your café empire! Serve customers fast, rack up combos, and level up.
              </p>

              {highScore > 0 && (
                <div className="mx-auto mb-8 max-w-sm rounded-2xl bg-[#3A3D4A] p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="h-6 w-6 fill-[#FFD700] text-[#FFD700]" />
                    <span className="text-xl font-black text-white">High Score: {highScore}</span>
                  </div>
                </div>
              )}

              <div className="mx-auto mb-12 max-w-md space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-[#3A3D4A] p-4">
                  <span className="text-3xl">👨‍🍳</span>
                  <p className="text-left text-sm font-semibold text-gray-300">Cook food in your kitchen</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-[#3A3D4A] p-4">
                  <span className="text-3xl">⚡</span>
                  <p className="text-left text-sm font-semibold text-gray-300">Grab and serve matching orders</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-[#3A3D4A] p-4">
                  <span className="text-3xl">🔥</span>
                  <p className="text-left text-sm font-semibold text-gray-300">Build combos for massive bonuses</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-[#3A3D4A] p-4">
                  <span className="text-3xl">👑</span>
                  <p className="text-left text-sm font-semibold text-gray-300">VIP guests give 2x rewards</p>
                </div>
              </div>

              <button
                onClick={startGame}
                className="group flex items-center gap-3 rounded-2xl bg-[#10B981] px-16 py-6 font-black text-white shadow-2xl transition-all hover:scale-105 hover:bg-[#059669]"
              >
                <Play className="h-7 w-7" />
                <span className="text-2xl">Start Game</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px);
          }
        }
      `}</style>
    </div>
  )
}
