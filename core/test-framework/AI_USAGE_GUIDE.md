# AI向け使用ガイド - テストフレームワーク v0.2-tamper-proof

## 🔒 重要：改ざん防止について

このフレームワークは**改ざん防止機能**を搭載しています：
- ❌ **既存テストの編集・削除は不可能**
- ❌ **コアファイル（core/）の変更は禁止**
- ✅ **新規テストの追加のみ許可**
- ✅ **すべての操作は監査ログに記録**

## 📁 触って良い/悪いファイル

### ✅ 編集可能（10%）
```
config/
├── test.config.json     # テスト設定
└── environment.json     # 環境変数（存在する場合）
```

### ❌ 読み取り専用（90%）
```
core/                    # すべてのコアファイル
tests/baseline/          # ベースラインテスト
tests/.manifest.json     # テスト管理ファイル
.integrity/              # 整合性情報
logs/                    # ログファイル
```

### 📝 追加のみ可能
```
tests/custom/            # カスタムテスト（新規ファイルのみ）
```

## 🚀 テストケースの追加方法

### 1. テスト定義ファイルを作成

`my-test-definition.json`:
```json
{
  "name": "ボタンクリックテスト",
  "description": "送信ボタンの動作確認",
  "type": "interaction",
  "config": {
    "selector": "#submit-button",
    "expectedResult": "success"
  },
  "testLogic": "// テストロジックをここに記述",
  "tags": ["ui", "button"],
  "author": "AI-Assistant"
}
```

### 2. CLIでテストを追加

```bash
node core/api/test-cli.js add my-test-definition.json
```

## ⚠️ セキュリティ制限

### 禁止されているコード
以下のコードはセキュリティエラーになります：

```javascript
// ❌ ファイルシステムアクセス
const fs = require('fs');

// ❌ 子プロセス実行
const { exec } = require('child_process');

// ❌ 危険な関数
eval('code');
new Function('code');

// ❌ プロセス操作
process.exit();
process.env.SECRET;

// ❌ ディレクトリトラバーサル
'../../core/secret.js'
```

### 許可されているコード
```javascript
// ✅ DOM操作
document.querySelector('#button');

// ✅ 基本的なJavaScript
if (element.textContent === 'Expected') {
  return { success: true };
}

// ✅ エラーハンドリング
try {
  // テストロジック
} catch (error) {
  throw new Error('テスト失敗');
}
```

## 📋 利用可能なコマンド

### テスト管理
```bash
# テスト追加
node core/api/test-cli.js add <definition.json>

# テスト一覧表示
node core/api/test-cli.js list
node core/api/test-cli.js list --status active
node core/api/test-cli.js list --tag ui

# テスト検証
node core/api/test-cli.js verify --all
node core/api/test-cli.js verify <testId>
```

### システムチェック
```bash
# 整合性確認（読み取りのみ）
node core/engine/integrity.js --verify
```

## 🎯 実装例

### 例1: UI要素の存在確認テスト

`button-existence-test.json`:
```json
{
  "name": "重要ボタン存在確認",
  "description": "すべての重要なボタンが存在することを確認",
  "type": "existence",
  "config": {
    "buttons": ["#save-btn", "#cancel-btn", "#submit-btn"]
  },
  "testLogic": "config.buttons.forEach(selector => {\n  const btn = document.querySelector(selector);\n  if (!btn) throw new Error(`ボタンが見つかりません: ${selector}`);\n});",
  "tags": ["ui", "critical"]
}
```

### 例2: フォーム検証テスト

`form-validation-test.json`:
```json
{
  "name": "フォーム入力検証",
  "description": "必須フィールドの検証が正しく動作することを確認",
  "type": "validation",
  "config": {
    "formId": "#user-form",
    "requiredFields": ["#name", "#email", "#password"]
  },
  "testLogic": "const form = document.querySelector(config.formId);\nif (!form) throw new Error('フォームが見つかりません');\n// 検証ロジック",
  "tags": ["form", "validation"]
}
```

## 🚨 エラーが出た場合

### "システム整合性エラー"
- コアファイルが変更されています
- 解決策：フレームワークを再インストール

### "テストケース改ざん検出"
- 既存のテストファイルが編集されました
- 解決策：新しいテストとして追加し直す

### "危険なコードパターン検出"
- 禁止されているコードが含まれています
- 解決策：セキュリティ制限に従ってコードを修正

## 📝 ベストプラクティス

1. **小さなテストを多数作成**
   - 1つの巨大なテストより、小さな単機能テストを推奨

2. **明確な命名**
   - テスト名は日本語で分かりやすく
   - 何をテストしているか一目で分かるように

3. **適切なタグ付け**
   - 後で検索しやすいようにタグを活用
   - 例: "ui", "api", "critical", "regression"

4. **エラーメッセージは具体的に**
   - 「テスト失敗」ではなく「ボタン#submit-btnが無効化されていません」

## 🔍 トラブルシューティング

**Q: テストが追加できない**
A: 以下を確認：
- 定義ファイルのJSON形式は正しいか
- 必須フィールド（name）があるか
- 危険なコードが含まれていないか

**Q: "permission denied"エラー**
A: tests/custom/への書き込み権限を確認

**Q: テスト一覧に表示されない**
A: `test-cli.js verify --all`で整合性を確認

## 📞 サポート

このフレームワークはAIによる自動テスト追加を前提に設計されています。
改ざん防止機能により、誤った操作でシステムを破壊することはありません。

安心してテストケースを追加してください！