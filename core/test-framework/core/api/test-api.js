/**
 * テスト追加API
 * AIがテストケースを追加するためのセキュアなインターフェース
 */

const { TestRegistry } = require('../engine/test-registry');
const { IntegrityChecker } = require('../engine/integrity');
const { AuditLogger } = require('../engine/audit-logger');
const fs = require('fs');
const path = require('path');

class TestAPI {
  constructor() {
    this.registry = new TestRegistry();
    this.integrityChecker = new IntegrityChecker();
    this.auditLogger = new AuditLogger();
    
    // 依存性注入
    this.registry.auditLogger = this.auditLogger;
  }

  /**
   * テストケースの追加（AIが使用する主要メソッド）
   */
  async addTest(testDefinition) {
    console.log('📝 新しいテストケースを追加中...');
    
    try {
      // 1. システム整合性チェック
      const integrityResult = await this.integrityChecker.verifySystemIntegrity();
      if (integrityResult.status !== 'verified') {
        throw new Error('システム整合性エラー: コアファイルが改ざんされています');
      }
      
      // 2. テスト定義の検証
      this.validateTestDefinition(testDefinition);
      
      // 3. 危険なコードのチェック
      this.checkForDangerousCode(testDefinition);
      
      // 4. テストケースの登録
      const result = this.registry.addTestCase(testDefinition);
      
      // 5. 追加成功を記録
      this.auditLogger.log('TEST_ADD_SUCCESS', {
        testId: result.id,
        name: testDefinition.name,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ テストケース追加完了: ${result.id}`);
      
      return {
        success: true,
        testId: result.id,
        filename: result.filename,
        message: 'テストケースが正常に追加されました'
      };
      
    } catch (error) {
      // エラーを記録
      this.auditLogger.log('TEST_ADD_FAILED', {
        error: error.message,
        definition: testDefinition
      });
      
      console.error('❌ テストケース追加失敗:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * テスト定義の検証
   */
  validateTestDefinition(definition) {
    // 必須フィールドチェック
    if (!definition.name || typeof definition.name !== 'string') {
      throw new Error('テスト名が必要です');
    }
    
    if (definition.name.length > 100) {
      throw new Error('テスト名は100文字以内にしてください');
    }
    
    // 型チェック
    if (definition.config && typeof definition.config !== 'object') {
      throw new Error('configはオブジェクトである必要があります');
    }
    
    if (definition.testLogic && typeof definition.testLogic !== 'string') {
      throw new Error('testLogicは文字列である必要があります');
    }
    
    // 許可されたフィールドのみ
    const allowedFields = ['name', 'description', 'type', 'config', 'testLogic', 'tags', 'author'];
    const providedFields = Object.keys(definition);
    
    for (const field of providedFields) {
      if (!allowedFields.includes(field)) {
        throw new Error(`許可されていないフィールド: ${field}`);
      }
    }
  }

  /**
   * 危険なコードのチェック
   */
  checkForDangerousCode(definition) {
    if (!definition.testLogic) return;
    
    const dangerousPatterns = [
      /require\s*\(\s*['"`]fs['"`]\s*\)/,      // fsモジュール
      /require\s*\(\s*['"`]child_process['"`]\s*\)/, // child_process
      /eval\s*\(/,                              // eval
      /Function\s*\(/,                          // Function constructor
      /process\.exit/,                          // process.exit
      /process\.env/,                           // 環境変数アクセス
      /__dirname/,                              // ディレクトリアクセス
      /__filename/,                             // ファイル名アクセス
      /\.\.\/\.\.\//,                          // ディレクトリトラバーサル
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(definition.testLogic)) {
        throw new Error(`セキュリティエラー: 危険なコードパターンが検出されました (${pattern})`);
      }
    }
  }

  /**
   * テスト一覧の取得（読み取り専用）
   */
  listTests(filter = {}) {
    return this.registry.listTests(filter);
  }

  /**
   * テストの検証
   */
  verifyTest(testId) {
    try {
      const result = this.registry.verifyTestCase(testId);
      return {
        success: true,
        testId,
        message: 'テストケースは正常です'
      };
    } catch (error) {
      return {
        success: false,
        testId,
        error: error.message
      };
    }
  }

  /**
   * 全テストの検証
   */
  verifyAllTests() {
    const results = this.registry.verifyAllTests();
    
    this.auditLogger.log('VERIFY_ALL_TESTS', {
      total: results.total,
      verified: results.verified,
      failed: results.failed.length
    });
    
    return results;
  }

  /**
   * 使用方法の表示
   */
  showUsage() {
    const usage = `
=== テスト追加API 使用方法 ===

1. テストケースの追加:
   const api = new TestAPI();
   const result = await api.addTest({
     name: 'ボタンクリックテスト',
     description: '送信ボタンのクリック動作確認',
     type: 'interaction',
     config: {
       selector: '#submit-btn',
       action: 'click'
     },
     testLogic: 'const button = document.querySelector(config.selector);'
   });

2. テスト一覧の取得:
   const tests = api.listTests({ status: 'active' });

3. テストの検証:
   const verification = api.verifyTest(testId);

注意事項:
- 既存のテストケースは編集できません
- 危険なコード（fs、eval等）は使用できません
- すべての操作は監査ログに記録されます
`;
    
    console.log(usage);
    return usage;
  }
}

module.exports = { TestAPI };