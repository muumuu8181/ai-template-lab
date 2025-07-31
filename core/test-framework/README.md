# 汎用アプリケーションテストフレームワーク v0.2-tamper-proof

## 🎯 概要

このフレームワークは、Webアプリケーションの自動テストを行うためのツールです。
AIによるテスト追加を前提とした改ざん防止機能を搭載しており、企業環境での安全な利用が可能です。

## 🔒 改ざん防止機能

v0.2では以下のセキュリティ機能を搭載：

1. **🛡️ 権限分離** - 90%読み取り専用、10%編集可能の厳格な分離
2. **📝 監査ログ** - すべての操作を記録
3. **🚫 危険コード検出** - eval、fs、child_processなどの実行をブロック

## 📁 ディレクトリ構成と権限

### ✅ 編集可能ファイル（10%）
```
config/
├── test.config.json     # フレームワーク全体設定
└── environment.json     # 環境変数設定（任意）
```

### 🔒 読み取り専用ファイル（90%）
```
core/                    # コアシステム（絶対に編集禁止）
├── engine/              # テストエンジン
│   ├── audit-logger.js  # 監査ログ
│   ├── runner.js        # テスト実行
│   └── test-registry.js # テスト管理
├── api/                 # セキュアAPI
│   ├── test-api.js      # テスト追加API
│   └── test-cli.js      # コマンドライン
├── lib/                 # ライブラリ
│   └── UniversalTestFramework.js
└── schemas/             # テスト定義スキーマ

logs/                    # ログシステム
├── audit/               # 監査ログ
└── test-results/        # テスト結果履歴

tests/baseline/          # ベースラインテスト
```

### ➕ 追加専用ディレクトリ
```
tests/custom/            # AIが追加するカスタムテスト
```

## 🤖 AIによるテスト追加手順

### ステップ1: テスト定義ファイルの作成

`my-new-test.json` を作成：
```json
{
  "name": "ボタンクリックテスト",
  "description": "送信ボタンが正しく動作するか確認",
  "type": "interaction",
  "config": {
    "selector": "#submit-button",
    "expectedResult": "form-submitted"
  },
  "testLogic": "const button = document.querySelector(config.selector);\\nif (!button) throw new Error('ボタンが見つかりません');\\nbutton.click();\\n// 結果の確認ロジック",
  "tags": ["ui", "form", "button"],
  "author": "AI-Assistant"
}
```

### ステップ2: CLIでテストを追加
```bash
node core/api/test-cli.js add my-new-test.json
```

### ステップ3: テスト確認
```bash
# 追加されたテストの確認
node core/api/test-cli.js list --tag ui

# テストが正しく動作するか検証
node core/api/test-cli.js verify --all
```

## 🚀 テスト実行
```bash
# 全アプリケーションのテスト実行（統合レポート付き）
node core/engine/runner.js

# 特定のアプリのみテスト
node core/engine/runner.js --app "UI Template Generator"
```

## 🚫 禁止事項とセキュリティ制限

### AIが絶対に行ってはいけないこと：
1. **core/以下のファイル編集・削除**
2. **既存テストファイルの変更**
3. **logs/の手動変更**
4. **整合性ファイル（.integrity/）の操作**

### 検出される危険なコード：
```javascript
// ❌ これらは自動的にブロックされます
require('fs');           // ファイルシステムアクセス
eval('code');           // 動的コード実行
require('child_process'); // 子プロセス実行
process.exit();         // プロセス終了
```

## 🛠️ 人間の管理者向け操作

### 初期セットアップ
```bash
# 依存関係インストール
npm install

# フレームワーク初期化
node core/setup.js
```

### 障害対応
```bash
# 問題が発生した場合
git checkout core/
npm run setup
```

## 📊 テスト結果とレポート

テスト実行後、以下が生成されます：
- `unified-test-report.html` - ブラウザで見やすい統合レポート
- `logs/test-results/` - 実行履歴の詳細ログ
- `logs/audit/` - すべての操作の監査証跡

## 🔧 設定カスタマイズ

`config/test.config.json` で設定可能：
```json
{
  "framework": {
    "version": "0.2.0",
    "mode": "production",
    "timeoutMs": 30000,
    "retryCount": 3
  },
  "apps": [
    {
      "name": "My App",
      "url": "https://myapp.example.com",
      "waitTime": 2000
    }
  ],
  "logging": {
    "level": "info",
    "auditEnabled": true
  }
}
```

## ⚠️ 重要な注意事項

1. **バックアップ**: 重要なテストケースは別途バックアップしてください
2. **権限**: このフレームワークは読み取り専用権限で動作させることを推奨
3. **監視**: 本番環境では改ざん監視モードを常時実行してください
4. **更新**: v0.1からv0.2への移行時は、設定ファイルの見直しが必要です

## 🆘 トラブルシューティング

### よくある問題と解決方法

**Q: テストが追加できない**
```bash
# 原因確認
node core/api/test-cli.js verify --all   # システム状態確認
# JSON形式の確認、危険コードの有無をチェック
```

**Q: システムエラーが発生する**
```bash
# 解決方法
git checkout core/                       # ファイル復元
node core/setup.js                       # 再初期化
```

このフレームワークは安全性を最優先に設計されています。
不明な点がある場合は、まず `AI_USAGE_GUIDE.md` を参照してください。