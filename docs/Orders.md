# 購入履歴機能 実装計画

## 概要
StripeのWebhookで決済完了時に注文データをCloudflare D1に保存し、`/orders`ページで購入履歴を表示する。

## 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `wrangler.json` | D1データベースバインディング追加 |
| `migrations/0001_create_orders.sql` | 新規作成: DBスキーマ定義 |
| `src/types/index.ts` | Order型、D1Databaseバインディング追加 |
| `src/services/orderService.ts` | 新規作成: 注文CRUD操作 |
| `src/services/stripeService.ts` | メタデータ(userId, productId)サポート追加 |
| `src/routes/checkout.ts` | ユーザーIDをStripeセッションに渡す |
| `src/routes/webhook.ts` | 決済完了時に注文をDBに保存 |
| `src/routes/orders.tsx` | 新規作成: 購入履歴ページ |
| `src/components/Header.tsx` | ドロップダウンに「Order History」リンク追加 |
| `src/index.tsx` | `/orders`ルート追加 |

---

## Step 1: D1データベースセットアップ

### 1.1 D1データベース作成
```bash
wrangler d1 create my-cafe-demo-db
```

### 1.2 wrangler.json 更新
```json
{
    "d1_databases": [
        {
            "binding": "DB",
            "database_name": "my-cafe-demo-db",
            "database_id": "<生成されたID>"
        }
    ]
}
```

### 1.3 マイグレーションファイル作成 (`migrations/0001_create_orders.sql`)
```sql
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,                    -- Stripe session ID（冪等性保証）
    user_id TEXT NOT NULL,                  -- Auth0 user ID (sub)
    user_email TEXT NOT NULL,
    stripe_payment_intent_id TEXT,
    total_amount INTEGER NOT NULL,          -- JPY（整数）
    currency TEXT DEFAULT 'jpy',
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### 1.4 マイグレーション実行
```bash
wrangler d1 execute my-cafe-demo-db --file=./migrations/0001_create_orders.sql
```

---

## Step 2: 型定義更新 (`src/types/index.ts`)

追加する型:
```typescript
export interface Order {
    id: string
    user_id: string
    user_email: string
    stripe_payment_intent_id?: string
    total_amount: number
    currency: string
    status: string
    created_at: string
}

export interface OrderItem {
    id: number
    order_id: string
    product_id: string
    product_name: string
    size: 'short' | 'tall' | 'grande' | 'venti'
    unit_price: number
    quantity: number
}

export interface OrderWithItems extends Order {
    items: OrderItem[]
}
```

`Bindings`に追加:
```typescript
DB: D1Database
```

---

## Step 3: Order Service作成 (`src/services/orderService.ts`)

機能:
- `createOrder()` - 注文レコード作成
- `createOrderItems()` - 注文明細をバッチ挿入
- `getOrdersByUserId()` - ユーザーの全注文を取得（アイテム含む）
- `orderExists()` - 冪等性チェック

---

## Step 4: Stripe連携更新

### 4.1 stripeService.ts
- `createCheckoutSession()`に`userId`パラメータ追加
- `product_data.metadata`に`product_id`を含める
- セッションの`metadata`に`user_id`を含める

### 4.2 checkout.ts (29行目付近)
```typescript
const checkoutSession = await stripeService.createCheckoutSession(
    stripe,
    lineItems,
    successUrl,
    cancelUrl,
    customerEmail,
    session?.user?.sub  // ← 追加: ユーザーID
)
```

---

## Step 5: Webhook強化 (`src/routes/webhook.ts`)

`checkout.session.completed`イベント処理を拡張:

1. 冪等性チェック（`orderExists()`）
2. Stripe APIで詳細セッション取得（`line_items`含む）
3. `orderService.createOrder()`で注文保存
4. `orderService.createOrderItems()`で明細保存
5. エラー時も200返却（Stripeリトライ防止）

---

## Step 6: 購入履歴ページ (`src/routes/orders.tsx`)

- `requiresAuth()`でログイン必須
- `orderService.getOrdersByUserId()`でデータ取得
- 表示内容:
  - 注文日時
  - 合計金額
  - ステータスバッジ
  - 商品一覧（名前、サイズ、数量、小計）
- 空状態の場合は「Start Shopping」リンク表示

---

## Step 7: ナビゲーション更新

### Header.tsx (46行目付近)
「Your Profile」と「Sign out」の間にリンク追加:
```tsx
<a href="/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
    Order History
</a>
```

### index.tsx
```typescript
import orders from './routes/orders'
app.route('/orders', orders)
```

---

## 実装順序

1. D1データベース作成・マイグレーション
2. 型定義更新
3. orderService作成
4. stripeService更新
5. checkout.ts更新（userIdを渡す）
6. webhook.ts更新（注文保存）
7. orders.tsx作成
8. Header.tsxにリンク追加
9. index.tsxにルート追加
10. ローカルテスト（`wrangler dev --local --persist-to=.wrangler`）
11. Stripe CLI Webhookテスト

---

次のステップ

  1. D1データベース作成
  npx wrangler d1 create my-cafe-demo-db

  2. wrangler.jsonのdatabase_idを更新
    - 上のコマンドで出力されたIDで <YOUR_DATABASE_ID> を置き換え
  3. マイグレーション実行
  # ローカル
  npx wrangler d1 execute my-cafe-demo-db --local --file=./migrations/0001_create_orders.sql

  # リモート
  npx wrangler d1 execute my-cafe-demo-db --remote --file=./migrations/0001_create_orders.sql

  4. ローカルテスト
  npx wrangler dev --local --persist-to=.wrangler

---

## 注意点

- **冪等性**: Stripe session IDをPKにし、重複Webhookを防止
- **ユーザー識別**: Auth0の`sub`を使用（emailは変更可能なため）
- **価格**: 購入時の価格を保存（商品価格変更に対応）
- **エラーハンドリング**: Webhook失敗時も200を返しリトライ防止（Stripeから手動復旧可能）
