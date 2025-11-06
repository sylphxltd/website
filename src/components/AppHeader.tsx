'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const headerLinks = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Technologies', path: '/technologies' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

export function AppHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActiveRoute = (path: string) => {
    return pathname === path
  }

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div
              className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded transition-colors ${
                isScrolled
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                  : 'bg-white dark:bg-gradient-to-br dark:from-indigo-600 dark:to-purple-600'
              }`}
            >
              <span className="text-2xl">🦋</span>
            </div>
            <span
              className={`text-xl font-bold transition-colors ${
                isScrolled ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
              }`}
            >
              Sylphx
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-1 md:flex">
            {headerLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActiveRoute(link.path)
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : isScrolled
                      ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      : 'text-gray-800 hover:bg-white/20 hover:text-gray-900 dark:text-white dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 dark:border-gray-700 md:hidden">
            <nav className="flex flex-col space-y-2">
              {headerLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    isActiveRoute(link.path)
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
