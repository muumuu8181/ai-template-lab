#!/usr/bin/env node
/**
 * テスト追加用CLIインターフェース
 * AIがコマンドラインから簡単にテストを追加できる
 */

const { TestAPI } = require('./test-api');
const fs = require('fs');
const path = require('path');

class TestCLI {
  constructor() {
    this.api = new TestAPI();
  }

  /**
   * CLIコマンドの実行
   */
  async run(args) {
    const command = args[2];
    
    switch (command) {
      case 'add':
        await this.addTest(args.slice(3));
        break;
        
      case 'list':
        await this.listTests(args.slice(3));
        break;
        
      case 'verify':
        await this.verifyTests(args.slice(3));
        break;
        
      case 'help':
      default:
        this.showHelp();
    }
  }

  /**
   * テスト追加コマンド
   */
  async addTest(args) {
    if (args.length === 0) {
      console.error('❌ エラー: テスト定義ファイルを指定してください');
      console.log('使用方法: node test-cli.js add <definition.json>');
      return;
    }
    
    const definitionFile = args[0];
    
    try {
      // 定義ファイルの読み込み
      const definitionPath = path.resolve(definitionFile);
      if (!fs.existsSync(definitionPath)) {
        throw new Error(`ファイルが見つかりません: ${definitionFile}`);
      }
      
      const definition = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
      
      // APIを使用してテスト追加
      const result = await this.api.addTest(definition);
      
      if (result.success) {
        console.log('✅ テスト追加成功！');
        console.log(`   ID: ${result.testId}`);
        console.log(`   ファイル: ${result.filename}`);
      } else {
        console.error('❌ テスト追加失敗:', result.error);
      }
      
    } catch (error) {
      console.error('❌ エラー:', error.message);
    }
  }

  /**
   * テスト一覧表示コマンド
   */
  async listTests(args) {
    const filter = {};
    
    // フィルタオプションの解析
    for (let i = 0; i < args.length; i += 2) {
      const option = args[i];
      const value = args[i + 1];
      
      switch (option) {
        case '--status':
          filter.status = value;
          break;
        case '--tag':
          filter.tags = [value];
          break;
        case '--after':
          filter.after = value;
          break;
      }
    }
    
    const tests = this.api.listTests(filter);
    
    console.log(`\n📋 テスト一覧 (${tests.length}件)`);
    console.log('=' .repeat(60));
    
    tests.forEach((test, index) => {
      console.log(`\n${index + 1}. ${test.name}`);
      console.log(`   ID: ${test.id}`);
      console.log(`   作成日: ${test.timestamp}`);
      console.log(`   状態: ${test.status}`);
      if (test.tags.length > 0) {
        console.log(`   タグ: ${test.tags.join(', ')}`);
      }
    });
    
    console.log('\n' + '=' .repeat(60));
  }

  /**
   * テスト検証コマンド
   */
  async verifyTests(args) {
    if (args.length > 0 && args[0] !== '--all') {
      // 特定のテストを検証
      const testId = args[0];
      const result = this.api.verifyTest(testId);
      
      if (result.success) {
        console.log(`✅ テスト ${testId} は正常です`);
      } else {
        console.error(`❌ テスト ${testId} にエラー: ${result.error}`);
      }
    } else {
      // 全テストを検証
      console.log('🔍 全テストケースを検証中...');
      const results = this.api.verifyAllTests();
      
      console.log(`\n検証結果:`);
      console.log(`  総数: ${results.total}`);
      console.log(`  正常: ${results.verified}`);
      console.log(`  異常: ${results.failed.length}`);
      
      if (results.failed.length > 0) {
        console.log('\n異常が検出されたテスト:');
        results.failed.forEach(f => {
          console.log(`  - ${f.id}: ${f.error}`);
        });
      }
    }
  }

  /**
   * ヘルプ表示
   */
  showHelp() {
    const help = `
テストフレームワーク CLI v0.2

使用方法:
  node test-cli.js <command> [options]

コマンド:
  add <definition.json>    テストケースを追加
  list [options]          テスト一覧を表示
  verify [testId|--all]   テストを検証
  help                    このヘルプを表示

listコマンドのオプション:
  --status <status>       状態でフィルタ (active|inactive)
  --tag <tag>            タグでフィルタ
  --after <date>         指定日以降のテストのみ

例:
  # テスト追加
  node test-cli.js add my-test.json
  
  # アクティブなテストを表示
  node test-cli.js list --status active
  
  # 全テストを検証
  node test-cli.js verify --all

テスト定義ファイルの例 (my-test.json):
{
  "name": "ボタンクリックテスト",
  "description": "送信ボタンが正しく動作するか確認",
  "type": "interaction",
  "config": {
    "selector": "#submit-btn",
    "expectedResult": "success"
  },
  "testLogic": "// ここにテストロジックを記述",
  "tags": ["ui", "button"]
}
`;
    
    console.log(help);
  }
}

// CLI実行
if (require.main === module) {
  const cli = new TestCLI();
  cli.run(process.argv);
}

module.exports = { TestCLI };