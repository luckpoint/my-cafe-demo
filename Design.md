# スターバックス風コーヒー注文サイトの開発

## 概要
Vite + Vanilla JavaScript (ES Modules) + Tailwind CSS を使用して、スターバックス風のコーヒー注文Webアプリケーションを開発してください。バックエンドはjson-serverを使用したモックAPIとします。

## 技術要件
- **ビルドツール**: Vite
- **言語**: JavaScript (ES2020+, ES Modules)
- **スタイリング**: Tailwind CSS
- **HTTPクライアント**: Axios
- **モックAPI**: json-server (ポート3001)
- **認証**: デモモード（LocalStorage）で実装

## ディレクトリ構成
```
project/
├── src/
│   ├── pages/          # 各ページのJSロジック
│   ├── components/     # 共通コンポーネント (Header, Footer)
│   ├── services/       # API通信層
│   └── utils/          # ユーティリティ (Auth, Cart)
├── public/             # 静的アセット
├── db.json             # json-server用データ
├── index.html
├── products.html
├── product-detail.html
├── cart.html
└── profile.html
```

## 実装するページ

### 1. Home (index.html)
- ヒーローセクション（キャッチコピー + 商品一覧へのCTAボタン）
- 特徴紹介セクション（3カラムグリッド）

### 2. Products (products.html)
- 商品一覧をAPIから取得しグリッド表示
- 検索機能（商品名でフィルタリング）
- カテゴリフィルタ（All / Coffee / Tea / Food / Merchandise）
- ローディング表示

### 3. Product Detail (product-detail.html)
- URLパラメータから商品IDを取得
- 商品画像、説明、価格を表示
- サイズ選択（Short / Tall / Grande / Venti）で価格が連動
- 「カートに追加」ボタン

### 4. Cart (cart.html) ※要認証
- カート内商品のリスト表示
- 数量変更・削除機能
- 合計金額の自動計算
- カートクリア機能
- 未ログイン時はログインを促す

### 5. Profile (profile.html) ※要認証
- ユーザー情報（アイコン、名前、メール）を表示

## データモデル

### db.json の商品データ構造
```json
{
  "products": [
    {
      "id": "1",
      "name": "Caffè Latte",
      "category": "coffee",
      "description": "濃厚なエスプレッソにスチームミルクを注いだ...",
      "price": { "short": 370, "tall": 415, "grande": 460, "venti": 505 },
      "image": "/images/latte.jpg",
      "customizations": ["ミルク変更", "エスプレッソ追加"]
    }
  ]
}
```

### カートデータ（LocalStorage: my_coffee_cart）
```json
[
  {
    "id": "1",
    "name": "Caffè Latte",
    "image": "/images/latte.jpg",
    "size": "tall",
    "price": 415,
    "quantity": 2
  }
]
```

## 実装する機能モジュール

### productService.js
- `getAllProducts()` - 全商品取得
- `getProductById(id)` - ID指定で商品取得
- `getProductsByCategory(category)` - カテゴリ検索
- `searchProducts(query)` - テキスト検索

### cart.js
- `getCart()` - カート取得
- `addToCart(item)` - 商品追加（同ID・同サイズは数量加算）
- `removeFromCart(id, size)` - 商品削除
- `updateQuantity(id, size, quantity)` - 数量変更
- `clearCart()` - カートクリア
- `getCartTotal()` - 合計金額計算
- 保存時に `cartUpdated` カスタムイベントを発火

### auth.js（デモモード）
- `login()` - デモユーザーでログイン（LocalStorageに保存）
- `logout()` - ログアウト
- `isAuthenticated()` - 認証状態確認
- `getUser()` - ユーザー情報取得

## 共通コンポーネント

### Header
- ロゴ（クリックでホームへ）
- ナビゲーション（Home / Products）
- ログイン/ログアウトボタン
- カートアイコン（アイテム数バッジ付き）

### Footer
- 著作権表示
- シンプルなリンク

## デザイン要件
- **カラー**: プライマリ=#00704A（Starbucks Green）、背景=gray-50/white
- **レスポンシブ**: モバイルファースト、グリッドは1列→3列に可変
- **Tailwind CSS** のユーティリティクラスを使用

## 開発手順
1. Viteプロジェクトのセットアップ
2. Tailwind CSSの設定
3. db.jsonとjson-serverの準備
4. 共通コンポーネント（Header/Footer）の実装
5. 各ページのHTML作成
6. サービス・ユーティリティの実装
7. 各ページのJSロジック実装
8. 動作確認・調整
