# 領収書表示機能

注文履歴画面からStripeの領収書を表示できる機能。

## 概要

Stripe Checkout Sessionで決済完了時に、Chargeオブジェクトの`receipt_url`をデータベースに保存し、注文履歴画面に「領収書を表示」ボタンを表示する。

## 技術仕様

### Stripe API

Checkout Session完了後、以下のパスで領収書URLを取得：

```
Session.payment_intent.latest_charge.receipt_url
```

`stripeService.getSession`で`payment_intent.latest_charge`を展開して取得。

### データベース

`orders`テーブルに`receipt_url`カラムを追加：

```sql
ALTER TABLE orders ADD COLUMN receipt_url TEXT;
```

マイグレーションファイル: `migrations/0002_add_receipt_url.sql`

### データフロー

1. ユーザーがStripe Checkoutで決済完了
2. Stripeが`checkout.session.completed`webhookを送信
3. `webhook.ts`がセッション情報を取得し、`receipt_url`を抽出
4. `orderService.createOrder`でDBに保存
5. 注文履歴画面で`receipt_url`がある注文に「領収書を表示」ボタンを表示

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `migrations/0002_add_receipt_url.sql` | receipt_urlカラム追加 |
| `src/types/index.ts` | Orderインターフェースに`receipt_url`追加 |
| `src/services/orderService.ts` | CreateOrderParamsに`receiptUrl`追加、INSERT文更新 |
| `src/services/stripeService.ts` | expandに`payment_intent.latest_charge`追加 |
| `src/routes/webhook.ts` | receipt_url抽出ロジック追加 |
| `src/routes/orders.tsx` | 領収書ボタンUI追加 |

## UI

注文カードの右上、ステータスバッジの横に「領収書を表示」ボタンを表示。クリックすると新しいタブでStripeの領収書ページが開く。

`receipt_url`が存在しない注文（マイグレーション前の注文）にはボタンは表示されない。

## タイムゾーン設定

### 注文履歴画面

Cloudflare WorkersはUTCで動作するため、`formatDate`関数で日本時間に変換：

```typescript
date.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    // ...
})
```

### Stripe領収書ページ

Stripeがホストする領収書ページのタイムゾーンはダッシュボードで設定：

1. [Stripe Dashboard](https://dashboard.stripe.com/settings/account) にログイン
2. **Settings** → **Business settings** → **Account details**
3. **Timezone** を `Asia/Tokyo` に設定

## 注意事項

- Stripe領収書URLは長期間有効だが、30日後はメール認証が必要になる場合がある
- 既存の注文には`receipt_url`がNULLのため、ボタンは表示されない
