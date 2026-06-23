# Agri Admin

農產品直銷平台管理後台。基於 React + TypeScript + Vite + Material-UI 構建。

## 快速開始

### 環境要求
- Node.js 18+
- npm 或 yarn

### 1. 安裝依賴

```bash
cd agri-admin
npm install
```

### 2. 環境配置

複製 `.env.example` 為 `.env.local`（如果存在），並配置 API 服務地址：

```bash
VITE_API_BASE_URL=http://localhost:8000
```

### 3. 開發服務

啟動開發服務器：
```bash
npm run dev
```

預設運行在 `http://localhost:5173`

### 4. 生產構建

構建生產版本：
```bash
npm run build
```

生成的文件位於 `dist/` 目錄。

## 可用腳本

- `npm run dev` - 啟動開發服務器
- `npm run build` - 構建生產版本
- `npm run preview` - 本地預覽生產構建
- `npm run lint` - 運行 ESLint

## 核心功能

### 數據管理

- **產品管理** - 創建、編輯、刪除商品及分類
- **庫存管理** - 庫存查詢、進出賬管理
- **訂單管理** - 訂單查詢、狀態更新、配送管理
- **用戶管理** - 用戶賬號、角色權限管理
- **優惠券管理** - 創建及管理優惠券
- **Email 模板** - 配置訂單狀態通知郵件
- **首頁內容管理** - 編輯首頁、產品頁、訂單查詢頁的文字和圖片

### 文件上傳

- 商品圖片上傳（自動轉換 WebP）
- 頁面資源上傳（首頁 banner、訂單查詢頁圖片等）

## 項目結構

```
src/
├── api/                 # API 服務層
│   ├── base/           # 基礎 API 配置
│   ├── site-content/   # 頁面內容管理 API
│   └── ...
├── components/         # React 組件
│   ├── layout/         # 佈局組件
│   ├── dialogs/        # 對話框
│   └── common/         # 通用組件
├── pages/              # 頁面組件
│   ├── ProductsPage.tsx
│   ├── OrdersPage.tsx
│   ├── SiteContentPage.tsx  # 首頁內容管理
│   └── ...
├── routes/             # 路由配置
├── theme/              # 主題配置
└── main.tsx
```

## 首頁內容管理

進入後台左側菜單 **"首頁內容管理"** 可編輯：

### 可管理的內容

1. **主視覺區塊** - 首頁英雄圖、標題、按鈕文案
2. **說明圖區塊** - 兩個展示段落及配圖
3. **流程與底部 CTA** - 三步流程與底部行動號召
4. **產品/訂購流程頁頂部圖** - 商品頁與訂購流程頁共用 banner
5. **訂單查詢頁內容** - 查詢頁說明文案與右側圖片
6. **Footer 文案** - 頁腳標題、按鈕文案、社群鏈接（Facebook/Instagram/YouTube）

所有圖片上傳至 Supabase `pages` bucket，文字改動實時生效。

## 認證

- 使用 JWT Token 進行身份驗證
- Token 存儲在 localStorage 中
- 自動刷新過期 Token

## 開發約定

### TypeScript
- 嚴格模式啟用
- 優先使用類型推斷，避免過度註釋

### 組件
- 功能組件優先
- 使用 React Hooks

### 樣式
- Material-UI 組件庫
- sx prop 用於自定義樣式
- 避免創建全局 CSS

## 常見問題

### 連接 API 失敗
- 檢查 `.env.local` 中 VITE_API_BASE_URL 配置
- 確保後端服務已啟動
- 檢查瀏覽器控制台錯誤信息

### 圖片上傳失敗
- 驗證用戶權限（需要管理員或員工角色）
- 檢查文件格式和大小
- 查看網絡請求失敗原因

## 部署

構建後的 `dist` 目錄可部署到任何靜態服務器（Nginx、Apache 等）或 CDN。

確保配置 API 基礎 URL 指向正確的後端服務地址。
