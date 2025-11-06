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
  TrendingUp,
  RotateCcw,
  Play,
  Pause,
  Heart,
  Clock,
  Sparkles,
  Zap,
  Award,
  Crown,
  Flame,
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
  { type: 'cookie' as FoodType, name: 'Cookie', icon: Cookie, price: 3, time: 1500, color: '#D2691E', emoji: '🍪' },
  { type: 'pizza' as FoodType, name: 'Pizza', icon: Pizza, price: 10, time: 3000, color: '#FF6347', emoji: '🍕' },
  { type: 'icecream' as FoodType, name: 'Ice Cream', icon: IceCream, price: 7, time: 2500, color: '#FF69B4', emoji: '🍦' },
]

const TABLES = [
  { x: 100, y: 160, hasChair: true },
  { x: 300, y: 160, hasChair: true },
  { x: 500, y: 160, hasChair: true },
  { x: 100, y: 300, hasChair: true },
  { x: 300, y: 300, hasChair: true },
  { x: 500, y: 300, hasChair: true },
]

const SKIN_COLORS = ['#FFE0BD', '#F1C27D', '#C68642', '#8D5524', '#E0AC69', '#F4C2A0']
const SHIRT_COLORS = ['#FF6B9D', '#4169E1', '#32CD32', '#FFD700', '#9370DB', '#FF4500']

export default function GamePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
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
        `+$${totalEarned}${combo > 0 ? ` x${combo}` : ''}`,
        customer.x,
        customer.y - 50,
        '#10B981'
      )

      if (customer.isVIP) {
        addFloatingText('VIP Bonus!', customer.x, customer.y - 70, '#FFD700')
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
      addFloatingText('Level Up!', 400, 240, '#FFD700')
    }
  }, [score, level, addFloatingText])

  const selectFood = useCallback((foodType: FoodType) => {
    const foodInQueue = foodQueue.find((f) => f.type === foodType && f.ready)
    if (!foodInQueue) return
    setSelectedFood((prev) => (prev === foodType ? null : foodType))
  }, [foodQueue])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-20 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="relative rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 shadow-2xl">
              <Coffee className="h-8 w-8 text-white" />
              <div className="absolute -right-1 -top-1">
                <Sparkles className="h-5 w-5 animate-pulse text-yellow-300" />
              </div>
            </div>
            <h1 className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-5xl font-black text-transparent dark:from-amber-400 dark:to-orange-400">
              Café Tycoon
            </h1>
          </div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            Master the art of café management ☕✨
          </p>
        </div>

        {/* Game Stats Bar */}
        {isPlaying && (
          <div className="mx-auto mb-6 max-w-6xl">
            <div className="rounded-3xl border-2 border-amber-300/50 bg-gradient-to-r from-white/90 via-amber-50/90 to-orange-50/90 p-4 shadow-2xl backdrop-blur-xl dark:border-gray-700 dark:from-gray-800/90 dark:via-gray-700/90 dark:to-gray-800/90">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <div className="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Money</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">${money}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Score</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{score}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Customers</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{customers.length}/6</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-600 shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Level</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 p-3 dark:from-yellow-900/30 dark:to-orange-900/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">Combo</p>
                    <p className="text-xl font-black text-orange-900 dark:text-orange-100">
                      {combo > 0 ? `${combo}x` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="mx-auto max-w-6xl">
          {isPlaying ? (
            <>
              {/* Café Interior */}
              <div className="relative mb-6 overflow-hidden rounded-3xl border-4 border-amber-400/50 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 shadow-2xl dark:border-gray-600 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
                {/* Background Decorations */}
                <div className="absolute inset-0">
                  {/* Floor Pattern */}
                  <div className="h-full w-full opacity-15">
                    <svg className="h-full w-full">
                      <defs>
                        <pattern id="wood" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                          <rect width="120" height="120" fill="#8B4513" />
                          <rect x="0" y="0" width="60" height="60" fill="#A0522D" opacity="0.3" />
                          <rect x="60" y="60" width="60" height="60" fill="#A0522D" opacity="0.3" />
                          <line x1="0" y1="60" x2="120" y2="60" stroke="#654321" strokeWidth="2" />
                          <line x1="60" y1="0" x2="60" y2="120" stroke="#654321" strokeWidth="2" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#wood)" />
                    </svg>
                  </div>

                  {/* Wall Decorations */}
                  <div className="absolute left-4 top-4 h-16 w-16 rounded-lg bg-gradient-to-br from-green-300 to-green-500 opacity-40 shadow-lg" />
                  <div className="absolute right-4 top-4 h-20 w-12 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 opacity-40 shadow-lg" />

                  {/* Ambient Light Effects */}
                  <div className="absolute left-1/4 top-0 h-32 w-32 rounded-full bg-yellow-300 opacity-10 blur-3xl" />
                  <div className="absolute right-1/4 top-0 h-32 w-32 rounded-full bg-orange-300 opacity-10 blur-3xl" />
                </div>

                {/* Counter Bar at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700 shadow-2xl">
                  <div className="absolute left-1/2 top-0 h-6 w-4/5 -translate-x-1/2 rounded-t-xl bg-amber-950/40 shadow-inner" />
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent" />
                </div>

                {/* Game Canvas */}
                <div className="relative h-[520px]">
                  {/* Tables with Chairs */}
                  {TABLES.map((table, index) => (
                    <div
                      key={index}
                      className="absolute"
                      style={{ left: `${table.x}px`, top: `${table.y}px` }}
                    >
                      <div className="relative">
                        {/* Chair */}
                        <div className="absolute -left-8 top-2 h-10 w-8 rounded-md bg-gradient-to-br from-amber-600 to-amber-800 shadow-md">
                          <div className="absolute top-0 h-3 w-full rounded-t-md bg-amber-700/50" />
                        </div>

                        {/* Table */}
                        <div className="relative h-16 w-28 rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 shadow-2xl">
                          <div className="absolute inset-2 rounded-lg border-2 border-amber-950/20" />
                          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-950/10" />
                        </div>

                        {/* Shadow */}
                        <div className="absolute -bottom-3 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-black/30 blur-md" />
                      </div>
                    </div>
                  ))}

                  {/* Customers */}
                  {customers.map((customer) => {
                    const Icon = FOODS.find((f) => f.type === customer.order)?.icon ?? Coffee
                    const foodColor = FOODS.find((f) => f.type === customer.order)?.color
                    const emoji = FOODS.find((f) => f.type === customer.order)?.emoji

                    return (
                      <div
                        key={customer.id}
                        className={`absolute transition-all duration-300 ${
                          customer.state === 'leaving' && customer.x < -50 ? 'opacity-0' : 'opacity-100'
                        }`}
                        style={{
                          left: `${customer.x}px`,
                          top: `${customer.y - 50}px`,
                        }}
                      >
                        <div className="relative">
                          {/* VIP Crown */}
                          {customer.isVIP && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                              <Crown className="h-6 w-6 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                            </div>
                          )}

                          {/* Character Shadow */}
                          <div className="absolute -bottom-6 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-black/40 blur-md" />

                          {/* Character Body (Enhanced 2.5D) */}
                          <div
                            className={`group relative h-24 w-20 cursor-pointer transition-all ${
                              customer.state === 'waiting' ? 'hover:scale-110 hover:translate-y-[-6px]' : ''
                            }`}
                            onClick={() => customer.state === 'waiting' && serveFood(customer.id)}
                          >
                            {/* Body/Shirt */}
                            <div
                              className="absolute bottom-2 left-1/2 h-14 w-14 -translate-x-1/2 rounded-t-full shadow-xl"
                              style={{
                                background: `linear-gradient(135deg, ${customer.shirtColor}, ${customer.shirtColor}dd)`,
                              }}
                            >
                              <div className="absolute inset-x-4 top-2 h-1 rounded-full bg-white/20" />
                            </div>

                            {/* Head */}
                            <div
                              className="absolute left-1/2 top-3 h-11 w-11 -translate-x-1/2 rounded-full border-3 border-white shadow-lg"
                              style={{
                                background: `linear-gradient(135deg, ${customer.skinColor}, ${customer.skinColor}dd)`,
                              }}
                            >
                              {/* Eyes */}
                              <div className="absolute left-3 top-4 h-1.5 w-1.5 rounded-full bg-gray-800" />
                              <div className="absolute right-3 top-4 h-1.5 w-1.5 rounded-full bg-gray-800" />
                              {/* Smile */}
                              {customer.state === 'waiting' && customer.patience / customer.maxPatience > 0.3 && (
                                <div className="absolute bottom-2 left-1/2 h-2 w-3 -translate-x-1/2 rounded-b-full border-b-2 border-gray-800" />
                              )}
                            </div>

                            {/* Order Bubble */}
                            {customer.state === 'waiting' && (
                              <div className="absolute -right-4 -top-4 animate-bounce">
                                <div className="relative rounded-2xl bg-white p-2.5 shadow-2xl ring-2 ring-amber-400">
                                  <div className="text-2xl">{emoji}</div>
                                  <div className="absolute -bottom-1.5 right-3 h-4 w-4 rotate-45 bg-white ring-2 ring-amber-400" />
                                </div>
                              </div>
                            )}

                            {/* Patience Bar */}
                            {customer.state === 'waiting' && (
                              <div className="absolute -bottom-10 left-1/2 w-24 -translate-x-1/2">
                                <div className="h-2.5 overflow-hidden rounded-full bg-gray-900/40 shadow-inner">
                                  <div
                                    className="h-full rounded-full shadow-lg transition-all duration-100"
                                    style={{
                                      width: `${(customer.patience / customer.maxPatience) * 100}%`,
                                      background:
                                        customer.patience / customer.maxPatience > 0.6
                                          ? 'linear-gradient(to right, #10B981, #059669)'
                                          : customer.patience / customer.maxPatience > 0.3
                                            ? 'linear-gradient(to right, #F59E0B, #D97706)'
                                            : 'linear-gradient(to right, #EF4444, #DC2626)',
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Happy Effect */}
                            {customer.state === 'leaving' && customer.satisfaction > 0 && (
                              <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 gap-1">
                                <Heart className="h-5 w-5 animate-ping fill-red-500 text-red-500" />
                                <Star className="h-5 w-5 animate-pulse fill-yellow-400 text-yellow-400" />
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
                      className="pointer-events-none absolute animate-float text-xl font-black drop-shadow-lg"
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

                  {/* Food Ready at Counter */}
                  <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-3">
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
                            className={`group relative cursor-pointer transition-all hover:scale-110 ${
                              isSelected ? 'scale-110' : ''
                            }`}
                          >
                            <div
                              className={`relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl transition-all ${
                                isSelected ? 'animate-bounce ring-4 ring-yellow-400 ring-offset-2' : ''
                              }`}
                              style={{
                                background: `linear-gradient(135deg, ${foodData?.color}ee, ${foodData?.color})`,
                              }}
                            >
                              <div className="text-3xl drop-shadow-lg">{emoji}</div>
                              {isSelected && (
                                <div className="absolute -right-2 -top-2">
                                  <Zap className="h-6 w-6 animate-pulse fill-yellow-400 text-yellow-400" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-xs font-black text-white shadow-lg ring-2 ring-white">
                              ✓
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* Kitchen Preparation Area */}
              <div className="mb-6 rounded-3xl border-2 border-amber-300/50 bg-gradient-to-br from-white/90 to-amber-100/90 p-6 shadow-2xl backdrop-blur-md dark:border-gray-700 dark:from-gray-800/90 dark:to-gray-700/90">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-600 shadow-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Kitchen</h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 dark:bg-purple-900/30">
                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                      Served: {totalServed}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                        className={`group relative overflow-hidden rounded-2xl border-3 p-5 transition-all duration-200 ${
                          preparing
                            ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-100 dark:border-yellow-600 dark:from-yellow-900/20 dark:to-orange-900/20'
                            : canAfford
                              ? 'border-amber-300 bg-gradient-to-br from-white to-amber-50 hover:scale-105 hover:border-amber-500 hover:shadow-2xl dark:border-gray-600 dark:from-gray-700 dark:to-gray-600'
                              : 'cursor-not-allowed border-gray-300 bg-gray-100 opacity-40 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        {preparing && (
                          <div className="absolute inset-0">
                            <div className="h-full w-full animate-pulse bg-gradient-to-r from-yellow-200/0 via-yellow-400/50 to-yellow-200/0" />
                          </div>
                        )}

                        <div className="relative">
                          <div
                            className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl transition-all group-hover:rotate-12 group-hover:scale-110"
                            style={{
                              background: `linear-gradient(135deg, ${food.color}ee, ${food.color})`,
                            }}
                          >
                            <Icon className="h-10 w-10 text-white drop-shadow-lg" />
                          </div>
                          <p className="mb-2 text-center text-base font-black text-gray-900 dark:text-white">
                            {food.name}
                          </p>
                          <div className="flex items-center justify-center gap-1.5 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900/30">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-black text-green-700 dark:text-green-400">
                              {food.price}
                            </span>
                          </div>
                          {preparing && (
                            <p className="mt-2 text-center text-xs font-bold text-yellow-700 dark:text-yellow-300">
                              🔥 Cooking...
                            </p>
                          )}
                          {readyCount > 0 && (
                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-sm font-black text-white shadow-xl ring-2 ring-white">
                              {readyCount}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 p-4 shadow-lg dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center justify-center gap-2 text-center">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    Cook → Click ready food at counter → Serve matching customer → Build combos for bonus! 🔥
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Start Screen
            <div className="rounded-3xl border-4 border-amber-300 bg-gradient-to-br from-white via-amber-50 to-orange-100 p-12 text-center shadow-2xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-700">
              <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-20" />
                <div className="relative rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-6 shadow-2xl">
                  <Coffee className="h-16 w-16 text-white drop-shadow-2xl" />
                </div>
              </div>
              <h2 className="mb-4 text-4xl font-black text-gray-900 dark:text-white">
                Welcome to Café Tycoon!
              </h2>
              <p className="mx-auto mb-8 max-w-md text-lg font-medium text-gray-600 dark:text-gray-300">
                Build your café empire! Serve customers quickly, master combos, and reach new levels. 🚀
              </p>

              {highScore > 0 && (
                <div className="mx-auto mb-6 max-w-sm rounded-2xl bg-gradient-to-r from-yellow-100 to-orange-100 p-4 dark:from-yellow-900/30 dark:to-orange-900/30">
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="h-6 w-6 fill-yellow-600 text-yellow-600" />
                    <span className="text-lg font-black text-gray-900 dark:text-white">
                      High Score: {highScore}
                    </span>
                  </div>
                </div>
              )}

              <div className="mx-auto mb-8 max-w-md space-y-3 rounded-2xl bg-white/70 p-6 text-left dark:bg-gray-800/70">
                <p className="flex items-center gap-3 text-sm font-semibold">
                  <span className="text-2xl">👨‍🍳</span> Cook delicious food in your kitchen
                </p>
                <p className="flex items-center gap-3 text-sm font-semibold">
                  <span className="text-2xl">⚡</span> Grab ready food and serve customers
                </p>
                <p className="flex items-center gap-3 text-sm font-semibold">
                  <span className="text-2xl">🔥</span> Build combos for massive bonuses
                </p>
                <p className="flex items-center gap-3 text-sm font-semibold">
                  <span className="text-2xl">👑</span> Serve VIP customers for extra rewards
                </p>
                <p className="flex items-center gap-3 text-sm font-semibold">
                  <span className="text-2xl">⭐</span> Level up and become a master!
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 px-12 py-6 font-black text-white shadow-2xl transition-all hover:scale-105 hover:shadow-3xl"
              >
                <Play className="h-7 w-7 transition-transform group-hover:scale-110" />
                <span className="text-2xl">Start Game</span>
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
                >
                  {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
                >
                  <RotateCcw className="h-5 w-5" />
                  New Game
                </button>
              </>
            )}
          </div>
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
