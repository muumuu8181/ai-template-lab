/**
 * ファイル整合性チェッカー
 * コアファイルの改ざんを検知
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class IntegrityChecker {
  constructor() {
    this.algorithm = 'sha256';
    this.integrityPath = path.join(__dirname, '../../.integrity');
    this.hashesFile = path.join(this.integrityPath, 'hashes.json');
    this.corePattern = /^core\//;
  }

  /**
   * 初期ハッシュ値の生成
   */
  async generateInitialHashes() {
    console.log('🔐 初期ハッシュ値を生成中...');
    
    const hashes = {};
    const coreDir = path.join(__dirname, '..');
    
    const files = this.scanDirectory(coreDir, coreDir);
    
    for (const file of files) {
      const hash = await this.calculateFileHash(path.join(coreDir, file));
      hashes[`core/${file}`] = {
        hash,
        timestamp: new Date().toISOString(),
        protected: true
      };
    }
    
    // ハッシュファイルを保存
    this.saveHashes(hashes);
    console.log(`✅ ${Object.keys(hashes).length}個のファイルのハッシュを記録しました`);
    
    return hashes;
  }

  /**
   * システム整合性の検証
   */
  async verifySystemIntegrity() {
    console.log('🔍 システム整合性チェック開始...');
    
    const results = {
      timestamp: new Date().toISOString(),
      status: 'verified',
      checkedFiles: 0,
      violations: []
    };
    
    try {
      const storedHashes = this.loadHashes();
      
      for (const [filepath, info] of Object.entries(storedHashes)) {
        if (!info.protected) continue;
        
        const fullPath = path.join(__dirname, '../..', filepath);
        
        if (!fs.existsSync(fullPath)) {
          results.violations.push({
            file: filepath,
            type: 'missing',
            severity: 'critical'
          });
          continue;
        }
        
        const currentHash = await this.calculateFileHash(fullPath);
        
        if (currentHash !== info.hash) {
          results.violations.push({
            file: filepath,
            type: 'modified',
            expected: info.hash,
            actual: currentHash,
            severity: 'critical'
          });
        }
        
        results.checkedFiles++;
      }
      
      if (results.violations.length > 0) {
        results.status = 'compromised';
        this.handleViolations(results.violations);
      }
      
      this.logIntegrityCheck(results);
      
    } catch (error) {
      results.status = 'error';
      results.error = error.message;
    }
    
    return results;
  }

  /**
   * ファイルハッシュの計算
   */
  calculateFileHash(filepath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(this.algorithm);
      const stream = fs.createReadStream(filepath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * ディレクトリの再帰的スキャン
   */
  scanDirectory(dir, baseDir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.scanDirectory(fullPath, baseDir));
      } else if (stat.isFile() && item.endsWith('.js')) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        files.push(relativePath);
      }
    }
    
    return files;
  }

  /**
   * ハッシュの保存
   */
  saveHashes(hashes) {
    if (!fs.existsSync(this.integrityPath)) {
      fs.mkdirSync(this.integrityPath, { recursive: true });
    }
    
    fs.writeFileSync(this.hashesFile, JSON.stringify(hashes, null, 2));
  }

  /**
   * ハッシュの読み込み
   */
  loadHashes() {
    if (!fs.existsSync(this.hashesFile)) {
      return {};
    }
    
    return JSON.parse(fs.readFileSync(this.hashesFile, 'utf8'));
  }

  /**
   * 違反の処理
   */
  handleViolations(violations) {
    console.error('🚨 改ざんが検出されました！');
    
    for (const violation of violations) {
      console.error(`  - ${violation.file}: ${violation.type}`);
      if (violation.expected) {
        console.error(`    期待値: ${violation.expected.substring(0, 16)}...`);
        console.error(`    実際値: ${violation.actual.substring(0, 16)}...`);
      }
    }
    
    // セキュリティアラート（本番環境では通知システムと連携）
    this.sendSecurityAlert(violations);
  }

  /**
   * 整合性チェックのログ記録
   */
  logIntegrityCheck(results) {
    const logDir = path.join(__dirname, '../../logs/audit');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = JSON.stringify({
      ...results,
      action: 'INTEGRITY_CHECK'
    }) + '\n';
    
    fs.appendFileSync(logFile, logEntry);
  }

  /**
   * セキュリティアラート送信（プレースホルダー）
   */
  sendSecurityAlert(violations) {
    // 本番環境では、メール送信やSlack通知などを実装
    console.log('📧 セキュリティアラートが管理者に送信されました');
  }
}

// CLIからの実行サポート
if (require.main === module) {
  const checker = new IntegrityChecker();
  
  if (process.argv.includes('--init')) {
    checker.generateInitialHashes().then(() => {
      console.log('✅ 初期化完了');
    });
  } else if (process.argv.includes('--verify')) {
    checker.verifySystemIntegrity().then(results => {
      if (results.status === 'verified') {
        console.log('✅ システム整合性: 正常');
        process.exit(0);
      } else {
        console.error('❌ システム整合性: 異常');
        process.exit(1);
      }
    });
  }
}

module.exports = { IntegrityChecker };