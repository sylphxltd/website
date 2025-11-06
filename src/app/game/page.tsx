'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Coffee,
  Cookie,
  Pizza,
  IceCream,
  Utensils,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  RotateCcw,
  Play,
  Pause,
  Info,
} from 'lucide-react'

type FoodType = 'coffee' | 'cookie' | 'pizza' | 'icecream'

interface Customer {
  id: number
  x: number
  y: number
  order: FoodType
  patience: number
  maxPatience: number
  state: 'waiting' | 'eating' | 'leaving'
  satisfaction: number
}

interface FoodItem {
  type: FoodType
  x: number
  y: number
  readyTime: number
}

const FOODS = [
  { type: 'coffee' as FoodType, name: 'Coffee', icon: Coffee, price: 5, time: 2000, color: '#6F4E37' },
  { type: 'cookie' as FoodType, name: 'Cookie', icon: Cookie, price: 3, time: 1500, color: '#D2691E' },
  { type: 'pizza' as FoodType, name: 'Pizza', icon: Pizza, price: 10, time: 3000, color: '#FF6347' },
  { type: 'icecream' as FoodType, name: 'Ice Cream', icon: IceCream, price: 7, time: 2500, color: '#FFB6C1' },
]

const CUSTOMER_COLORS = ['#FF6B9D', '#C44569', '#FFA07A', '#FF7F50', '#FFD700', '#98D8C8']

export default function GamePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [money, setMoney] = useState(50)
  const [score, setScore] = useState(0)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [preparingFood, setPreparingFood] = useState<FoodType | null>(null)
  const [gameSpeed, setGameSpeed] = useState(1)
  const [customerDelay, setCustomerDelay] = useState(4000)
  const [selectedFood, setSelectedFood] = useState<FoodType | null>(null)

  const nextCustomerId = useRef(0)
  const lastCustomerTime = useRef(0)
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Start game
  const startGame = useCallback(() => {
    setIsPlaying(true)
    setIsPaused(false)
    setMoney(50)
    setScore(0)
    setCustomers([])
    setFoodItems([])
    setGameSpeed(1)
    setCustomerDelay(4000)
    lastCustomerTime.current = Date.now()
  }, [])

  // Toggle pause
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  // Reset game
  const resetGame = useCallback(() => {
    setIsPlaying(false)
    setIsPaused(false)
    setCustomers([])
    setFoodItems([])
    setSelectedFood(null)
    setPreparingFood(null)
  }, [])

  // Spawn new customer
  const spawnCustomer = useCallback(() => {
    if (customers.length >= 6) return

    const newCustomer: Customer = {
      id: nextCustomerId.current++,
      x: -100,
      y: 100 + customers.length * 80,
      order: FOODS[Math.floor(Math.random() * FOODS.length)]?.type ?? 'coffee',
      patience: 10000,
      maxPatience: 10000,
      state: 'waiting',
      satisfaction: 100,
    }

    setCustomers((prev) => [...prev, newCustomer])
  }, [customers.length])

  // Prepare food
  const prepareFood = useCallback((foodType: FoodType) => {
    const food = FOODS.find((f) => f.type === foodType)
    if (!food || preparingFood || money < food.price) return

    setMoney((prev) => prev - food.price)
    setPreparingFood(foodType)

    setTimeout(() => {
      const newFood: FoodItem = {
        type: foodType,
        x: 50,
        y: 450,
        readyTime: Date.now(),
      }
      setFoodItems((prev) => [...prev, newFood])
      setPreparingFood(null)
    }, food.time / gameSpeed)
  }, [preparingFood, money, gameSpeed])

  // Serve food to customer
  const serveFood = useCallback((foodType: FoodType) => {
    const customer = customers.find((c) => c.order === foodType && c.state === 'waiting')
    if (!customer) return

    const food = FOODS.find((f) => f.type === foodType)
    if (!food) return

    // Remove food item
    setFoodItems((prev) => prev.filter((f) => f.type !== foodType))

    // Calculate tip based on patience
    const patiencePercent = customer.patience / customer.maxPatience
    const tip = Math.floor(food.price * patiencePercent * 2)
    const totalEarned = food.price + tip

    setMoney((prev) => prev + totalEarned)
    setScore((prev) => prev + Math.floor(customer.satisfaction))

    // Remove customer
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customer.id
          ? { ...c, state: 'leaving' as const }
          : c
      )
    )

    setTimeout(() => {
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
    }, 500)
  }, [customers])

  // Game loop
  useEffect(() => {
    if (!isPlaying || isPaused) return

    const gameLoop = () => {
      const now = Date.now()

      // Spawn customers
      if (now - lastCustomerTime.current > customerDelay) {
        spawnCustomer()
        lastCustomerTime.current = now
      }

      // Update customers
      setCustomers((prev) =>
        prev.map((customer) => {
          if (customer.state === 'waiting') {
            // Move to table
            const targetX = 50
            if (customer.x < targetX) {
              return { ...customer, x: customer.x + 2 }
            }

            // Decrease patience
            const newPatience = customer.patience - 16 / gameSpeed
            const newSatisfaction = (newPatience / customer.maxPatience) * 100

            if (newPatience <= 0) {
              return { ...customer, state: 'leaving', satisfaction: 0 }
            }

            return {
              ...customer,
              patience: newPatience,
              satisfaction: newSatisfaction,
            }
          }
          return customer
        })
      )

      // Remove leaving customers with no satisfaction
      setCustomers((prev) => {
        const leavingCustomers = prev.filter((c) => c.state === 'leaving' && c.satisfaction === 0)
        if (leavingCustomers.length > 0) {
          setTimeout(() => {
            setCustomers((current) => current.filter((c) => c.state !== 'leaving' || c.satisfaction > 0))
          }, 500)
        }
        return prev
      })

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, isPaused, customerDelay, gameSpeed, spawnCustomer])

  // Upgrade system
  const upgrade = useCallback((type: 'speed' | 'customers') => {
    if (type === 'speed' && money >= 50) {
      setMoney((prev) => prev - 50)
      setGameSpeed((prev) => prev + 0.2)
    } else if (type === 'customers' && money >= 30) {
      setMoney((prev) => prev - 30)
      setCustomerDelay((prev) => Math.max(2000, prev - 500))
    }
  }, [money])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 pt-24 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Utensils className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Café Tycoon</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Run your café, serve customers, and build your empire!
          </p>
        </div>

        {/* Info Panel */}
        {showInfo && !isPlaying && (
          <div className="mx-auto mb-6 max-w-2xl rounded-2xl border border-amber-200 bg-white/80 p-6 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">How to Play</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>• Click food items below to prepare them (costs money)</p>
              <p>• When ready, click the food icon to select it</p>
              <p>• Click on customers with matching orders to serve them</p>
              <p>• Serve quickly for bigger tips!</p>
              <p>• Customers leave if patience runs out</p>
              <p>• Use your earnings to upgrade your café</p>
            </div>
          </div>
        )}

        {/* Game Stats */}
        {isPlaying && (
          <div className="mx-auto mb-6 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-white/80 p-4 text-center backdrop-blur-sm dark:bg-gray-800/80">
              <div className="mb-1 flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <DollarSign className="h-5 w-5" />
                <span className="text-2xl font-bold">${money}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Money</p>
            </div>
            <div className="rounded-xl bg-white/80 p-4 text-center backdrop-blur-sm dark:bg-gray-800/80">
              <div className="mb-1 flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                <Star className="h-5 w-5" />
                <span className="text-2xl font-bold">{score}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
            </div>
            <div className="rounded-xl bg-white/80 p-4 text-center backdrop-blur-sm dark:bg-gray-800/80">
              <div className="mb-1 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{customers.length}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Customers</p>
            </div>
            <div className="rounded-xl bg-white/80 p-4 text-center backdrop-blur-sm dark:bg-gray-800/80">
              <div className="mb-1 flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold">{gameSpeed.toFixed(1)}x</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Speed</p>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="mx-auto max-w-4xl">
          {/* Restaurant Area */}
          {isPlaying && (
            <div className="relative mb-6 h-[400px] overflow-hidden rounded-2xl border-4 border-amber-300 bg-gradient-to-br from-amber-100 to-orange-100 shadow-2xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-700">
              {/* 2.5D Floor Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid h-full w-full grid-cols-8 grid-rows-8">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`border border-gray-400 ${i % 2 === 0 ? 'bg-amber-200' : 'bg-orange-200'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Customers */}
              {customers.map((customer) => {
                const Icon = FOODS.find((f) => f.type === customer.order)?.icon ?? Coffee
                const colorIndex = customer.id % CUSTOMER_COLORS.length
                const color = CUSTOMER_COLORS[colorIndex] ?? CUSTOMER_COLORS[0]

                return (
                  <div
                    key={customer.id}
                    className={`absolute transition-all duration-300 ${
                      customer.state === 'leaving' ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{
                      left: `${customer.x}px`,
                      top: `${customer.y}px`,
                      transform: 'scale(1)',
                    }}
                  >
                    {/* Customer Character (2.5D isometric style) */}
                    <div className="relative">
                      {/* Shadow */}
                      <div className="absolute -bottom-2 left-1/2 h-3 w-12 -translate-x-1/2 rounded-full bg-black/20 blur-sm" />

                      {/* Character */}
                      <div
                        className="relative h-16 w-12 cursor-pointer rounded-t-full transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        onClick={() => selectedFood && customer.order === selectedFood && serveFood(selectedFood)}
                      >
                        {/* Head */}
                        <div
                          className="absolute left-1/2 top-2 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-white"
                          style={{ backgroundColor: color }}
                        />

                        {/* Order bubble */}
                        <div className="absolute -right-8 -top-2 rounded-lg bg-white p-1.5 shadow-lg">
                          <Icon className="h-4 w-4" style={{ color: FOODS.find((f) => f.type === customer.order)?.color }} />
                        </div>

                        {/* Patience bar */}
                        <div className="absolute -bottom-4 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-gray-300">
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
                    </div>
                  </div>
                )
              })}

              {/* Food Items (Ready to Serve) */}
              {foodItems.map((food, index) => {
                const Icon = FOODS.find((f) => f.type === food.type)?.icon ?? Coffee
                const foodData = FOODS.find((f) => f.type === food.type)
                const isSelected = selectedFood === food.type

                return (
                  <div
                    key={`${food.type}-${index}`}
                    className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 ${
                      isSelected ? 'ring-4 ring-yellow-400' : ''
                    }`}
                    style={{
                      left: `${food.x + index * 50}px`,
                      top: `${food.y}px`,
                    }}
                    onClick={() => setSelectedFood(isSelected ? null : food.type)}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                      style={{ backgroundColor: foodData?.color }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Food Preparation Area */}
          {isPlaying && (
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {FOODS.map((food) => {
                const Icon = food.icon
                const canAfford = money >= food.price
                const isActive = preparingFood === food.type

                return (
                  <button
                    key={food.type}
                    onClick={() => !isActive && prepareFood(food.type)}
                    disabled={!canAfford || isActive}
                    className={`group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-200 ${
                      isActive
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                        : canAfford
                          ? 'border-transparent bg-white hover:scale-105 hover:shadow-xl dark:bg-gray-800'
                          : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50 dark:border-gray-700 dark:bg-gray-800/50'
                    }`}
                  >
                    {/* Preparing animation */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/0 via-yellow-200/50 to-yellow-200/0 animate-pulse" />
                    )}

                    <div className="relative">
                      <div
                        className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl transition-transform group-hover:rotate-12"
                        style={{ backgroundColor: food.color }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <p className="mb-1 text-center font-bold text-gray-900 dark:text-white">
                        {food.name}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">{food.price}</span>
                      </div>
                      {isActive && (
                        <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                          Preparing...
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Upgrades */}
          {isPlaying && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => upgrade('speed')}
                disabled={money < 50}
                className={`rounded-xl border-2 p-4 transition-all ${
                  money >= 50
                    ? 'border-purple-300 bg-purple-50 hover:scale-105 hover:shadow-lg dark:border-purple-700 dark:bg-purple-900/20'
                    : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Speed Up
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">50</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => upgrade('customers')}
                disabled={money < 30}
                className={`rounded-xl border-2 p-4 transition-all ${
                  money >= 30
                    ? 'border-blue-300 bg-blue-50 hover:scale-105 hover:shadow-lg dark:border-blue-700 dark:bg-blue-900/20'
                    : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      More Customers
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">30</span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <Play className="h-5 w-5" />
                Start Game
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
                  Restart
                </button>
              </>
            )}
            {!isPlaying && (
              <button
                onClick={() => setShowInfo(true)}
                className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:scale-105 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                <Info className="h-5 w-5" />
                How to Play
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
