<div align="center">

# Sylphx Website 🦋

**Modern company website built with cutting-edge tech stack**

[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://github.com/SylphxAI/website/blob/main/LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Bun-1.3+-orange?style=flat-square&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)

**Turbopack dev** • **Zen state** • **Responsive design** • **Dark mode**

[Website](https://sylphx.com) • [Tech Stack](#-tech-stack) • [Features](#-features)

</div>

---

## 🚀 Overview

Modern company website built with Next.js 16, featuring Turbopack for blazing-fast development, Zen for minimal state management, and a clean, responsive design.

**The Problem:**
```
Traditional corporate websites:
- Complex backend systems (high maintenance) ❌
- Heavy frameworks (slow loading) ❌
- Outdated state management (large bundles) ❌
- Poor developer experience (slow builds) ❌
```

**The Solution:**
```
Sylphx Website:
- Pure frontend architecture (zero backend) ✅
- Next.js 16 + Turbopack (fast dev experience) ✅
- Zen state management (1.45 KB gzipped) ✅
- Bun runtime (fast install & build) ✅
```

**Result: Minimal architecture, maximum performance, excellent developer experience.**

---

## ⚡ Performance Features

### Development Efficiency

| Metric | Value | Technology |
|--------|-------|------------|
| **Dev build speed** | Ultra-fast | Turbopack (700x faster than Webpack) |
| **Package management** | 2-3x faster | Bun vs npm |
| **State management** | **1.45 KB** | Zen (95% smaller than Redux) |
| **Page loading** | On-demand | Next.js App Router |
| **Code quality** | 50x faster | Biome vs ESLint |

### User Experience

- **⚡ Fast response** - Turbopack HMR for smooth development
- **📱 Responsive design** - Perfect on mobile/tablet/desktop
- **🌙 Dark mode** - Auto-adapts to system preference
- **🎨 Smooth animations** - Modern UI/UX design
- **🔍 SEO friendly** - Next.js SSR optimization

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Next.js with App Router | 16 |
| **Runtime** | Bun | 1.3.1+ |
| **Language** | TypeScript | 5.0+ |
| **State Management** | Zen (@sylphx/zen) | Latest |
| **Styling** | Tailwind CSS | Latest |
| **Code Quality** | Biome | Latest |
| **UI Library** | React | 19 |
| **Build Tool** | Turbopack | Next.js 16 built-in |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/             # About us
│   ├── products/          # Product showcase
│   ├── technologies/      # Tech stack
│   ├── contact/           # Contact form
│   ├── careers/           # Career opportunities
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   ├── cookies/           # Cookie policy
│   ├── layout.tsx         # Root layout (header + footer)
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── AppHeader.tsx      # Navigation bar
│   ├── AppFooter.tsx      # Footer
│   └── Toast.tsx          # Toast notifications
├── stores/                # Zen state
│   └── toast.ts           # Toast state management
└── hooks/                 # Custom hooks
    └── useZen.ts          # Zen React integration
```

---

## 🚀 Quick Start

### Prerequisites

- **Bun** 1.3.1 or higher

### Installation

```bash
# Clone repository
git clone https://github.com/SylphxAI/website.git
cd website

# Install dependencies
bun install
```

### Development

```bash
# Start dev server (with Turbopack)
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the website.

### Production Build

```bash
# Build for production
bun run build

# Run production server
bun run start
```

### Code Quality

```bash
# Check code standards
bun run lint

# Auto-fix issues
bun run lint:fix

# Format code
bun run format
```

---

## 📄 Website Pages

### Core Pages

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Homepage | Brand showcase, product overview |
| `/about` | About us | Company intro, team info |
| `/products` | Product showcase | SylphNote, SylphChat, VortexVR |
| `/technologies` | Tech stack | Technology capabilities |
| `/contact` | Contact us | Contact form |
| `/careers` | Career opportunities | Job postings |

### Legal Pages

| Route | Description |
|-------|-------------|
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/cookies` | Cookie policy |

---

## 💼 Featured Products

### SylphNote
Intelligent note-taking app with AI assistance

### SylphChat
Modern instant messaging platform

### VortexVR
Virtual reality experience solutions

---

## 🧘 Zen State Management

This project uses [@sylphx/zen](https://github.com/SylphxAI/zen) - ultra-lightweight, high-performance state management library.

**Performance Comparison**:
- **Bundle size**: Only **1.45 KB** gzipped (Redux ~30 KB)
- **Performance**: **1.7-45x faster** than Immer
- **API**: Simple and intuitive, zero learning curve

### Usage Example

```typescript
// Create store
import { deepMap, setPath } from '@sylphx/zen'

export const toastStore = deepMap({ toasts: [] })

// Use in component
import { useDeepMap } from '@/hooks/useZen'

function MyComponent() {
  const state = useDeepMap(toastStore)
  return <div>{state.toasts.length} notifications</div>
}

// Update from anywhere
setPath(toastStore, ['toasts'], [...toasts, newToast])
```

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy to production
vercel --prod
```

One-click deploy: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SylphxAI/website)

### Other Platforms

Project can be deployed to any platform supporting Next.js:

| Platform | Support |
|----------|---------|
| **Netlify** | ✅ |
| **Cloudflare Pages** | ✅ |
| **AWS Amplify** | ✅ |
| **Self-hosted** | ✅ |

---

## 🎨 Design Features

### Visual Design

- **🌈 Gradient backgrounds** - Modern visual effects
- **🃏 Card-based layout** - Clear information hierarchy
- **✨ Smooth animations** - Carefully designed transitions
- **🦋 Butterfly logo** - Unique brand identity
- **🎯 Minimalist style** - Focus on content, reduce distractions

### Technical Highlights

- **Responsive design** - Mobile-first design philosophy
- **Dark mode** - Auto-adapts to system theme
- **Scroll navigation** - Smart show/hide
- **Toast notification system** - Elegant user feedback
- **TypeScript coverage** - 100% type safety
- **Biome quality assurance** - Unified code style

---

## 📊 Performance Optimization

### Build Optimization

| Optimization | Technical Solution | Effect |
|--------------|-------------------|--------|
| **Dev speed** | Turbopack | 700x faster vs Webpack |
| **Package management** | Bun | 2-3x faster vs npm |
| **Page loading** | On-demand loading | Reduce initial bundle |
| **Code splitting** | Next.js auto-split | Optimize load performance |
| **Image optimization** | Next.js Image | Auto format conversion |

### Runtime Optimization

- **⚡ Minimal state management** - Zen only 1.45 KB
- **🎯 Zero backend dependencies** - Pure static site, CDN friendly
- **📦 Tree-shaking** - Remove unused code
- **🚀 Edge Runtime** - Vercel Edge deployment

---

## 🛠️ Development Workflow

### Local Development

```bash
# 1. Install dependencies
bun install

# 2. Start dev server
bun run dev

# 3. Check code quality
bun run lint

# 4. Format code
bun run format
```

### Production Release

```bash
# 1. Run code checks
bun run lint

# 2. Build production version
bun run build

# 3. Test production build locally
bun run start

# 4. Deploy to Vercel
vercel --prod
```

---

## 🎯 SEO Optimization

Website is optimized for search engines:

- ✅ **Semantic HTML** - Proper tag structure
- ✅ **Meta tags** - Complete page metadata
- ✅ **Open Graph** - Social media sharing optimization
- ✅ **Sitemap** - Auto-generated sitemap
- ✅ **Robots.txt** - Search engine crawl configuration
- ✅ **Server-side rendering** - Next.js SSR/SSG

---

## 🗺️ Roadmap

**✅ Completed**
- [x] Responsive design (mobile/tablet/desktop)
- [x] Dark mode support
- [x] Scroll navigation effect
- [x] Toast notification system
- [x] Complete company pages
- [x] SEO optimization
- [x] TypeScript type safety
- [x] Biome code quality

**🚀 Planned**
- [ ] Multi-language support (English/Traditional/Simplified Chinese)
- [ ] Blog system integration
- [ ] Case study pages
- [ ] Customer testimonials
- [ ] Performance monitoring dashboard
- [ ] A/B testing integration

---

## 🤝 Support

[![GitHub Issues](https://img.shields.io/github/issues/SylphxAI/website?style=flat-square)](https://github.com/SylphxAI/website/issues)

- 🐛 [Bug Reports](https://github.com/SylphxAI/website/issues)
- 💬 [Discussions](https://github.com/SylphxAI/website/discussions)
- 📧 [Email](mailto:hi@sylphx.com)

**Show Your Support:**
⭐ Star • 👀 Watch • 🐛 Report bugs • 💡 Suggest features • 🔀 Contribute

---

## 📄 License

MIT © [Sylphx](https://sylphx.com)

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org) - React framework
- [Bun](https://bun.sh) - Fast runtime
- [Zen](https://github.com/SylphxAI/zen) - State management
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Biome](https://biomejs.dev) - Code quality tools

Special thanks to the open source community ❤️

---

<p align="center">
  <strong>Modern. Fast. Elegant.</strong>
  <br>
  <sub>Company website built with cutting-edge technology</sub>
  <br><br>
  <a href="https://sylphx.com">sylphx.com</a> •
  <a href="https://x.com/SylphxAI">@SylphxAI</a> •
  <a href="mailto:hi@sylphx.com">hi@sylphx.com</a>
</p>
