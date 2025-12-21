# My Cafe Demo: Cloudflare Workers + Hono JSX SSR 変換計画

## 概要
現在のViteベースのバニラJavaScript MPAを、Cloudflare Workers上で動作するHono + JSXによるサーバーサイドレンダリング（SSR）アプリケーションに変換する。

## 現状
- **ビルドツール**: Vite 7.3.0
- **スタイリング**: Tailwind CSS v4
- **データ**: JSON Server (port 3001) + db.json
- **状態管理**: LocalStorage (cart, auth)
- **ページ**: Home, Products, Product Detail, Cart, Profile

## 技術選定: Hono + JSX
- **Hono**: Cloudflare Workers向けに最適化された軽量Webフレームワーク
- **JSX**: TypeScript型安全、追加ビルドステップ不要
- **JWT Cookie**: ステートレス環境での状態管理

---

## 新アーキテクチャ

### ディレクトリ構成
```
my-cafe-demo/
├── src/
│   ├── index.tsx               # Workerエントリーポイント
│   ├── routes/                 # ルートハンドラ
│   │   ├── home.tsx
│   │   ├── products.tsx
│   │   ├── cart.tsx
│   │   ├── profile.tsx
│   │   └── api.ts              # カート/認証API（JSON）
│   ├── components/             # JSXコンポーネント
│   │   ├── Layout.tsx          # メインレイアウト
│   │   ├── Header.tsx          # ヘッダー
│   │   ├── Footer.tsx          # フッター
│   │   └── ProductCard.tsx     # 商品カード
│   ├── services/
│   │   └── productService.ts   # 商品データアクセス
│   ├── middleware/
│   │   ├── auth.ts             # JWT認証
│   │   └── cart.ts             # カートミドルウェア
│   └── types/
│       └── index.ts            # TypeScript型定義
├── public/                      # 静的アセット
│   ├── css/
│   │   ├── input.css           # Tailwind入力
│   │   └── styles.css          # ビルド済みCSS
│   ├── js/
│   │   └── client.js           # クライアントJS（AJAX）
│   └── images/                 # 既存画像
├── db.json                      # 商品データ（ビルド時にバンドル）
├── wrangler.json                # Wrangler設定
├── package.json
└── tsconfig.json
```

---

## 依存パッケージ

### 追加
```json
{
  "dependencies": {
    "hono": "^4.0.0",
    "@tsndr/cloudflare-worker-jwt": "^2.5.0"
  },
  "devDependencies": {
    "wrangler": "^3.0.0",
    "@cloudflare/workers-types": "^4.0.0",
    "@hono/vite-dev-server": "^0.12.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

### 削除
- @tailwindcss/vite
- axios
- json-server

### スクリプト
```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "build:css": "npx tailwindcss -i public/css/input.css -o public/css/styles.css --minify"
  }
}
```

---

## ルーティング設計

| パス | メソッド | ハンドラ | 説明 |
|------|----------|----------|------|
| `/` | GET | routes/home.ts | ホームページ |
| `/products` | GET | routes/products.ts | 商品一覧（フィルタ/検索対応） |
| `/products/:id` | GET | routes/products.ts | 商品詳細 |
| `/cart` | GET | routes/cart.ts | カート表示 |
| `/api/cart/add` | POST | routes/api.ts | カート追加（AJAX） |
| `/api/cart/update` | POST | routes/api.ts | 数量更新（AJAX） |
| `/api/cart/remove` | POST | routes/api.ts | 商品削除（AJAX） |
| `/profile` | GET | routes/profile.ts | プロフィール |
| `/api/auth/login` | POST | routes/api.ts | ログイン（モック） |
| `/api/auth/logout` | POST | routes/api.ts | ログアウト |

---

## 状態管理: JWT Cookie

Cloudflare Workersはステートレスのため、セッションではなくJWT Cookieを使用：

```typescript
// middleware/cart.ts
import jwt from '@tsndr/cloudflare-worker-jwt'

export const cartMiddleware = async (c, next) => {
  const cartToken = c.req.cookie('cart')
  if (cartToken) {
    try {
      const { payload } = await jwt.decode(cartToken)
      c.set('cart', payload.items || [])
    } catch {
      c.set('cart', [])
    }
  } else {
    c.set('cart', [])
  }
  await next()
}

// カート更新時
const setCartCookie = async (c, items) => {
  const token = await jwt.sign({ items }, c.env.JWT_SECRET)
  c.cookie('cart', token, {
    httpOnly: true,
    sameSite: 'Strict',
    maxAge: 60 * 60 * 24 * 7 // 7日
  })
}
```

### 認証（モック）
```typescript
// middleware/auth.ts
export const authMiddleware = async (c, next) => {
  const authToken = c.req.cookie('auth')
  if (authToken) {
    try {
      const isValid = await jwt.verify(authToken, c.env.JWT_SECRET)
      if (isValid) {
        const { payload } = await jwt.decode(authToken)
        c.set('user', payload)
      }
    } catch {
      // 無効なトークン
    }
  }
  await next()
}
```

---

## 実装フェーズ

### Phase 1: 基盤構築
1. `wrangler.json` 設定（静的アセット、環境変数）
2. `tsconfig.json` 設定（JSX対応）
3. `src/index.tsx` - Honoアプリ設定
4. Tailwind CSS v3設定（v4から移行）

### Phase 2: コンポーネント作成
1. `src/components/Layout.tsx` - メインレイアウト
2. `src/components/Header.tsx` - Header.jsから変換
3. `src/components/Footer.tsx` - Footer.jsから変換
4. `src/components/ProductCard.tsx` - 商品カード

### Phase 3: ミドルウェア実装
1. `src/middleware/auth.ts` - JWT認証
2. `src/middleware/cart.ts` - カート管理

### Phase 4: ページルート実装
1. `src/routes/home.tsx` - ホームページ
2. `src/routes/products.tsx` - 商品一覧・詳細
3. `src/routes/cart.tsx` - カート
4. `src/routes/profile.tsx` - プロフィール

### Phase 5: API実装
1. `src/routes/api.ts` - カートAPI、認証API
2. `public/js/client.js` - クライアントサイドAJAX

### Phase 6: デプロイ
1. `wrangler dev` でローカルテスト
2. `wrangler secret put JWT_SECRET` で秘密鍵設定
3. `wrangler deploy` でデプロイ
4. 旧ファイル削除

---

## 変換対象ファイル

### 変換元 → 変換先
- `src/components/Header.js` → `src/components/Header.tsx`
- `src/components/Footer.js` → `src/components/Footer.tsx`
- `src/pages/home.js` → `src/routes/home.tsx`
- `src/pages/products.js` → `src/routes/products.tsx`
- `src/pages/product-detail.js` → `src/routes/products.tsx`（統合）
- `src/pages/cart.js` → `src/routes/cart.tsx`
- `src/pages/profile.js` → `src/routes/profile.tsx`
- `src/utils/cart.js` → `src/middleware/cart.ts`
- `src/utils/auth.js` → `src/middleware/auth.ts`
- `src/services/productService.js` → `src/services/productService.ts`

---

## 削除対象ファイル
- `index.html`, `products.html`, `product-detail.html`, `cart.html`, `profile.html`
- `vite.config.js`
- 旧`src/pages/`, `src/utils/`, `src/services/`

---

## Wrangler設定

```json
{
  "name": "my-cafe-demo",
  "main": "src/index.tsx",
  "compatibility_date": "2025-01-01",
  "assets": {
    "directory": "./public"
  }
}
```

---

## 技術的考慮事項

### TypeScript + JSX設定
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

### Tailwind CSS
- v4からv3へダウングレード（Workers互換性のため）
- Tailwind CLIでビルド → `public/css/styles.css`

### データアクセス
```typescript
// src/services/productService.ts
import data from '../../db.json'
export const products = data.products
export const getProductById = (id: string) =>
  products.find(p => p.id === id)
```

### JSXコンポーネント例
```tsx
// src/components/ProductCard.tsx
import type { FC } from 'hono/jsx'
import type { Product } from '../types'

export const ProductCard: FC<{ product: Product }> = ({ product }) => (
  <div class="bg-white rounded-xl shadow-sm hover:shadow-xl">
    <img src={product.image} alt={product.name} />
    <h3>{product.name}</h3>
    <p>¥{product.price.short}〜</p>
  </div>
)
```

### Edge環境のメリット
- グローバルなエッジネットワークで低レイテンシ
- 自動スケーリング（サーバー管理不要）
- SEO向上（SSRコンテンツ）
- 従量課金（コスト効率）
