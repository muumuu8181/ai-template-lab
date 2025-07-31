# 他アプリへの組み込みガイド

## 🚀 組み込み手順

### 1. 必要なファイルをコピー

対象アプリのルートディレクトリに以下をコピー：
```
your-app/
├── core/
│   ├── engine/
│   │   ├── debug-utils.js
│   │   ├── integrity.js
│   │   ├── audit-logger.js
│   │   └── test-registry.js
│   ├── lib/
│   │   └── UniversalTestFramework.js
│   └── api/
│       ├── test-api.js
│       └── test-cli.js
├── configs/
│   └── [your-app-name].config.js  ← 新規作成
├── simple-check/
│   ├── SIMPLE-CHECK.bat
│   └── AI-CHECK.bat
├── package.json  ← 依存関係を追加
└── README.md     ← 既存のREADMEに追記
```

### 2. 設定ファイルの作成

`configs/your-app-name.config.js`:
```javascript
module.exports = {
  appName: 'Your App Name',
  targetSelector: 'body',  // テスト対象のルート要素
  htmlPath: './index.html', // HTMLファイルのパス
  
  // テストする要素
  interactiveElements: {
    buttons: ['#submit-btn', '#cancel-btn'],
    inputs: ['#name-input', '#email-input'],
    dropdowns: ['#category-select']
  },
  
  // カスタムテスト（オプション）
  customTests: [
    {
      name: 'ログイン機能確認',
      testFunction: () => {
        // テストロジック
        return { success: true, message: 'ログイン成功' };
      }
    }
  ]
};
```

### 3. package.jsonに依存関係を追加

```json
{
  "devDependencies": {
    "jsdom": "^22.1.0"
  },
  "scripts": {
    "test": "node core/engine/runner.js",
    "check": "cd simple-check && SIMPLE-CHECK.bat"
  }
}
```

### 4. simple-check/SIMPLE-CHECK.batの修正

パスを調整する必要がある場合：
```batch
REM 現在の設定（v0.2-tamper-proofディレクトリ前提）
cd /d "%~dp0\.."

REM 他アプリ用に修正（アプリのルートがsimple-checkの親の場合）
cd /d "%~dp0\.."
```

## 🔧 アプリ固有の調整

### A. HTMLファイルの場所が異なる場合

configファイルで指定：
```javascript
htmlPath: './public/index.html',  // 実際のパスに合わせる
```

### B. Node.jsアプリの場合

既存のテストに統合：
```javascript
// test/security-check.js
const { UniversalTestFramework } = require('../core/lib/UniversalTestFramework');
const config = require('../configs/my-app.config');

describe('Security Check', () => {
  it('should detect tampering', async () => {
    const framework = new UniversalTestFramework(config);
    const result = await framework.runAllTests();
    expect(result.success).toBe(true);
  });
});
```

### C. CI/CDへの統合

```yaml
# .github/workflows/security-check.yml
name: Security Check
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: node core/engine/runner.js
```

## ⚠️ 注意事項

1. **相対パスの調整**: アプリ構造に合わせてパスを修正
2. **依存関係の確認**: jsdomが必要
3. **権限設定**: Windowsでは管理者権限が必要な場合あり
4. **ログファイル**: simple-check.logの書き込み権限を確認

## 🎯 推奨構成

最も簡単な方法：
1. このフレームワーク全体をサブモジュールとして追加
2. アプリのルートからシンボリックリンクを作成
3. 設定ファイルのみアプリ側で管理

```bash
# Git submodule として追加
git submodule add [repository-url] test-framework
ln -s test-framework/simple-check simple-check
```