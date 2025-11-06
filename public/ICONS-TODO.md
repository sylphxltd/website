# Icons Generation TODO

## 已創建 ✅
- `favicon.svg` - Modern SVG favicon (works in all modern browsers)
- `og-image.svg` - Open Graph sharing image (1200x630)
- `site.webmanifest` - PWA manifest file

## 需要生成 📝

使用在線工具或設計軟件將 `favicon.svg` 轉換為以下格式：

### 1. favicon.ico
- 尺寸: 16x16, 32x32, 48x48 (multi-size ICO)
- 工具: https://realfavicongenerator.net/
- 或使用: ImageMagick, GIMP, Sketch, Figma

### 2. Apple Touch Icon
- 文件名: `apple-touch-icon.png`
- 尺寸: 180x180px
- 格式: PNG

### 3. Android/PWA Icons
- `icon-192.png` - 192x192px
- `icon-512.png` - 512x512px
- 格式: PNG
- 用途: Android home screen, PWA

## 快速生成步驟

### 方法 1: RealFaviconGenerator (推薦)
1. 訪問 https://realfavicongenerator.net/
2. 上傳 `favicon.svg`
3. 調整各平台設置
4. 下載並替換 public 目錄中的文件

### 方法 2: Favicon.io
1. 訪問 https://favicon.io/favicon-converter/
2. 上傳 `favicon.svg`
3. 下載生成的文件包
4. 解壓到 public 目錄

### 方法 3: ImageMagick CLI
```bash
# 生成 favicon.ico (多尺寸)
convert favicon.svg -define icon:auto-resize=16,32,48 favicon.ico

# 生成 Apple Touch Icon
convert favicon.svg -resize 180x180 apple-touch-icon.png

# 生成 PWA icons
convert favicon.svg -resize 192x192 icon-192.png
convert favicon.svg -resize 512x512 icon-512.png
```

## 驗證

生成完成後，檢查以下文件是否存在：
- [ ] favicon.svg ✅
- [ ] favicon.ico
- [ ] apple-touch-icon.png
- [ ] icon-192.png
- [ ] icon-512.png
- [ ] og-image.svg ✅
- [ ] site.webmanifest ✅

## 測試

1. 本地測試: 清除瀏覽器緩存後訪問 http://localhost:3000
2. 分享測試: 使用 https://www.opengraph.xyz/ 或 https://cards-dev.twitter.com/validator
3. PWA 測試: Chrome DevTools > Application > Manifest
