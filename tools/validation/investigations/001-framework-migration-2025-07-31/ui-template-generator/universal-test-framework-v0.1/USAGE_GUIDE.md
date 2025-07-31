# 汎用アプリケーションテストフレームワーク v0.1 - 使用ガイド

## 📋 AIに渡すときの説明用ガイド

このフレームワークは、HTMLベースのWebアプリケーションを自動テストするためのツールです。新しいアプリケーションを作成するAIにこのツールを使ってもらう際の手順を説明します。

## 🎯 基本的な使い方（AIへの指示）

### 1. 初回セットアップ
```bash
# フレームワークディレクトリに移動
cd universal-test-framework-v0.1

# 依存関係をインストール
npm install
```

### 2. 新しいアプリ用の設定ファイル作成
`configs/your-app-name.config.js` を作成し、以下のテンプレートを使用してください：

```javascript
module.exports = {
  // 基本情報
  appName: 'あなたのアプリ名',
  basePath: '/path/to/your/app',        // アプリのフォルダパス
  htmlFile: 'index.html',               // メインHTMLファイル名
  scriptFile: 'script.js',              // JavaScriptファイル名（HTMLに埋め込みの場合はnull）
  mainClass: 'YourAppClass',            // メインクラス名（なければnull）

  // 基本要素の検証
  expectedTitle: 'アプリのタイトル',
  titleSelector: 'h1',                  // タイトル要素のセレクター

  // 必須DOM要素（存在確認テスト）
  requiredElements: [
    { name: 'メインボタン', selector: '#mainBtn' },
    { name: 'サイドパネル', selector: '.sidebar' },
    // 他の重要な要素を追加
  ],

  // インタラクティブ要素（属性チェック）
  interactiveElements: [
    {
      name: 'メインボタン',
      selector: '#mainBtn',
      expectedAttributes: {
        'type': 'button',
        'id': 'mainBtn'
      }
    }
  ],

  // 組み合わせテスト（全パターンのボタンクリック）
  combinationTests: [
    {
      name: 'セレクター組み合わせテスト',
      selectors: {
        '#selector1': ['value1', 'value2', 'value3'],
        '#selector2': ['optionA', 'optionB']
      },
      targetButton: '#executeBtn'
    }
  ],

  // カスタムテスト（独自の検証ロジック）
  customTests: [
    {
      name: 'カスタム検証',
      testFunction: () => {
        const element = document.querySelector('#target');
        return {
          success: !!element,
          message: element ? '要素が存在します' : '要素が見つかりません'
        };
      }
    }
  ]
};
```

### 3. ランナーファイルに設定を追加
`universal-test-runner.js` を編集して、新しい設定を追加：

```javascript
// ファイル上部に設定をインポート
const yourAppConfig = require('./configs/your-app-name.config');

// testConfigsに追加（15行目付近）
this.testConfigs = [
  uiTemplateConfig,
  busyTimeTrackerConfig,
  yourAppConfig  // ← ここに追加
];
```

### 4. テスト実行
```bash
node universal-test-runner.js
```

## 🔧 設定項目の詳細説明

### basePath
- アプリケーションのフォルダの**絶対パス**を指定
- 例: `/mnt/c/Users/user/my-app`

### requiredElements
- アプリに必ず存在すべき要素を定義
- 存在確認のみ（属性値はチェックしない）

### interactiveElements
- 特定の属性値を持つべき要素を定義
- ボタンの初期状態やデフォルト値の確認に使用

### combinationTests
- **最も重要な機能**
- セレクターの全組み合わせ × ボタンクリックを自動実行
- 例: 3つの値 × 2つの値 = 6通りの組み合わせ

### customTests
- アプリ独自の検証ロジックを実装
- JavaScript関数として記述

## 📊 レポートの見方

### コンソール出力
```
🚀 汎用アプリケーションテスト開始...
📱 あなたのアプリ名 のテスト実行中...
✅ あなたのアプリ名: 15/20 (75.0%)
📊 統合レポートが生成されました: unified-test-report.html
```

### HTMLレポート
- `unified-test-report.html` が自動的にブラウザで開かれます
- 各テストの成功/失敗状況を視覚的に確認可能
- 失敗したテストの詳細情報も表示

## ⚠️ よくある注意点（AIに伝える）

### 1. パス指定
- **相対パスではなく絶対パス**を使用してください
- WSL環境の場合は `/mnt/c/Users/...` 形式

### 2. セレクター指定
- CSSセレクターを正確に記述してください
- 存在しないセレクターはテスト失敗の原因になります

### 3. combinationTests
- セレクター値の配列は、実際にHTML内に存在する値を指定してください
- `data-value` 属性の値と一致させる必要があります

### 4. 環境制限
- JSDOM環境で動作するため、一部のブラウザAPIは制限されます
- 主にDOMの構造と基本的なイベントのテストが中心です

## 🚀 効果的な使い方

### アプリ開発と同時にテスト設定
1. アプリの基本構造ができたら、まず `requiredElements` を設定
2. ボタンやセレクターが完成したら `combinationTests` を追加
3. 独自機能があれば `customTests` で検証ログイックを実装

### デバッグ時の活用
- テストが失敗したら、まずセレクターが正しいかHTMLを確認
- 組み合わせテストの失敗は、JavaScriptの動作不良を示唆
- ログ出力を確認してエラーの詳細を把握

## 📝 サンプル設定（参考用）

既存の設定ファイル `configs/ui-template-generator.config.js` と `configs/busy-time-tracker.config.js` を参考にしてください。これらは実際に動作する設定例です。

## 🔄 継続的な改善

### テスト追加のタイミング
- 新機能追加時
- バグ修正時
- ユーザーからの不具合報告時

### フレームワーク拡張
- 新しいテストタイプが必要になった場合は、`UniversalTestFramework.js` を拡張できます
- ログ機能やレポート形式のカスタマイズも可能

---

このガイドに従って設定ファイルを作成し、テストを実行してください。問題が発生した場合は、まず既存の動作例を参考に、段階的に設定を調整してください。