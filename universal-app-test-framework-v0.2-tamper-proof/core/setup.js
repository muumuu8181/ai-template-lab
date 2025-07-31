/**
 * フレームワーク初期セットアップスクリプト
 * 初回実行時にシステムの整合性を確立
 */

const { IntegrityChecker } = require('./engine/integrity');
const { TestRegistry } = require('./engine/test-registry');
const fs = require('fs');
const path = require('path');

class Setup {
  constructor() {
    this.integrityChecker = new IntegrityChecker();
    this.registry = new TestRegistry();
  }

  /**
   * 初期セットアップの実行
   */
  async run() {
    console.log('🚀 汎用テストフレームワーク v0.2-tamper-proof セットアップ開始...\n');
    
    try {
      // 1. ディレクトリ構造の確認
      await this.checkDirectoryStructure();
      
      // 2. コアファイルのハッシュ生成
      await this.generateCoreHashes();
      
      // 3. ファイル権限の設定（Unix系のみ）
      await this.setFilePermissions();
      
      // 4. 初期整合性チェック
      await this.performInitialCheck();
      
      // 5. サンプルテストの作成
      await this.createSampleTests();
      
      console.log('\n✅ セットアップ完了！');
      console.log('\n次のステップ:');
      console.log('  1. npm test でシステム整合性を確認');
      console.log('  2. node core/api/test-cli.js help でCLI使用方法を確認');
      console.log('  3. テスト追加は test-cli.js add <definition.json> で実行\n');
      
    } catch (error) {
      console.error('\n❌ セットアップエラー:', error.message);
      process.exit(1);
    }
  }

  /**
   * ディレクトリ構造の確認と作成
   */
  async checkDirectoryStructure() {
    console.log('📁 ディレクトリ構造を確認中...');
    
    const requiredDirs = [
      'core/engine',
      'core/lib',
      'core/schemas',
      'core/api',
      'tests/baseline',
      'tests/custom',
      'config',
      'logs/audit',
      'logs/test-results',
      'logs/checksums',
      '.integrity'
    ];
    
    const baseDir = path.join(__dirname, '..');
    
    for (const dir of requiredDirs) {
      const fullPath = path.join(baseDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  ✓ 作成: ${dir}`);
      } else {
        console.log(`  ✓ 確認: ${dir}`);
      }
    }
  }

  /**
   * コアファイルのハッシュ生成
   */
  async generateCoreHashes() {
    console.log('\n🔐 コアファイルのハッシュを生成中...');
    const hashes = await this.integrityChecker.generateInitialHashes();
    console.log(`  ✓ ${Object.keys(hashes).length}個のファイルを保護`);
  }

  /**
   * ファイル権限の設定
   */
  async setFilePermissions() {
    if (process.platform === 'win32') {
      console.log('\n⚠️  Windows環境: ファイル権限の設定はスキップ');
      return;
    }
    
    console.log('\n🔒 ファイル権限を設定中...');
    
    // Node.jsでは直接chmod操作が難しいため、推奨事項として表示
    console.log('  ℹ️  以下のコマンドを手動で実行してください:');
    console.log('  chmod -R 444 core/');
    console.log('  chmod -R 755 tests/');
    console.log('  chmod -R 644 config/');
  }

  /**
   * 初期整合性チェック
   */
  async performInitialCheck() {
    console.log('\n🔍 初期整合性チェック...');
    const result = await this.integrityChecker.verifySystemIntegrity();
    
    if (result.status === 'verified') {
      console.log('  ✓ システム整合性: 正常');
    } else {
      throw new Error('システム整合性チェックに失敗しました');
    }
  }

  /**
   * サンプルテストの作成
   */
  async createSampleTests() {
    console.log('\n📝 サンプルファイルを作成中...');
    
    // サンプル設定ファイル
    const sampleConfig = {
      framework: {
        version: "0.2.0",
        mode: "production"
      },
      apps: []
    };
    
    const configPath = path.join(__dirname, '../config/test.config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2));
      console.log('  ✓ config/test.config.json');
    }
    
    // サンプルテスト定義
    const sampleTestDef = {
      name: "サンプルテスト",
      description: "フレームワークの動作確認用サンプル",
      type: "basic",
      config: {
        selector: "#sample-button",
        expectedText: "クリックしてください"
      },
      testLogic: "// サンプルテストロジック\nconst element = document.querySelector(config.selector);\nif (element && element.textContent === config.expectedText) {\n  return { success: true };\n}\nthrow new Error('要素が見つかりません');",
      tags: ["sample", "basic"],
      author: "system"
    };
    
    const samplePath = path.join(__dirname, '../sample-test.json');
    fs.writeFileSync(samplePath, JSON.stringify(sampleTestDef, null, 2));
    console.log('  ✓ sample-test.json');
    
    // 使用方法ドキュメント
    const readme = `# テストフレームワーク v0.2-tamper-proof

## 🔒 改ざん防止機能

このバージョンは以下の改ざん防止機能を搭載しています：

1. **コアファイル保護** - SHA256ハッシュによる整合性チェック
2. **テスト追加専用** - 既存テストの編集・削除は不可
3. **監査ログ** - すべての操作を改ざん不可能な形で記録
4. **危険コード検出** - eval、fs、child_processなどをブロック

## 📝 テストの追加方法

\`\`\`bash
# 1. テスト定義ファイルを作成
# 2. CLIで追加
node core/api/test-cli.js add my-test.json
\`\`\`

## 🔍 テストの確認

\`\`\`bash
# テスト一覧
node core/api/test-cli.js list

# テスト検証
node core/api/test-cli.js verify --all
\`\`\`

## ⚠️ 注意事項

- コアファイル（core/以下）は編集しないでください
- テストは tests/custom/ に追加されます
- 設定変更は config/ 内のファイルのみ可能です
`;
    
    const readmePath = path.join(__dirname, '../README.md');
    fs.writeFileSync(readmePath, readme);
    console.log('  ✓ README.md');
  }
}

// 実行
if (require.main === module) {
  const setup = new Setup();
  setup.run();
}

module.exports = { Setup };