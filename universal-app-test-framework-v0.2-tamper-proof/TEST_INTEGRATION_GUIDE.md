# テストフレームワーク統合ガイド

## 🎯 概要

base-templateにuniversal-app-test-framework-v0.2-tamper-proofを統合し、アプリのテスト機能を追加する作業の詳細記録。

## 📋 実行した作業の全体像

### 1. 基本統合（新規作成：1ファイルのみ）

#### 作成したファイル
- **configs/current-app.config.js** - テスト設定ファイル（1つのみ）

#### 修正したファイル  
- **core/engine/runner.js** - 2行のみの修正
  ```javascript
  // 修正1: インポート
  const currentAppConfig = require('../../configs/current-app.config');
  
  // 修正2: 配列
  this.testConfigs = [currentAppConfig];
  ```

## 🧪 テスト処理の追加方法

### テストの種類と追加場所

#### 1. DOM要素の存在確認テスト
**設定場所**: `requiredElements` 配列
```javascript
requiredElements: [
  {
    name: '要素名',
    selector: '#element-id'
  }
]
```
**自動生成**: 追加するだけで「○○の存在確認」テストが自動作成

#### 2. 属性確認テスト  
**設定場所**: `interactiveElements` 配列
```javascript
interactiveElements: [
  {
    name: 'ボタン名',
    selector: '#button-id',
    expectedAttributes: {
      'id': 'button-id'
    }
  }
]
```
**自動生成**: 「○○のインタラクション確認」テストが自動作成

#### 3. カスタムテスト（動作確認）
**設定場所**: `customTests` 配列
```javascript
customTests: [
  {
    name: 'テスト名',
    testFunction: () => {
      // テストロジック
      return {
        success: true/false,
        message: '結果メッセージ'
      };
    }
  }
]
```

## 🔄 テスト実行の流れ

```bash
# テスト実行
node core/engine/runner.js

# 結果確認
# → unified-test-report.html が生成される
```

## ⚠️ 迷いやすいポイントと解決策

### 1. JSDOMの制限について

**問題**: ブラウザでは動くがテストでは失敗する
- JavaScriptの自動実行なし
- `click()` イベントが期待通りに動作しない
- グローバル関数が見つからない

**解決策**: カスタムテストで回避
```javascript
// ❌ 実際のクリックを試行（失敗する）
btn.click();

// ✅ 期待される結果を手動で作成
const newValue = initialValue + 1;
counterValue.textContent = newValue.toString();
```

### 2. テスト失敗の対処法

**失敗パターン**:
- `onclick="functionName()" が実行できません` 
- `ログ数: 0` (JavaScriptが実行されていない)

**修正アプローチ**:
1. **機能の存在確認**に重点を置く
2. **手動でのシミュレーション**を行う
3. **エラーメッセージを分かりやすく**する

### 3. パスの指定

**重要**: 設定ファイル内のパスは絶対パス
```javascript
basePath: '/mnt/c/Users/user/ai-template-lab/ai-template-lab-v0.4/base-template/template_set/src'
```

## 📊 テスト結果の推移

1. **初期**: 4/4 (100%) - 基本的な存在確認のみ
2. **機能追加後**: 16/16 (100%) - 新機能の要素追加
3. **インタラクション追加**: 21/21 → 19/21 → 25/27 (92.6%) - 動作テスト追加と修正

## 🔧 設定ファイルの構造

```javascript
module.exports = {
  // 基本情報
  appName: 'アプリ名',
  basePath: '/絶対パス/to/app',
  htmlFile: 'index.html',
  
  // 自動生成されるテスト
  requiredElements: [/* DOM存在確認 */],
  interactiveElements: [/* 属性確認 */],
  
  // 手動で作成するテスト
  customTests: [/* カスタムロジック */]
};
```

## 💡 ベストプラクティス

### 1. テスト追加の順序
1. DOM要素の存在確認から始める
2. 属性確認を追加
3. 最後にカスタムテストで動作確認

### 2. エラー対応
- エラーメッセージをそのまま活用
- 実際の動作ではなく「期待される状態」をテスト
- try-catch でエラーハンドリング

### 3. テスト設計
- 1つのテストで1つのことだけを確認
- 成功/失敗の判定基準を明確にする
- デバッグしやすいメッセージを含める

## 🚀 今後の拡張

### ダウンロード機能追加
- アプリログのダウンロード機能実装済み
- テストレポートのダウンロード機能実装済み
- **未解決**: デフォルトダウンロードフォルダから開発環境への直接保存

### 追加可能な機能
- より複雑なユーザーインタラクションのテスト
- パフォーマンステスト
- アクセシビリティテスト

## 🚀 GitHubアップロード手順

### 基本的なアップロード手順

```bash
# 1. 変更ファイルの確認
git status

# 2. 変更をステージング
git add .

# 3. コミット作成
git commit -m "適切なコミットメッセージ"

# 4. GitHubにプッシュ
git push origin main

# 5. バージョンタグを作成
git tag v0.4
git push origin v0.4
```

### バージョンタグの活用

**タグ作成後の利点**:
- 特定バージョンのクローンが可能
- リリース履歴の管理
- 前のバージョンへの簡単な復元

**特定バージョンのクローン方法**:
```bash
# 最新版をクローン
git clone https://github.com/USERNAME/ai-template-lab.git

# 特定バージョンをチェックアウト
cd ai-template-lab
git checkout v0.4

# または直接特定バージョンのブランチ作成
git clone --branch v0.4 https://github.com/USERNAME/ai-template-lab.git ai-template-lab-v0.4
```

---

**作成日**: 2025年7月30日  
**最終更新**: GitHub手順追加時点