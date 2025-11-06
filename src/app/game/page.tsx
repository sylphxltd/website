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
}

interface FoodItem {
  type: FoodType
  preparing: boolean
  ready: boolean
}

const FOODS = [
  { type: 'coffee' as FoodType, name: 'Coffee', icon: Coffee, price: 5, time: 2000, color: '#8B4513' },
  { type: 'cookie' as FoodType, name: 'Cookie', icon: Cookie, price: 3, time: 1500, color: '#CD853F' },
  { type: 'pizza' as FoodType, name: 'Pizza', icon: Pizza, price: 10, time: 3000, color: '#FF6347' },
  { type: 'icecream' as FoodType, name: 'Ice Cream', icon: IceCream, price: 7, time: 2500, color: '#FFB6C1' },
]

const TABLES = [
  { x: 120, y: 180 },
  { x: 320, y: 180 },
  { x: 520, y: 180 },
  { x: 120, y: 320 },
  { x: 320, y: 320 },
  { x: 520, y: 320 },
]

export default function GamePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [money, setMoney] = useState(100)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [foodQueue, setFoodQueue] = useState<FoodItem[]>([])
  const [selectedFood, setSelectedFood] = useState<FoodType | null>(null)

  const nextCustomerId = useRef(0)
  const lastCustomerTime = useRef(0)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const customerDelay = 5000

  const startGame = useCallback(() => {
    setIsPlaying(true)
    setIsPaused(false)
    setMoney(100)
    setScore(0)
    setLevel(1)
    setCustomers([])
    setFoodQueue([])
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
  }, [])

  const spawnCustomer = useCallback(() => {
    const availableTables = TABLES.map((_, i) => i).filter(
      (tableIndex) => !customers.some((c) => c.tableIndex === tableIndex && c.state !== 'leaving')
    )

    if (availableTables.length === 0) return

    const tableIndex = availableTables[Math.floor(Math.random() * availableTables.length)]
    if (tableIndex === undefined) return

    const table = TABLES[tableIndex]
    if (!table) return

    const newCustomer: Customer = {
      id: nextCustomerId.current++,
      x: -100,
      y: table.y,
      tableIndex,
      order: FOODS[Math.floor(Math.random() * FOODS.length)]?.type ?? 'coffee',
      patience: 15000,
      maxPatience: 15000,
      state: 'entering',
      satisfaction: 100,
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
      const tip = Math.floor(food.price * patiencePercent * 2)
      const totalEarned = food.price + tip

      setMoney((prev) => prev + totalEarned)
      setScore((prev) => prev + Math.floor(customer.satisfaction))

      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, state: 'leaving' as const } : c))
      )

      setTimeout(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== customerId))
      }, 1000)

      setSelectedFood(null)
    },
    [selectedFood, customers, foodQueue]
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
  }, [isPlaying, isPaused, spawnCustomer])

  useEffect(() => {
    const newLevel = Math.floor(score / 500) + 1
    if (newLevel > level) {
      setLevel(newLevel)
    }
  }, [score, level])

  const selectFood = useCallback((foodType: FoodType) => {
    const foodInQueue = foodQueue.find((f) => f.type === foodType && f.ready)
    if (!foodInQueue) return
    setSelectedFood((prev) => (prev === foodType ? null : foodType))
  }, [foodQueue])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 pt-20 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 shadow-lg">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-5xl font-black text-transparent dark:from-amber-400 dark:to-orange-400">
              Café Tycoon
            </h1>
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Build your coffee empire, one cup at a time ☕
          </p>
        </div>

        {/* Game Stats Bar */}
        {isPlaying && (
          <div className="mx-auto mb-6 max-w-5xl">
            <div className="rounded-2xl border border-amber-200/50 bg-white/80 p-4 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Money</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">${money}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Score</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{score}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Customers</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{customers.length}/6</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-600 shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Level</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{level}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="mx-auto max-w-5xl">
          {isPlaying ? (
            <>
              {/* Café Interior */}
              <div className="relative mb-6 overflow-hidden rounded-3xl border-4 border-amber-300/50 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 shadow-2xl dark:border-gray-700 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
                {/* Wooden Floor */}
                <div className="absolute inset-0">
                  <div className="h-full w-full opacity-20">
                    <svg className="h-full w-full">
                      <pattern id="wood" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <rect width="100" height="100" fill="#D2691E" />
                        <rect x="0" y="0" width="100" height="2" fill="#8B4513" opacity="0.3" />
                        <rect x="0" y="50" width="100" height="2" fill="#8B4513" opacity="0.3" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#wood)" />
                    </svg>
                  </div>
                </div>

                {/* Counter Bar at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-800 to-amber-700 opacity-90 shadow-2xl">
                  <div className="absolute left-1/2 top-0 h-4 w-3/4 -translate-x-1/2 rounded-t-lg bg-amber-900/30" />
                </div>

                {/* Game Canvas */}
                <div className="relative h-[480px]">
                  {/* Tables */}
                  {TABLES.map((table, index) => (
                    <div
                      key={index}
                      className="absolute"
                      style={{ left: `${table.x}px`, top: `${table.y}px` }}
                    >
                      {/* Table */}
                      <div className="relative">
                        {/* Table Top - Isometric */}
                        <div className="h-16 w-24 rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 shadow-lg">
                          <div className="h-full w-full rounded-lg border-4 border-amber-800/30" />
                        </div>
                        {/* Table Shadow */}
                        <div className="absolute -bottom-2 left-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-black/20 blur-md" />
                      </div>
                    </div>
                  ))}

                  {/* Customers */}
                  {customers.map((customer) => {
                    const Icon = FOODS.find((f) => f.type === customer.order)?.icon ?? Coffee
                    const foodColor = FOODS.find((f) => f.type === customer.order)?.color

                    return (
                      <div
                        key={customer.id}
                        className={`absolute transition-all duration-300 ${
                          customer.state === 'leaving' && customer.x < -50 ? 'opacity-0' : 'opacity-100'
                        }`}
                        style={{
                          left: `${customer.x}px`,
                          top: `${customer.y - 40}px`,
                        }}
                      >
                        <div className="relative">
                          {/* Character Shadow */}
                          <div className="absolute -bottom-4 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-black/30 blur-sm" />

                          {/* Character Body (2.5D) */}
                          <div
                            className={`group relative h-20 w-16 cursor-pointer transition-all hover:scale-110 ${
                              customer.state === 'waiting' ? 'hover:translate-y-[-4px]' : ''
                            }`}
                            onClick={() => customer.state === 'waiting' && serveFood(customer.id)}
                          >
                            {/* Body */}
                            <div className="absolute bottom-0 left-1/2 h-12 w-12 -translate-x-1/2 rounded-t-full bg-gradient-to-br from-indigo-400 to-purple-600 shadow-lg" />

                            {/* Head */}
                            <div className="absolute left-1/2 top-2 h-10 w-10 -translate-x-1/2 rounded-full border-3 border-white bg-gradient-to-br from-pink-300 to-pink-400 shadow-md" />

                            {/* Order Bubble */}
                            {customer.state === 'waiting' && (
                              <div className="absolute -right-2 -top-2 animate-bounce">
                                <div className="relative rounded-xl bg-white p-2 shadow-xl">
                                  <Icon className="h-5 w-5" style={{ color: foodColor }} />
                                  <div className="absolute -bottom-1 right-2 h-3 w-3 rotate-45 bg-white" />
                                </div>
                              </div>
                            )}

                            {/* Patience Bar */}
                            {customer.state === 'waiting' && (
                              <div className="absolute -bottom-8 left-1/2 w-20 -translate-x-1/2">
                                <div className="h-2 overflow-hidden rounded-full bg-gray-700/30 shadow-inner">
                                  <div
                                    className="h-full rounded-full shadow-sm transition-all duration-100"
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

                            {/* Happy Indicator */}
                            {customer.state === 'leaving' && customer.satisfaction > 0 && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-ping">
                                <Heart className="h-6 w-6 fill-red-500 text-red-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Food Ready Indicator at Counter */}
                  <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
                    {foodQueue
                      .filter((f) => f.ready)
                      .map((food, index) => {
                        const Icon = FOODS.find((f) => f.type === food.type)?.icon ?? Coffee
                        const foodData = FOODS.find((f) => f.type === food.type)
                        const isSelected = selectedFood === food.type

                        return (
                          <div
                            key={`${food.type}-${index}`}
                            onClick={() => selectFood(food.type)}
                            className={`group relative cursor-pointer transition-all hover:scale-110 ${
                              isSelected ? 'scale-110 animate-bounce' : ''
                            }`}
                          >
                            <div
                              className={`relative flex h-14 w-14 items-center justify-center rounded-xl shadow-2xl transition-all ${
                                isSelected ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
                              }`}
                              style={{
                                background: `linear-gradient(135deg, ${foodData?.color}dd, ${foodData?.color})`,
                              }}
                            >
                              <Icon className="h-7 w-7 text-white drop-shadow-lg" />
                              {isSelected && (
                                <div className="absolute -top-2 -right-2">
                                  <Sparkles className="h-5 w-5 animate-spin text-yellow-400" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white shadow-lg">
                              ✓
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* Kitchen Preparation Area */}
              <div className="mb-6 rounded-2xl border border-amber-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kitchen</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                        className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 ${
                          preparing
                            ? 'border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20'
                            : canAfford
                              ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50 hover:scale-105 hover:border-amber-400 hover:shadow-xl dark:border-gray-600 dark:from-gray-700 dark:to-gray-600'
                              : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-40 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        {preparing && (
                          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-yellow-200/0 via-yellow-300/40 to-yellow-200/0" />
                        )}

                        <div className="relative">
                          <div
                            className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:rotate-12"
                            style={{
                              background: `linear-gradient(135deg, ${food.color}dd, ${food.color})`,
                            }}
                          >
                            <Icon className="h-8 w-8 text-white drop-shadow" />
                          </div>
                          <p className="mb-1 text-center text-sm font-bold text-gray-900 dark:text-white">
                            {food.name}
                          </p>
                          <div className="flex items-center justify-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-bold text-green-600 dark:text-green-400">{food.price}</span>
                          </div>
                          {preparing && (
                            <p className="mt-1 text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                              Cooking...
                            </p>
                          )}
                          {readyCount > 0 && (
                            <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white shadow-lg">
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
              <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 p-4 dark:from-gray-800 dark:to-gray-700">
                <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                  💡 <span className="font-bold">How to play:</span> Cook food in the Kitchen → Click ready food at
                  counter → Click customer with matching order → Earn money & tips! 💰
                </p>
              </div>
            </>
          ) : (
            // Start Screen
            <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-white via-amber-50 to-orange-50 p-12 text-center shadow-2xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-700">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl">
                <Coffee className="h-12 w-12 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-black text-gray-900 dark:text-white">
                Welcome to Café Tycoon!
              </h2>
              <p className="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-300">
                Run your own café, serve delicious food to customers, and build your empire. Fast service = bigger
                tips!
              </p>
              <div className="mx-auto mb-8 max-w-sm space-y-2 rounded-xl bg-white/50 p-4 text-left text-sm dark:bg-gray-800/50">
                <p className="flex items-center gap-2">
                  <span className="text-lg">👨‍🍳</span> Cook food in your kitchen
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-lg">🍕</span> Serve customers quickly
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-lg">💰</span> Earn money and tips
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-lg">⭐</span> Level up your café
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-10 py-5 font-black text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                <Play className="h-6 w-6 transition-transform group-hover:scale-110" />
                <span className="text-xl">Start Game</span>
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
    </div>
  )
}
