#!/bin/bash

# D1リモートデータをローカルに同期するスクリプト

set -e

echo "🔄 D1リモートデータをローカルに同期中..."

# 1. リモートからエクスポート
echo "📥 リモートからエクスポート中..."
npx wrangler d1 export my-cafe-demo-db --remote --output=d1_backup.sql

# 2. ローカルDBをリセット
echo "🗑️  ローカルDBをリセット中..."
rm -rf .wrangler/state/v3/d1

# 3. ローカルにインポート
echo "📤 ローカルにインポート中..."
npx wrangler d1 execute my-cafe-demo-db --local --file=d1_backup.sql

echo "✅ 同期完了!"
