'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Code2, Bug, Zap, Trophy, RotateCcw, Heart } from 'lucide-react'

interface FallingItem {
  id: number
  x: number
  y: number
  type: 'code' | 'bug' | 'bonus'
  icon: string
  speed: number
}

const CODE_SYMBOLS = ['{ }', '< >', '( )', '[ ]', '=>', 'fn', 'const', 'let']
const GAME_WIDTH = 800
const GAME_HEIGHT = 600
const PLAYER_WIDTH = 80
const ITEM_SIZE = 40
const INITIAL_LIVES = 3

export default function GamePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(INITIAL_LIVES)
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2)
  const [items, setItems] = useState<FallingItem[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const gameLoopRef = useRef<number | undefined>(undefined)
  const lastSpawnRef = useRef<number>(0)
  const keysPressed = useRef<Set<string>>(new Set())

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('codeCatcherHighScore')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('codeCatcherHighScore', score.toString())
    }
  }, [score, highScore])

  const spawnItem = useCallback(() => {
    const now = Date.now()
    if (now - lastSpawnRef.current < 800) return

    lastSpawnRef.current = now
    const rand = Math.random()
    const type = rand < 0.7 ? 'code' : rand < 0.9 ? 'bug' : 'bonus'
    const icon =
      type === 'code'
        ? CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)] ?? '{ }'
        : type

    const newItem: FallingItem = {
      id: Date.now() + Math.random(),
      x: Math.random() * (GAME_WIDTH - ITEM_SIZE),
      y: -ITEM_SIZE,
      type,
      icon,
      speed: 2 + Math.random() * 2,
    }

    setItems((prev) => [...prev, newItem])
  }, [])

  const checkCollision = useCallback(
    (item: FallingItem) => {
      return (
        item.y + ITEM_SIZE >= GAME_HEIGHT - 60 &&
        item.y <= GAME_HEIGHT - 20 &&
        item.x + ITEM_SIZE >= playerX &&
        item.x <= playerX + PLAYER_WIDTH
      )
    },
    [playerX]
  )

  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return

    // Spawn items
    spawnItem()

    // Update items
    setItems((prev) => {
      const updated = prev
        .map((item) => ({
          ...item,
          y: item.y + item.speed,
        }))
        .filter((item) => {
          // Check collision
          if (checkCollision(item)) {
            if (item.type === 'code') {
              setScore((s) => s + 10)
            } else if (item.type === 'bonus') {
              setScore((s) => s + 50)
            } else if (item.type === 'bug') {
              setLives((l) => {
                const newLives = l - 1
                if (newLives <= 0) {
                  setGameOver(true)
                  setIsPlaying(false)
                }
                return newLives
              })
            }
            return false
          }

          // Remove if off screen
          if (item.y > GAME_HEIGHT) {
            if (item.type === 'code') {
              setLives((l) => {
                const newLives = l - 1
                if (newLives <= 0) {
                  setGameOver(true)
                  setIsPlaying(false)
                }
                return newLives
              })
            }
            return false
          }

          return true
        })

      return updated
    })

    // Move player
    if (keysPressed.current.has('ArrowLeft')) {
      setPlayerX((x) => Math.max(0, x - 8))
    }
    if (keysPressed.current.has('ArrowRight')) {
      setPlayerX((x) => Math.min(GAME_WIDTH - PLAYER_WIDTH, x + 8))
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [isPlaying, gameOver, spawnItem, checkCollision])

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current)
        }
      }
    }
  }, [isPlaying, gameOver, gameLoop])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        keysPressed.current.add(e.key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const startGame = () => {
    setIsPlaying(true)
    setGameOver(false)
    setScore(0)
    setLives(INITIAL_LIVES)
    setItems([])
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2)
    lastSpawnRef.current = 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-24 pb-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-800 backdrop-blur-sm dark:border-indigo-800/50 dark:bg-gray-900/70 dark:text-indigo-200">
            <Code2 className="h-4 w-4" />
            <span>Interactive Demo</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Code Catcher
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-200">
            Catch the good code, avoid the bugs! Use{' '}
            <kbd className="rounded bg-gray-200 px-2 py-1 text-sm font-mono dark:bg-gray-700">←</kbd>{' '}
            <kbd className="rounded bg-gray-200 px-2 py-1 text-sm font-mono dark:bg-gray-700">→</kbd>{' '}
            to move
          </p>
        </div>

        {/* Game Container */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200/50 bg-white/90 p-6 shadow-xl backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/90 md:p-8">
            {/* Stats */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{score}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Lives</div>
                    <div className="flex gap-1">
                      {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-6 w-6 rounded ${
                            i < lives
                              ? 'bg-red-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">High Score</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {highScore}
                </div>
              </div>
            </div>

            {/* Game Canvas */}
            <div
              className="relative mx-auto overflow-hidden rounded-xl border-2 border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-900 dark:to-gray-800"
              style={{
                width: `min(${GAME_WIDTH}px, 100%)`,
                height: `${GAME_HEIGHT}px`,
                maxWidth: '100%',
              }}
            >
              {/* Game items */}
              {isPlaying &&
                items.map((item) => (
                  <div
                    key={item.id}
                    className="absolute flex items-center justify-center font-mono text-2xl font-bold transition-none"
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: `${ITEM_SIZE}px`,
                      height: `${ITEM_SIZE}px`,
                    }}
                  >
                    {item.type === 'code' ? (
                      <span className="text-indigo-600 dark:text-indigo-400">{item.icon}</span>
                    ) : item.type === 'bonus' ? (
                      <Zap className="h-8 w-8 text-yellow-500" />
                    ) : (
                      <Bug className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                ))}

              {/* Player */}
              {isPlaying && (
                <div
                  className="absolute bottom-5 flex items-center justify-center transition-none"
                  style={{
                    left: `${playerX}px`,
                    width: `${PLAYER_WIDTH}px`,
                    height: '50px',
                  }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}

              {/* Start/Game Over Screen */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
                    {gameOver ? (
                      <>
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                          Game Over!
                        </h2>
                        <p className="mb-2 text-xl text-gray-700 dark:text-gray-200">
                          Final Score: <span className="font-bold text-indigo-600">{score}</span>
                        </p>
                        {score === highScore && score > 0 && (
                          <p className="mb-6 text-yellow-600 dark:text-yellow-400">
                            🎉 New High Score!
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                          Ready to Play?
                        </h2>
                        <div className="mb-6 space-y-2 text-left text-gray-700 dark:text-gray-200">
                          <p>
                            ✅ Catch <span className="font-mono text-indigo-600">code</span>{' '}
                            symbols: +10 points
                          </p>
                          <p>
                            ⚡ Catch <span className="text-yellow-600">bonus</span>: +50 points
                          </p>
                          <p>
                            ❌ Avoid <span className="text-red-600">bugs</span>: -1 life
                          </p>
                          <p>⚠️ Don't miss code symbols: -1 life</p>
                        </div>
                      </>
                    )}
                    <button
                      onClick={startGame}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-base font-semibold text-white transition-all hover:shadow-xl hover:shadow-indigo-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      {gameOver ? (
                        <>
                          <RotateCcw className="h-5 w-5" />
                          Play Again
                        </>
                      ) : (
                        <>
                          <Code2 className="h-5 w-5" />
                          Start Game
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                <div className="mb-1 font-mono text-2xl text-indigo-600 dark:text-indigo-400">
                  {'{ }'}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Code +10</div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <Zap className="mx-auto mb-1 h-8 w-8 text-yellow-500" />
                <div className="text-sm text-gray-700 dark:text-gray-300">Bonus +50</div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <Bug className="mx-auto mb-1 h-8 w-8 text-red-500" />
                <div className="text-sm text-gray-700 dark:text-gray-300">Bug -1 ❤️</div>
              </div>
            </div>
          </div>

          {/* Tech Stack Info */}
          <div className="mt-8 rounded-2xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/70">
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Built With Modern Tech
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {[
                { name: 'React 19', desc: 'Component Architecture' },
                { name: 'TypeScript', desc: 'Type Safety' },
                { name: 'requestAnimationFrame', desc: 'Smooth 60fps' },
                { name: 'Tailwind CSS', desc: 'Responsive Design' },
              ].map((tech) => (
                <div key={tech.name} className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">{tech.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{tech.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
