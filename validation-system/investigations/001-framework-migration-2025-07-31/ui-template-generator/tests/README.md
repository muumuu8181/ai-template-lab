# 汎用アプリケーションテストフレームワーク v0.1

## 概要
HTMLベースのWebアプリケーションに対して自動テストを実行し、詳細なレポートを生成する汎用テストフレームワークです。複数のアプリケーションを統一的にテストできるように設計されています。

## 特徴
- ✅ **DOM構造検証** - 要素の存在確認、属性チェック
- ✅ **インタラクションテスト** - ボタンクリック、セレクター操作のシミュレーション  
- ✅ **組み合わせテスト** - あらゆるボタン・セレクター組み合わせの自動実行
- ✅ **詳細ログ取得** - 実行過程の完全なトレース
- ✅ **HTMLレポート生成** - ブラウザで確認できる視覚的なレポート
- ✅ **設定ベース** - アプリごとに個別設定ファイルで柔軟に対応

## 動作環境
- **Node.js** 14.0以上
- **必要パッケージ**: jsdom, jest, jest-environment-jsdom, jest-html-reporters

## ディレクトリ構造
```
tests/
├── framework/
│   └── UniversalTestFramework.js    # コアフレームワーク
├── configs/
│   ├── ui-template-generator.config.js  # アプリ1設定
│   └── busy-time-tracker.config.js      # アプリ2設定
├── universal-test-runner.js             # 実行エントリーポイント
├── package.json                         # 依存関係
└── README.md                           # このファイル
```

## 基本的な使い方

### 1. 環境セットアップ
```bash
cd tests
npm install
```

### 2. テスト実行
```bash
node universal-test-runner.js
```

### 3. レポート確認
- `unified-test-report.html` がブラウザで自動的に開かれます
- コンソールにもサマリー結果が表示されます

## 新しいアプリを追加する方法

### Step 1: 設定ファイルの作成
`configs/your-app-name.config.js` を作成します：

```javascript
module.exports = {
  // 基本情報
  appName: 'あなたのアプリ名',
  basePath: '/path/to/your/app',
  htmlFile: 'index.html',
  scriptFile: 'script.js', // HTMLに埋め込みの場合はnull
  mainClass: 'YourAppClass', // メインクラス名

  // 基本要素の検証
  expectedTitle: 'アプリのタイトル',
  titleSelector: 'h1',

  // 必須DOM要素（存在確認）
  requiredElements: [
    { name: 'メインボタン', selector: '#mainBtn' },
    { name: 'サイドパネル', selector: '.sidebar' }
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

  // 組み合わせテスト（ボタンクリック）
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

  // カスタムテスト（独自ロジック）
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

### Step 2: ランナーに追加
`universal-test-runner.js` の `testConfigs` 配列に新しい設定を追加：

```javascript
const yourAppConfig = require('./configs/your-app-name.config');

this.testConfigs = [
  uiTemplateConfig,
  busyTimeTrackerConfig,
  yourAppConfig  // ← 追加
];
```

### Step 3: テスト実行
```bash
node universal-test-runner.js
```

## 設定項目詳細

### requiredElements
DOM上に存在すべき要素を定義します。
```javascript
requiredElements: [
  { name: '表示名', selector: 'CSSセレクター' }
]
```

### interactiveElements  
属性値の検証が必要な要素を定義します。
```javascript
interactiveElements: [
  {
    name: '要素名',
    selector: 'CSSセレクター',
    expectedAttributes: {
      '属性名': '期待値',
      'data-value': '123'
    }
  }
]
```

### combinationTests
ボタンクリックの組み合わせテストを定義します。
```javascript
combinationTests: [
  {
    name: 'テスト名',
    selectors: {
      '#selector1': ['値1', '値2', '値3'],  // 全組み合わせが生成される
      '#selector2': ['A', 'B']
    },
    targetButton: '#実行ボタンのセレクター'
  }
]
```

### customTests
独自のテストロジックを実装できます。
```javascript
customTests: [
  {
    name: 'テスト名',
    testFunction: () => {
      // カスタムテストロジック
      const result = /* 何らかの検証 */;
      return {
        success: boolean,      // 成功/失敗
        message: 'string'      // 結果メッセージ
      };
    }
  }
]
```

## ログとデバッグ

### ログレベル
- **DEBUG**: 詳細な実行情報
- **INFO**: 一般的な情報
- **WARN**: 警告
- **ERROR**: エラー情報

### ログカテゴリ
- **DOM**: DOM操作関連
- **EVENT**: イベント処理関連  
- **TEST**: テスト実行関連
- **SYSTEM**: システム関連

### ログ出力確認
テスト結果の `detailedLogs` 配列に全ログが含まれています。

## トラブルシューティング

### よくある問題

**Q: テストが全て失敗する**
A: 以下を確認してください：
- アプリのパスが正しいか（`basePath`）
- HTMLファイル名が正しいか（`htmlFile`）
- セレクターが正しいか

**Q: JavaScriptクラスのインスタンス化に失敗する**
A: JSDOM環境では一部のブラウザAPIが制限されています。静的テストとして実行されます。

**Q: ボタンクリックが動作しない**
A: ログを確認して以下をチェック：
- 要素が見つかっているか
- onclick属性が設定されているか
- エラーが発生していないか

## 対応プラットフォーム

### 動作確認済み
- ✅ **Windows 10/11** (WSL2含む)
- ✅ **macOS** (Node.js環境)
- ✅ **Linux** (Ubuntu, CentOS等)

### 前提条件
- Node.js 14.0以上がインストールされていること
- npm または yarn が利用可能であること

### ブラウザ表示
HTMLレポートの自動表示は以下のコマンドを使用：
- **Windows**: `cmd.exe /c start`
- **macOS**: `open` 
- **Linux**: `xdg-open`

## カスタマイズ

### レポートのカスタマイズ
`UniversalTestFramework.js` の `generateHTMLReport` メソッドでHTMLレポートをカスタマイズできます。

### 新しいテストタイプの追加
フレームワークを拡張して独自のテストタイプを追加することが可能です。

## サポート

このツールについて質問がある場合は、設定ファイルの例を参考に段階的に実装してください。

## バージョン履歴
- **v0.1** (2025-07-30): 初回リリース
  - 基本的なDOM検証機能
  - ボタンクリック組み合わせテスト
  - 詳細ログ取得機能
  - HTMLレポート生成機能

---

# 【参考】以前のPlaywrightベースE2Eテストスイート

以下は以前に実装されたPlaywrightベースのE2Eテストスイートの情報です。
現在の汎用フレームワークと併用する場合の参考情報として保持しています。

## 📋 テスト内容

### 実装済みテストケース

1. **基本的なグループ作成テスト** (`01-basic-group-creation.spec.js`)
   - 初期状態の確認
   - 3×2グループの作成確認
   - 複数グループの作成
   - パネル表示確認
   - 最大・最小サイズグループの作成
   - 操作ログ記録

2. **グループ選択と設定読み込みテスト** (`02-group-selection-and-settings.spec.js`)
   - グループクリックでのアクティブ化
   - 設定値の読み込み確認
   - 複数グループの設定管理
   - アクティブグループ表示の更新
   - 削除・クリア後のリセット確認

3. **設定反映テスト** (`03-settings-application.spec.js`)
   - 単一グループへの設定反映
   - スタイル値の確認
   - 色設定の反映
   - 複数ボタンへの一括反映
   - エラーメッセージの確認
   - 配置設定の反映

4. **複数グループへの一括反映テスト** (`04-bulk-settings-application.spec.js`)
   - 複数グループへの色一括反映
   - 異なるサイズグループへの一括設定
   - 全グループチェック機能
   - 混在設定の一括反映
   - 大量グループでの動作確認

5. **横1列にまとめる機能テスト** (`05-horizontal-merge.spec.js`)
   - 2つのグループの横並び
   - 行数の減少確認
   - ボタンの有効/無効状態
   - 3つ以上のグループまとめ
   - まとめ後の機能確認

6. **操作履歴ログテスト** (`06-operation-log.spec.js`)
   - 各操作のログ記録確認
   - ログをコピー機能
   - 時刻フォーマット確認
   - 表示順序・件数制限
   - UI状態情報の記録

7. **エッジケーステスト** (`07-edge-cases.spec.js`)
   - 異常系動作の確認
   - エラーメッセージの検証
   - 最大・最小値での動作
   - 連続操作での安定性
   - 削除・リセット処理の確認

## 🚀 セットアップ

### 前提条件

- Node.js (v16以上)
- npm または yarn

### インストール手順

1. **依存関係のインストール**
   ```bash
   cd tests
   npm install
   ```

2. **Playwrightブラウザのインストール**
   ```bash
   npm run test:install
   ```

## 🎯 テスト実行

### 基本的な実行方法

```bash
# 全テストを実行（ヘッドレスモード）
npm test

# ブラウザを表示してテストを実行
npm run test:headed

# インタラクティブなUIモードで実行
npm run test:ui

# デバッグモードで実行
npm run test:debug
```

### ブラウザ別実行

```bash
# Chrome（Chromium）でのみ実行
npm run test:chrome

# Firefoxでのみ実行
npm run test:firefox

# Edgeでのみ実行
npm run test:edge
```

### 特定のテストファイル実行

```bash
# 基本的なグループ作成テストのみ実行
npx playwright test 01-basic-group-creation

# 設定反映テストのみ実行
npx playwright test 03-settings-application
```

### テスト結果の確認

```bash
# HTML形式のレポートを表示
npm run test:report
```

## 📊 テスト結果

### 成功時の出力例

```
Running 42 tests using 3 workers

  ✓ 基本的なグループ作成テスト › 初期状態の確認 (1.2s)
  ✓ 基本的なグループ作成テスト › 基本的なグループ作成（3×2） (0.8s)
  ✓ グループ選択と設定読み込みテスト › グループクリックでアクティブ状態になる (0.9s)
  ✓ 設定反映テスト › 単一グループへの高さ設定反映 (1.1s)
  ...

  42 passed (45s)
```

### 失敗時の情報

- スクリーンショット: `test-results/` フォルダに保存
- 動画録画: 失敗時のみ記録
- トレース情報: デバッグ用の詳細情報

## 🔧 設定

### playwright.config.js の主要設定

```javascript
{
  testDir: './e2e',           // テストファイルのディレクトリ
  timeout: 30000,             // テストタイムアウト
  retries: 2,                 // 失敗時のリトライ回数（CI環境）
  workers: 1,                 // 並列実行ワーカー数（CI環境）
  
  // 対応ブラウザ
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'edge' }
  ]
}
```

## 📁 ファイル構成

```
tests/
├── README.md                           # このファイル
├── package.json                        # 依存関係定義
├── playwright.config.js                # Playwright設定
├── e2e/                                # テストファイル
│   ├── helpers/
│   │   └── ui-helpers.js               # テスト用ヘルパー関数
│   ├── 01-basic-group-creation.spec.js # 基本機能テスト
│   ├── 02-group-selection-and-settings.spec.js
│   ├── 03-settings-application.spec.js
│   ├── 04-bulk-settings-application.spec.js
│   ├── 05-horizontal-merge.spec.js
│   ├── 06-operation-log.spec.js
│   └── 07-edge-cases.spec.js           # エッジケーステスト
├── test-results/                       # テスト結果（自動生成）
└── playwright-report/                  # HTMLレポート（自動生成）
```

## 🛠️ テストヘルパー関数

`helpers/ui-helpers.js` には以下の便利な関数が含まれています：

### 基本操作
- `goto()` : ページを開く
- `setGridSize(cols, rows)` : グリッドサイズ設定
- `setButtonSize(width, height)` : ボタンサイズ設定
- `createNewGroup()` : 新規グループ作成

### グループ操作
- `selectGroup(index)` : グループ選択
- `toggleGroupCheckbox(index, checked)` : チェックボックス操作
- `selectAllGroups()` : 全グループ選択
- `mergeGroups()` : 横並びにまとめる

### 状態確認
- `getGroupCount()` : グループ数取得
- `getButtonStyle(groupIndex, buttonIndex)` : ボタンスタイル取得
- `getActiveGroupInfo()` : アクティブグループ情報取得
- `getLogContent()` : 操作ログ取得

## 🐛 トラブルシューティング

### よくある問題

1. **テストが失敗する場合**
   ```bash
   # ブラウザを再インストール
   npx playwright install
   
   # キャッシュをクリア
   npx playwright test --headed --debug
   ```

2. **パフォーマンスが遅い場合**
   ```bash
   # ワーカー数を調整
   npx playwright test --workers=1
   ```

3. **特定のブラウザでのみ失敗する場合**
   ```bash
   # 該当ブラウザでデバッグ実行
   npx playwright test --project=firefox --debug
   ```

### ログとデバッグ

- 失敗時のスクリーンショット: `test-results/` を確認
- ブラウザデベロッパーツール: `--debug` オプション使用
- コンソールログ: テストファイル内で `console.log()` 使用

## 📈 CI/CD統合

### GitHub Actions設定例

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd tests
          npm ci
      
      - name: Install Playwright
        run: |
          cd tests
          npx playwright install --with-deps
      
      - name: Run tests
        run: |
          cd tests
          npm test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: tests/playwright-report/
```

## 🔍 テストカバレッジ

### 検証項目

- ✅ DOM要素の存在・表示確認
- ✅ CSS スタイルの実測値検証
- ✅ JavaScript 状態管理の確認
- ✅ ユーザーインタラクションの動作
- ✅ エラーハンドリングの検証
- ✅ パフォーマンス（大量データ）テスト

### カバレッジ対象外

- サーバーサイド処理（静的ファイルのため該当なし）
- モバイル対応（将来的に追加予定）
- アクセシビリティ（オプション機能として検討中）

## 📞 サポート

問題が発生した場合は、以下の情報とともにお問い合わせください：

1. 実行環境（OS、Node.jsバージョン）
2. エラーメッセージの全文
3. 失敗時のスクリーンショット
4. `test-results/` フォルダの内容

---

**作成日**: 2025年1月30日  
**対応バージョン**: UI Template Generator v0.41  
**テストフレームワーク**: Playwright v1.41.0