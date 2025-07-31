/**
 * テストケース管理レジストリ
 * テストの追加のみ許可、編集・削除は不可
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class TestRegistry {
  constructor() {
    this.manifestPath = path.join(__dirname, '../../tests/.manifest.json');
    this.customTestsPath = path.join(__dirname, '../../tests/custom');
    this.auditLogger = null; // 後で注入
    this.loadManifest();
  }

  /**
   * マニフェストの読み込み
   */
  loadManifest() {
    if (fs.existsSync(this.manifestPath)) {
      const content = fs.readFileSync(this.manifestPath, 'utf8');
      this.manifest = JSON.parse(content);
    } else {
      this.manifest = {
        version: '0.2.0',
        created: new Date().toISOString(),
        tests: [],
        stats: {
          totalAdded: 0,
          lastModified: null
        }
      };
      this.saveManifest();
    }
  }

  /**
   * マニフェストの保存
   */
  saveManifest() {
    const manifestDir = path.dirname(this.manifestPath);
    if (!fs.existsSync(manifestDir)) {
      fs.mkdirSync(manifestDir, { recursive: true });
    }
    
    fs.writeFileSync(
      this.manifestPath,
      JSON.stringify(this.manifest, null, 2)
    );
  }

  /**
   * テストケースの追加（編集不可）
   */
  addTestCase(testDefinition) {
    // IDとタイムスタンプの生成
    const id = this.generateTestId();
    const timestamp = new Date().toISOString();
    
    // テストファイル名の生成
    const filename = `test-${id}-${Date.now()}.js`;
    const filepath = path.join(this.customTestsPath, filename);
    
    // テストコードの生成
    const testCode = this.generateTestCode(testDefinition);
    const checksum = this.calculateChecksum(testCode);
    
    // マニフェストエントリ
    const entry = {
      id,
      filename,
      name: testDefinition.name,
      description: testDefinition.description,
      checksum,
      timestamp,
      author: testDefinition.author || 'system',
      status: 'active',
      locked: true, // 編集不可フラグ
      version: 1,
      tags: testDefinition.tags || []
    };
    
    // ファイル書き込み（新規作成のみ）
    if (fs.existsSync(filepath)) {
      throw new Error(`Test file already exists: ${filename}`);
    }
    
    // customディレクトリの作成
    if (!fs.existsSync(this.customTestsPath)) {
      fs.mkdirSync(this.customTestsPath, { recursive: true });
    }
    
    fs.writeFileSync(filepath, testCode, { mode: 0o444 }); // 読み取り専用
    
    // マニフェストに追加
    this.manifest.tests.push(entry);
    this.manifest.stats.totalAdded++;
    this.manifest.stats.lastModified = timestamp;
    this.saveManifest();
    
    // 監査ログ
    this.auditLog('TEST_ADDED', {
      id,
      filename,
      checksum
    });
    
    return {
      id,
      filename,
      path: filepath
    };
  }

  /**
   * テストケースの検証
   */
  verifyTestCase(id) {
    const entry = this.manifest.tests.find(t => t.id === id);
    if (!entry) {
      throw new Error(`Test case not found: ${id}`);
    }
    
    const filepath = path.join(this.customTestsPath, entry.filename);
    
    if (!fs.existsSync(filepath)) {
      this.auditLog('TEST_MISSING', { id, filename: entry.filename });
      throw new Error(`Test file missing: ${entry.filename}`);
    }
    
    const content = fs.readFileSync(filepath, 'utf8');
    const currentChecksum = this.calculateChecksum(content);
    
    if (currentChecksum !== entry.checksum) {
      this.auditLog('TAMPERING_DETECTED', {
        id,
        expected: entry.checksum,
        actual: currentChecksum
      });
      throw new Error(`Test case tampering detected: ${id}`);
    }
    
    return true;
  }

  /**
   * 全テストケースの検証
   */
  verifyAllTests() {
    const results = {
      total: this.manifest.tests.length,
      verified: 0,
      failed: []
    };
    
    for (const test of this.manifest.tests) {
      try {
        this.verifyTestCase(test.id);
        results.verified++;
      } catch (error) {
        results.failed.push({
          id: test.id,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * テストコードの生成
   */
  generateTestCode(definition) {
    const template = `/**
 * テストケース: ${definition.name}
 * 説明: ${definition.description || ''}
 * 作成日: ${new Date().toISOString()}
 * 
 * このファイルは自動生成されており、編集できません。
 */

module.exports = {
  id: '${this.generateTestId()}',
  name: '${definition.name}',
  type: '${definition.type || 'custom'}',
  
  // テスト設定
  config: ${JSON.stringify(definition.config || {}, null, 2)},
  
  // テスト実行関数
  execute: async function(context) {
    const results = [];
    
    try {
      // テストロジック
      ${definition.testLogic || '// カスタムテストロジックをここに記述'}
      
      results.push({
        name: this.name,
        status: 'PASS',
        message: 'テスト成功'
      });
      
    } catch (error) {
      results.push({
        name: this.name,
        status: 'FAIL',
        message: error.message,
        stack: error.stack
      });
    }
    
    return results;
  }
};`;
    
    return template;
  }

  /**
   * テストIDの生成
   */
  generateTestId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * チェックサムの計算
   */
  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 監査ログ記録
   */
  auditLog(action, details) {
    if (this.auditLogger) {
      this.auditLogger.log(action, details);
    }
    
    // 簡易ログ出力
    console.log(`[AUDIT] ${action}:`, details);
  }

  /**
   * テストケース一覧の取得（読み取り専用）
   */
  listTests(filter = {}) {
    let tests = [...this.manifest.tests]; // コピーを返す
    
    // フィルタリング
    if (filter.status) {
      tests = tests.filter(t => t.status === filter.status);
    }
    
    if (filter.tags && filter.tags.length > 0) {
      tests = tests.filter(t => 
        filter.tags.some(tag => t.tags.includes(tag))
      );
    }
    
    if (filter.after) {
      tests = tests.filter(t => 
        new Date(t.timestamp) > new Date(filter.after)
      );
    }
    
    return tests.map(t => Object.freeze({ ...t })); // 読み取り専用
  }
}

module.exports = { TestRegistry };