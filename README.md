# Sylphx Website

現代化的公司網站，使用 React, Next.js, Zen state management, 和 Tailwind CSS 構建。

## 🎯 項目簡介

純前端展示網站，無後台、無認證、無數據庫。專注於內容展示和品牌形象。

## 🛠 技術棧

- **框架**: Next.js 16 with App Router + Turbopack
- **運行時**: Bun
- **語言**: TypeScript
- **狀態管理**: Zen (@sylphx/zen) - 僅用於 Toast 通知
- **樣式**: Tailwind CSS
- **代碼質量**: Biome (linting + formatting)
- **UI 庫**: React 19

## 📁 項目結構

```
src/
├── app/                    # Next.js App Router 頁面
│   ├── about/             # 關於我們
│   ├── products/          # 產品展示
│   ├── technologies/      # 技術棧
│   ├── contact/           # 聯繫我們
│   ├── careers/           # 招聘頁面
│   ├── privacy/           # 隱私政策
│   ├── terms/             # 服務條款
│   ├── cookies/           # Cookie 政策
│   ├── layout.tsx         # 根佈局 (header + footer)
│   └── page.tsx           # 首頁
├── components/            # React 組件
│   ├── AppHeader.tsx      # 導航欄
│   ├── AppFooter.tsx      # 頁腳
│   └── Toast.tsx          # 通知組件
├── stores/                # Zen 狀態
│   └── toast.ts           # Toast 狀態管理
└── hooks/                 # 自定義 Hooks
    └── useZen.ts          # Zen React 集成
```

## 🚀 快速開始

### 前置要求

- Bun 1.3.1 或更高版本

### 安裝

```bash
bun install
```

### 開發

```bash
bun run dev
```

訪問 [http://localhost:3000](http://localhost:3000)

### 構建

```bash
bun run build
```

### 生產環境運行

```bash
bun run start
```

### 代碼質量

```bash
# 檢查代碼
bun run lint

# 自動修復
bun run lint:fix

# 格式化代碼
bun run format
```

## 📄 頁面列表

- `/` - 首頁
- `/about` - 關於我們
- `/products` - 產品展示 (SylphNote, SylphChat, VortexVR)
- `/technologies` - 技術棧介紹
- `/contact` - 聯繫表單
- `/careers` - 招聘信息
- `/privacy` - 隱私政策
- `/terms` - 服務條款
- `/cookies` - Cookie 政策

## 🎨 功能特性

### ✅ 已完成
- ✅ 響應式設計 (手機/平板/桌面)
- ✅ 深色模式支持
- ✅ 滾動效果導航欄
- ✅ Toast 通知系統
- ✅ 完整的公司頁面
- ✅ SEO 友好
- ✅ TypeScript 類型安全
- ✅ Biome 代碼質量保證

### 🎭 設計亮點
- 漸變色背景
- 卡片式佈局
- 流暢動畫過渡
- 蝴蝶 emoji 作為 logo 🦋
- 現代化 UI/UX

## 🧘 Zen 狀態管理

項目使用 [@sylphx/zen](https://github.com/SylphxAI/zen) - 超輕量級狀態管理庫 (僅 1.45 kB gzipped)。

```typescript
// 創建 store
import { deepMap, setPath } from '@sylphx/zen'

export const toastStore = deepMap({ toasts: [] })

// 在組件中使用
import { useDeepMap } from '@/hooks/useZen'

function MyComponent() {
  const state = useDeepMap(toastStore)
  return <div>{state.toasts.length} notifications</div>
}

// 從任何地方更新
setPath(toastStore, ['toasts'], [...toasts, newToast])
```

## 🌐 部署

### Vercel (推薦)

```bash
# 安裝 Vercel CLI
bun add -g vercel

# 部署
vercel
```

### 其他平台

項目可部署到任何支持 Next.js 的平台:
- Netlify
- Cloudflare Pages
- AWS Amplify
- 自托管

## 📊 性能

- ⚡️ Turbopack 開發模式
- 🎯 按需加載頁面
- 📦 優化的生產構建
- 🖼 圖片優化 (需添加 Next.js Image)
- 💨 Bun 快速安裝和運行

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📝 許可證

MIT

## 📞 聯繫方式

- Email: hi@sylphx.com
- Twitter: [@sylphxlab](https://twitter.com/sylphxlab)
- GitHub: [@SylphxAI](https://github.com/SylphxAI)

---

使用 ❤️ 和 🦋 構建
