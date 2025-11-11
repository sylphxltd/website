<div align="center">

# Sylphx Website 🦋

**現代化的公司網站 - 展示創新產品與技術實力**

[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://github.com/SylphxAI/website/blob/main/LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Bun-1.3+-orange?style=flat-square&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)

**Turbopack 開發** • **Zen 狀態管理** • **響應式設計** • **深色模式**

[網站](https://sylphx.com) • [產品](#-產品展示) • [技術棧](#-技術棧)

</div>

---

## 🚀 項目概覽

Sylphx 公司官網 - 使用最新技術構建的現代化展示網站，專注於品牌形象和產品推廣。

**傳統問題**:
```
企業網站開發痛點:
- 複雜的後台系統（維護成本高）
- 笨重的框架（加載緩慢）
- 過時的狀態管理（Bundle 體積大）
- 開發體驗差（編譯慢）
```

**我們的方案**:
```
Sylphx Website:
- 純前端架構 - 零後台、零數據庫 🎯
- Next.js 16 + Turbopack - 極速開發體驗 ⚡
- Zen 狀態管理 - 僅 1.45 kB gzipped 📦
- Bun 運行時 - 快速安裝和構建 🚀
```

**結果: 極簡架構、極速性能、極致開發體驗。**

---

## ⚡ 性能特性

### 開發效率提升

| 指標 | 數據 | 技術 |
|------|------|------|
| **開發構建速度** | 超快 | Turbopack (比 Webpack 快 700 倍) |
| **包管理速度** | 2-3 倍提升 | Bun vs npm |
| **狀態管理體積** | **1.45 kB** | Zen (比 Redux 小 95%) |
| **頁面加載** | 按需加載 | Next.js App Router |
| **代碼質量** | 50 倍速 | Biome vs ESLint |

### 用戶體驗優化

- **⚡ 快速響應** - Turbopack 熱更新，開發體驗極致流暢
- **📱 響應式設計** - 完美適配手機/平板/桌面
- **🌙 深色模式** - 自適應系統主題偏好
- **🎨 流暢動畫** - 現代化 UI/UX 設計
- **🔍 SEO 友好** - Next.js 服務端渲染優化

---

## 🛠 技術棧

| 組件 | 技術 | 版本 |
|------|------|------|
| **框架** | Next.js with App Router | 16 |
| **運行時** | Bun | 1.3.1+ |
| **語言** | TypeScript | 5.0+ |
| **狀態管理** | Zen (@sylphx/zen) | Latest |
| **樣式** | Tailwind CSS | Latest |
| **代碼質量** | Biome | Latest |
| **UI 庫** | React | 19 |
| **構建工具** | Turbopack | Next.js 16 內置 |

---

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

---

## 🚀 快速開始

### 前置要求

- **Bun** 1.3.1 或更高版本

### 安裝依賴

```bash
# 克隆倉庫
git clone https://github.com/SylphxAI/website.git
cd website

# 安裝依賴
bun install
```

### 開發模式

```bash
# 啟動開發服務器 (使用 Turbopack)
bun run dev
```

訪問 [http://localhost:3000](http://localhost:3000) 查看網站。

### 生產構建

```bash
# 構建生產版本
bun run build

# 運行生產服務器
bun run start
```

### 代碼質量檢查

```bash
# 檢查代碼規範
bun run lint

# 自動修復問題
bun run lint:fix

# 格式化代碼
bun run format
```

---

## 📄 網站頁面

### 核心頁面

| 路由 | 描述 | 功能 |
|------|------|------|
| `/` | 首頁 | 品牌展示、產品概覽 |
| `/about` | 關於我們 | 公司介紹、團隊信息 |
| `/products` | 產品展示 | SylphNote、SylphChat、VortexVR |
| `/technologies` | 技術棧 | 技術實力展示 |
| `/contact` | 聯繫我們 | 聯繫表單 |
| `/careers` | 招聘信息 | 職位發布 |

### 法律頁面

| 路由 | 描述 |
|------|------|
| `/privacy` | 隱私政策 |
| `/terms` | 服務條款 |
| `/cookies` | Cookie 政策 |

---

## 💼 產品展示

### SylphNote
智能筆記應用，整合 AI 輔助功能

### SylphChat
現代化即時通訊平台

### VortexVR
虛擬現實體驗解決方案

---

## 🧘 Zen 狀態管理

項目使用 [@sylphx/zen](https://github.com/SylphxAI/zen) - 超輕量級、高性能的狀態管理庫。

**性能對比**:
- **Bundle 體積**: 僅 **1.45 kB** gzipped (Redux ~30 kB)
- **性能**: 比 Immer 快 **1.7-45 倍**
- **API**: 簡潔直觀，零學習成本

### 使用示例

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

---

## 🌐 部署

### Vercel (推薦)

```bash
# 安裝 Vercel CLI
bun add -g vercel

# 部署到生產環境
vercel --prod
```

一鍵部署: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SylphxAI/website)

### 其他平台

項目可部署到任何支持 Next.js 的平台:

| 平台 | 支持 |
|------|------|
| **Netlify** | ✅ |
| **Cloudflare Pages** | ✅ |
| **AWS Amplify** | ✅ |
| **自托管** | ✅ |

---

## 🎨 設計特色

### 視覺設計

- **🌈 漸變色背景** - 現代化視覺效果
- **🃏 卡片式佈局** - 清晰的信息層級
- **✨ 流暢動畫** - 精心設計的過渡效果
- **🦋 蝴蝶 Logo** - 獨特的品牌標識
- **🎯 極簡風格** - 專注內容，減少干擾

### 技術亮點

- **響應式設計** - Mobile-first 設計理念
- **深色模式** - 自動適應系統主題
- **滾動效果導航欄** - 智能顯隱
- **Toast 通知系統** - 優雅的用戶反饋
- **TypeScript 全覆蓋** - 100% 類型安全
- **Biome 質量保證** - 統一的代碼風格

---

## 📊 性能優化

### 構建優化

| 優化項 | 技術方案 | 效果 |
|--------|----------|------|
| **開發速度** | Turbopack | 700 倍提升 vs Webpack |
| **包管理** | Bun | 2-3 倍速 vs npm |
| **頁面加載** | 按需加載 | 減少初始 Bundle |
| **代碼分割** | Next.js 自動分割 | 優化加載性能 |
| **圖片優化** | Next.js Image | 自動格式轉換 |

### 運行時優化

- **⚡ 極小狀態管理** - Zen 僅 1.45 kB
- **🎯 零後台依賴** - 純靜態站點，CDN 友好
- **📦 Tree-shaking** - 移除未使用代碼
- **🚀 Edge Runtime** - Vercel Edge 部署

---

## 🛠️ 開發工作流

### 本地開發

```bash
# 1. 安裝依賴
bun install

# 2. 啟動開發服務器
bun run dev

# 3. 檢查代碼質量
bun run lint

# 4. 格式化代碼
bun run format
```

### 生產發布

```bash
# 1. 運行代碼檢查
bun run lint

# 2. 構建生產版本
bun run build

# 3. 本地測試生產構建
bun run start

# 4. 部署到 Vercel
vercel --prod
```

---

## 🎯 SEO 優化

網站已針對搜索引擎優化:

- ✅ **語義化 HTML** - 正確使用標籤結構
- ✅ **Meta 標籤** - 完整的頁面元數據
- ✅ **Open Graph** - 社交媒體分享優化
- ✅ **Sitemap** - 自動生成站點地圖
- ✅ **Robots.txt** - 搜索引擎抓取配置
- ✅ **服務端渲染** - Next.js SSR/SSG

---

## 🗺️ 路線圖

**✅ 已完成**
- [x] 響應式設計 (手機/平板/桌面)
- [x] 深色模式支持
- [x] 滾動效果導航欄
- [x] Toast 通知系統
- [x] 完整的公司頁面
- [x] SEO 優化
- [x] TypeScript 類型安全
- [x] Biome 代碼質量保證

**🚀 計劃中**
- [ ] 多語言支持 (英文/繁體/簡體)
- [ ] 博客系統集成
- [ ] 案例研究頁面
- [ ] 客戶評價展示
- [ ] 性能監控儀表板
- [ ] A/B 測試集成

---

## 🤝 支持

[![GitHub Issues](https://img.shields.io/github/issues/SylphxAI/website?style=flat-square)](https://github.com/SylphxAI/website/issues)

- 🐛 [Bug 反饋](https://github.com/SylphxAI/website/issues)
- 💬 [討論區](https://github.com/SylphxAI/website/discussions)
- 📧 [電郵聯繫](mailto:hi@sylphx.com)

**支持我們:**
⭐ Star • 👀 Watch • 🐛 反饋問題 • 💡 功能建議 • 🔀 貢獻代碼

---

## 📄 許可證

MIT © [Sylphx](https://sylphx.com)

---

## 🙏 致謝

構建技術:
- [Next.js](https://nextjs.org) - React 框架
- [Bun](https://bun.sh) - 極速運行時
- [Zen](https://github.com/SylphxAI/zen) - 狀態管理
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [Biome](https://biomejs.dev) - 代碼質量工具

特別感謝開源社區 ❤️

---

<p align="center">
  <strong>現代化。極速。優雅。</strong>
  <br>
  <sub>使用最新技術構建的公司官網</sub>
  <br><br>
  <a href="https://sylphx.com">sylphx.com</a> •
  <a href="https://x.com/SylphxAI">@SylphxAI</a> •
  <a href="mailto:hi@sylphx.com">hi@sylphx.com</a>
</p>
