import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { AppFooter } from '@/components/AppFooter'
import { AppHeader } from '@/components/AppHeader'
import { ToastContainer } from '@/components/Toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sylphx - Democratizing AI Through Elegant Code',
  description:
    'Production-ready, open-source AI infrastructure. 5-10x faster PDF processing, 1.7-45x faster state management, 94% test coverage. Built for developers.',
  metadataBase: new URL('https://sylphx.com'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#4f46e5',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sylphx.com',
    siteName: 'Sylphx',
    title: 'Sylphx - Democratizing AI Through Elegant Code',
    description:
      'Production-ready, open-source AI infrastructure. Build faster, safer, and more reliable AI applications.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Sylphx - Democratizing AI Through Elegant Code',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sylphxlab',
    creator: '@sylphxlab',
    title: 'Sylphx - Democratizing AI Through Elegant Code',
    description:
      'Production-ready, open-source AI infrastructure. Build faster, safer, and more reliable AI applications.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <AppHeader />
        <main className="min-h-screen">{children}</main>
        <AppFooter />
        <ToastContainer />
      </body>
    </html>
  )
}
