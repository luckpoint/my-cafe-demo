# Stripe決済機能 実装設計書

## 概要

My Cafe DemoアプリにStripe Sandbox決済機能を実装する。
Stripe技術面談のため、APIを直接使用した実装を行う。

### 選定技術
- **決済フロー**: Stripe Checkout Session（Stripeホスト決済ページへリダイレクト）
- **バックエンド**: Express.js（新規作成）
- **商品管理**: Products/Prices APIで動的作成

---

## アーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │  Express.js     │     │   Stripe API    │
│   (Vite)        │────▶│  Backend        │────▶│   (Sandbox)     │
│   Port: 5173    │     │  Port: 3000     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   json-server   │
                        │   Port: 3001    │
                        │   (商品データ)   │
                        └─────────────────┘
```

---

## 決済フロー

```
1. ユーザーがカートページで「Checkout」クリック
          │
          ▼
2. Frontend → POST /api/checkout/create-session
   Body: { items: [...], successUrl, cancelUrl }
          │
          ▼
3. Backend: カート内の各商品に対して
   ├── stripe.products.create() で商品作成
   └── stripe.prices.create() で価格作成
          │
          ▼
4. Backend: stripe.checkout.sessions.create()
   └── line_items に作成したPriceを設定
          │
          ▼
5. Frontend: 返却されたURLへリダイレクト
   └── window.location.href = session.url
          │
          ▼
6. Stripe決済ページでカード情報入力
   └── テストカード: 4242 4242 4242 4242
          │
          ├── 成功 → /success.html へリダイレクト
          └── キャンセル → /cancel.html へリダイレクト
          │
          ▼ (非同期)
7. Webhook: checkout.session.completed イベント受信
   └── 注文完了処理（ログ出力）
```

---

## ファイル構成

### 新規作成ファイル

```
/server/                          # Express.jsバックエンド
├── package.json
├── .env                          # Stripe APIキー
├── index.js                      # エントリーポイント
├── config/
│   └── stripe.js                 # Stripe SDK初期化
├── routes/
│   └── checkout.js               # ルート定義
├── controllers/
│   └── checkoutController.js     # リクエストハンドラー
└── services/
    └── stripeService.js          # Stripe API呼び出し

/src/services/
└── checkoutService.js            # フロントエンド用APIクライアント

/src/pages/
├── success.js                    # 決済成功ページ
└── cancel.js                     # 決済キャンセルページ

/success.html                     # 成功ページHTML
/cancel.html                      # キャンセルページHTML
/.env                             # フロントエンド環境変数
```

### 修正ファイル

| ファイル | 変更内容 |
|---------|---------|
| `/src/pages/cart.js` | チェックアウトボタンのハンドラーをStripeリダイレクトに変更 |
| `/package.json` | 開発用スクリプト追加 |

---

## APIエンドポイント

### POST `/api/checkout/create-session`

チェックアウトセッションを作成

**Request:**
```json
{
  "items": [
    {
      "id": "1",
      "name": "Caffè Latte",
      "image": "/images/latte.jpg",
      "size": "tall",
      "price": 415,
      "quantity": 2
    }
  ],
  "successUrl": "http://localhost:5173/success.html",
  "cancelUrl": "http://localhost:5173/cancel.html"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx"
}
```

### POST `/api/webhook`

Stripeからのイベント受信

**Headers:**
- `stripe-signature`: 署名検証用

**処理するイベント:**
- `checkout.session.completed`: 決済完了

---

## Stripe API呼び出し

### 1. 商品作成 (Products API)

```javascript
const product = await stripe.products.create({
  name: `${item.name} (${item.size})`,
  metadata: {
    originalProductId: item.id,
    size: item.size
  }
});
```

### 2. 価格作成 (Prices API)

```javascript
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: item.price,  // JPYは最小単位がそのまま
  currency: 'jpy'
});
```

### 3. セッション作成 (Checkout Sessions API)

```javascript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: lineItems.map(item => ({
    price: item.priceId,
    quantity: item.quantity
  })),
  mode: 'payment',
  success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: cancelUrl
});
```

### 4. Webhook署名検証

```javascript
const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## 環境変数

### `/server/.env`
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### `/.env` (Frontend)
```bash
VITE_CHECKOUT_API_URL=http://localhost:3000
```

---

## 実装順序

### Phase 1: Expressバックエンド構築
1. `/server` ディレクトリ作成、npm初期化
2. Express, Stripe, cors, dotenv インストール
3. Stripe SDK初期化 (`/server/config/stripe.js`)
4. Stripeサービス作成 (`/server/services/stripeService.js`)
5. コントローラー作成 (`/server/controllers/checkoutController.js`)
6. ルート定義 (`/server/routes/checkout.js`)
7. サーバーエントリーポイント (`/server/index.js`)

### Phase 2: フロントエンド連携
1. checkoutService作成 (`/src/services/checkoutService.js`)
2. cart.jsのチェックアウト処理修正
3. success.html / success.js 作成
4. cancel.html / cancel.js 作成

### Phase 3: Webhook設定
1. Webhookエンドポイント実装
2. Stripe CLIでローカルテスト
3. 動作確認

---

## テスト用カード

| カード番号 | 結果 |
|-----------|------|
| 4242 4242 4242 4242 | 成功 |
| 4000 0000 0000 0002 | 拒否 |

有効期限: 任意の将来日付
CVC: 任意の3桁

---

## セキュリティ考慮事項

1. `STRIPE_SECRET_KEY` はバックエンドのみで使用
2. Webhook署名を必ず検証
3. CORSはフロントエンドのオリジンのみ許可
4. 本番環境ではHTTPS必須

---

## 起動方法

```bash
# 開発サーバー起動
npm run dev
```

---

## Webhookテスト方法

### 本番環境（Cloudflare Workers）

Webhookエンドポイント: `https://my-cafe-demo.shunsuke-tsutsui41.workers.dev/api/webhook`

#### 方法1: Stripe CLIでテストイベント送信

```bash
# Stripe CLIインストール（未インストールの場合）
brew install stripe/stripe-cli/stripe

# Stripeにログイン
stripe login

# テストイベントを送信
stripe trigger checkout.session.completed
```

#### 方法2: Stripeダッシュボードから送信

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → Webhooks
2. 設定したエンドポイントを選択
3. 「テストイベントを送信」をクリック
4. `checkout.session.completed` を選択して送信

#### ログの確認

```bash
# Cloudflare Workersのリアルタイムログを表示
npx wrangler tail
```

Webhookが呼ばれると `console.log` の出力がリアルタイムで表示されます。

### ローカル環境

#### 環境変数ファイル

| ファイル | 用途 |
|---------|------|
| `.dev.vars.local` | ローカル開発用（stripe listen使用時） |
| `.dev.vars.production` | Cloudflare本番用（参照用） |

#### セットアップ手順

```bash
# 1. Stripe CLIインストール（未インストールの場合）
brew install stripe/stripe-cli/stripe

# 2. Stripeにログイン
stripe login
```

#### テスト実行

```bash
# ターミナル1: Stripe CLIでWebhookをローカルに転送
stripe listen --forward-to localhost:8789/api/webhook
# 出力される whsec_... を .dev.vars.local にコピー

# ターミナル2: 開発サーバー起動（.dev.vars.local を使用）
npm run dev

# ターミナル3: テストイベント送信（オプション）
stripe trigger checkout.session.completed
```

#### npmスクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | ローカル開発（`--env local`、`.dev.vars.local`使用） |
| `npm run dev:production` | production設定でローカル実行 |
| `npm run deploy` | Cloudflareにデプロイ |

**注意**:
- ローカルテスト時は `stripe listen` が出力する `whsec_...` を `.dev.vars.local` の `STRIPE_WEBHOOK_SECRET` に設定してください
- 開発サーバーはポート `8789` で起動します

---

## Stripeへのデータ送信の仕組み

### データ送信フロー

```
┌─────────────┐      ┌─────────────────────┐      ┌─────────────┐
│  フロント   │ POST │  バックエンド       │ API  │   Stripe    │
│  (カート)   │ ──→  │  (Hono/Workers)     │ ──→  │   サーバー  │
│             │      │                     │      │             │
│ カート情報  │      │ stripe.checkout.    │      │ Checkout    │
│ を送信      │      │ sessions.create()   │      │ Session作成 │
└─────────────┘      └─────────────────────┘      └─────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │ ユーザーを      │
                                               │ Stripe決済画面  │
                                               │ にリダイレクト  │
                                               └─────────────────┘
```

Stripe SDKはバックエンド専用で、**シークレットキー**を使ってAPI通信します。フロントエンドから直接Stripeにデータを送ることはセキュリティ上行いません。

### Checkout Sessionへ送信するデータ

| データ | 送信先 | 備考 |
|--------|--------|------|
| 商品名 | `product_data.name` | サイズ付きで送信 |
| 画像URL | `product_data.images` | **完全なHTTPS URLが必要** |
| 単価 | `price_data.unit_amount` | 日本円で送信 |
| 数量 | `quantity` | |
| ユーザーメール | `customer_email` | Auth0セッションから取得 |
| ユーザーID | `metadata.user_id` | Webhook処理時に使用 |

### 実装コード

#### 1. チェックアウト処理（`src/routes/checkout.ts`）

```typescript
const lineItems: CheckoutLineItem[] = cartItems.map(item => {
    const sizeKey = item.size || 'tall'
    const price = typeof item.price === 'object' ? item.price[sizeKey] : item.price
    return {
        productId: item.id,
        name: item.name,
        price: price,           // 単価
        quantity: item.quantity, // 数量
        size: sizeKey,
        image: item.image?.startsWith('http')  // 画像URL
            ? item.image
            : `${baseUrl}${item.image}`
    }
})
```

#### 2. Stripe Checkout Session作成（`src/services/stripeService.ts`）

```typescript
const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
    price_data: {
        currency: 'jpy',
        product_data: {
            name: `${item.name} (${item.size})`,  // 商品名
            images: item.image ? [item.image] : undefined,  // 画像URL配列
            metadata: {
                product_id: item.productId,
                size: item.size,
            },
        },
        unit_amount: item.price,  // 単価（円）
    },
    quantity: item.quantity,      // 数量
}))

const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: 'ja',
    ...(customerEmail && { customer_email: customerEmail }),  // ユーザーメール
    ...(userId && { metadata: { user_id: userId } }),          // ユーザーID
}
```

### 画像表示の注意事項

Stripe決済画面で商品画像を表示するには、**外部からアクセス可能なHTTPS URL**が必要です。

| 画像パス | Stripe画面での表示 | 理由 |
|----------|-------------------|------|
| `https://images.unsplash.com/...` | ✅ 表示される | パブリックURL |
| `https://your-domain.com/images/product.png` | ✅ 表示される | パブリックURL |
| `http://localhost:8787/images/product.png` | ❌ 表示されない | Stripeサーバーからアクセス不可 |
| `/images/product.png` | ❌ 表示されない | 相対パスはStripeで解決不可 |

> [!NOTE]
> ローカル開発環境では画像が表示されないのは想定通りの動作です。本番デプロイ後は正常に表示されます。
