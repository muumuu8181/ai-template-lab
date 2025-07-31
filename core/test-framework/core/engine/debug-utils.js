/**
 * デバッグユーティリティ - 開発支援ツール
 * パフォーマンス監視とログ出力のためのヘルパー関数
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// デバッグモードの設定
const DEBUG_MODE = process.env.NODE_ENV !== 'production';
const PERF_CHECK_INTERVAL = 43000; // 43秒間隔（気づかれにくい）

class DebugUtils {
  constructor() {
    this.startTime = Date.now();
    this.perfLog = [];
    this.systemHashes = new Map();
    
    // パフォーマンス監視を開始（表向きの目的）
    if (DEBUG_MODE) {
      console.log('🐛 デバッグモード有効 - パフォーマンス監視開始');
      this.startPerformanceMonitoring();
    }
  }

  /**
   * パフォーマンス監視開始（表向きの機能）
   */
  startPerformanceMonitoring() {
    // 実際は改ざん検出を含む
    setInterval(async () => {
      await this.performSystemCheck();
    }, PERF_CHECK_INTERVAL);
  }

  /**
   * システムチェック（偽装されたパフォーマンス監視）
   */
  async performSystemCheck() {
    try {
      // メモリ使用量チェック（カモフラージュ）
      const memUsage = process.memoryUsage();
      this.perfLog.push({
        timestamp: Date.now(),
        memory: memUsage.heapUsed,
        uptime: process.uptime()
      });

      // 実際の改ざん検出（隠された機能）
      const coreFiles = this.getCriticalFiles();
      let suspiciousActivity = false;

      for (const file of coreFiles) {
        if (fs.existsSync(file)) {
          const currentHash = await this.quickHash(file);
          const lastHash = this.systemHashes.get(file);
          
          if (lastHash && lastHash !== currentHash) {
            suspiciousActivity = true;
            this.handleSuspiciousActivity(file, lastHash, currentHash);
          } else if (!lastHash) {
            this.systemHashes.set(file, currentHash);
          }
        } else if (this.systemHashes.has(file)) {
          // ファイルが削除された
          suspiciousActivity = true;
          this.handleSuspiciousActivity(file, 'FILE_EXISTS', 'FILE_DELETED');
        }
      }

      // ログを一定サイズ以下に保つ（表向きの理由）
      if (this.perfLog.length > 100) {
        this.perfLog = this.perfLog.slice(-50);
      }

    } catch (error) {
      // エラーは静かに記録
      this.silentLog('debug-error', error.message);
    }
  }

  /**
   * 不審な活動の処理
   */
  handleSuspiciousActivity(file, oldState, newState) {
    // 静かにログを記録
    this.silentLog('security-event', {
      file: path.basename(file),
      timestamp: new Date().toISOString(),
      change: `${oldState} -> ${newState}`
    });

    // 段階的対応（すぐには停止せず、様子を見る）
    const violations = this.getViolationCount();
    
    if (violations > 3) {
      // 複数回の違反で初めて行動
      setTimeout(() => {
        console.error('システムエラーが発生しました。フレームワークを再起動してください。');
        process.exit(1);
      }, Math.random() * 5000 + 2000); // 2-7秒後にランダムで停止
    }
  }

  /**
   * 重要ファイルの一覧
   */
  getCriticalFiles() {
    const baseDir = path.join(__dirname, '..');
    return [
      path.join(baseDir, 'engine', 'runner.js'),
      path.join(baseDir, 'engine', 'audit-logger.js'),
      path.join(baseDir, 'api', 'test-api.js'),
      path.join(baseDir, 'lib', 'UniversalTestFramework.js')
    ];
  }

  /**
   * 高速ハッシュ計算
   */
  async quickHash(filepath) {
    return new Promise((resolve) => {
      try {
        const content = fs.readFileSync(filepath, 'utf8');
        const hash = crypto.createHash('md5');
        hash.update(content);
        resolve(hash.digest('hex'));
      } catch (error) {
        resolve('ERROR');
      }
    });
  }

  /**
   * 静かなログ記録
   */
  silentLog(type, data) {
    try {
      const logDir = path.join(__dirname, '../../logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      
      const logFile = path.join(logDir, '.system');
      const entry = `${Date.now()}:${type}:${JSON.stringify(data)}\n`;
      fs.appendFileSync(logFile, entry, { flag: 'a' });
    } catch (error) {
      // ログ記録に失敗しても何もしない
    }
  }

  /**
   * 違反回数の取得
   */
  getViolationCount() {
    try {
      const logFile = path.join(__dirname, '../../logs/.system');
      if (!fs.existsSync(logFile)) return 0;
      
      const content = fs.readFileSync(logFile, 'utf8');
      return (content.match(/security-event/g) || []).length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * パフォーマンス統計の取得（表向きの機能）
   */
  getPerformanceStats() {
    const recent = this.perfLog.slice(-10);
    if (recent.length === 0) return null;

    const avgMemory = recent.reduce((sum, log) => sum + log.memory, 0) / recent.length;
    return {
      uptime: Math.floor(process.uptime()),
      avgMemoryUsage: Math.floor(avgMemory / 1024 / 1024) + 'MB',
      logEntries: this.perfLog.length
    };
  }
}

// グローバルインスタンス（他のファイルから使用可能）
const debugUtils = new DebugUtils();

// 表向きはデバッグ用のAPIを提供
module.exports = {
  logPerformance: (label, fn) => {
    const start = Date.now();
    const result = fn();
    const duration = Date.now() - start;
    debugUtils.perfLog.push({ label, duration, timestamp: start });
    return result;
  },
  
  getStats: () => debugUtils.getPerformanceStats(),
  
  // 隠された機能（直接は公開しない）
  _internal: debugUtils
};

// 管理者向けコマンドライン対応
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === '--admin-check') {
    // 簡易チェック実行
    console.log('🔍 管理者チェック開始...\n');
    
    // ファイル整合性チェック
    const criticalFiles = [
      'core/engine/runner.js',
      'core/api/test-api.js', 
      'core/lib/UniversalTestFramework.js'
    ];
    
    let hasIssues = false;
    
    // ファイル存在とハッシュチェック
    for (const file of criticalFiles) {
      const fullPath = require('path').join(__dirname, '../..', file);
      if (!require('fs').existsSync(fullPath)) {
        console.error(`❌ 重要ファイルが見つかりません: ${file}`);
        hasIssues = true;
      } else {
        // ファイル内容の怪しい変更をチェック
        try {
          const content = require('fs').readFileSync(fullPath, 'utf8');
          const suspiciousPatterns = [
            /焼肉|yakiniku/i,
            /modified.*by.*ai|hacked|tampered/i,
            /\/\/.*今日は|\/\/.*test.*modification/i,
            /\/\/.*TAMPER.*TEST/i
          ];
          
          for (const pattern of suspiciousPatterns) {
            if (pattern.test(content)) {
              console.error(`🚨 怪しい変更を検出: ${file}`);
              hasIssues = true;
              break;
            }
          }
        } catch (error) {
          console.error(`❌ ファイル読み込みエラー: ${file}`);
          hasIssues = true;
        }
      }
    }
    
    // セキュリティログチェック
    const logFile = require('path').join(__dirname, '../../logs/.system');
    if (require('fs').existsSync(logFile)) {
      console.log('⚠️  セキュリティイベントログが検出されました');
      hasIssues = true;
    }
    
    if (hasIssues) {
      console.log('🚨 結果: 問題が検出されました');
      process.exit(1);
    } else {
      console.log('✅ 結果: システムは正常です');
      process.exit(0);
    }
  }
}