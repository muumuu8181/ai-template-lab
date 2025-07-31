/**
 * 監査ログシステム
 * すべての操作を改ざん不可能な形で記録
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AuditLogger {
  constructor() {
    this.logPath = path.join(__dirname, '../../logs/audit');
    this.checksumPath = path.join(__dirname, '../../logs/checksums');
    this.currentDate = this.getCurrentDate();
    this.initializeDirectories();
  }

  /**
   * ディレクトリの初期化
   */
  initializeDirectories() {
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
    
    if (!fs.existsSync(this.checksumPath)) {
      fs.mkdirSync(this.checksumPath, { recursive: true });
    }
  }

  /**
   * ログエントリの記録
   */
  log(action, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      user: process.env.USER || 'system',
      processId: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      checksum: null
    };
    
    // エントリ自体のチェックサム計算
    const entryWithoutChecksum = { ...entry };
    delete entryWithoutChecksum.checksum;
    entry.checksum = this.calculateChecksum(JSON.stringify(entryWithoutChecksum));
    
    // ログファイルに追記
    this.appendToLog(entry);
    
    // 重要なアクションの場合はアラート
    if (this.isCriticalAction(action)) {
      this.sendAlert(entry);
    }
  }

  /**
   * ログファイルへの追記（改ざん防止）
   */
  appendToLog(entry) {
    const logFile = this.getLogFile();
    const logLine = JSON.stringify(entry) + '\n';
    
    // ファイルに追記（既存の内容は変更しない）
    fs.appendFileSync(logFile, logLine, { flag: 'a' });
    
    // チェックサムマニフェストの更新
    this.updateChecksumManifest(logFile);
  }

  /**
   * チェックサムマニフェストの更新
   */
  updateChecksumManifest(logFile) {
    const manifestFile = path.join(this.checksumPath, 'manifest.json');
    let manifest = {};
    
    if (fs.existsSync(manifestFile)) {
      manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    }
    
    // ログファイル全体のチェックサム計算
    const content = fs.readFileSync(logFile, 'utf8');
    const fileChecksum = this.calculateChecksum(content);
    
    manifest[path.basename(logFile)] = {
      checksum: fileChecksum,
      lastModified: new Date().toISOString(),
      lines: content.split('\n').filter(line => line.trim()).length
    };
    
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  }

  /**
   * ログの改ざんチェック
   */
  verifyLogs(date = null) {
    const targetDate = date || this.currentDate;
    const logFile = path.join(this.logPath, `${targetDate}.log`);
    
    if (!fs.existsSync(logFile)) {
      return {
        verified: false,
        error: 'ログファイルが存在しません'
      };
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const violations = [];
    
    // 各エントリのチェックサム検証
    lines.forEach((line, index) => {
      try {
        const entry = JSON.parse(line);
        const storedChecksum = entry.checksum;
        
        delete entry.checksum;
        const calculatedChecksum = this.calculateChecksum(JSON.stringify(entry));
        
        if (storedChecksum !== calculatedChecksum) {
          violations.push({
            line: index + 1,
            expected: storedChecksum,
            actual: calculatedChecksum
          });
        }
      } catch (error) {
        violations.push({
          line: index + 1,
          error: error.message
        });
      }
    });
    
    // ファイル全体のチェックサム検証
    const manifestFile = path.join(this.checksumPath, 'manifest.json');
    if (fs.existsSync(manifestFile)) {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      const logFileName = path.basename(logFile);
      
      if (manifest[logFileName]) {
        const storedFileChecksum = manifest[logFileName].checksum;
        const currentFileChecksum = this.calculateChecksum(content);
        
        if (storedFileChecksum !== currentFileChecksum) {
          violations.push({
            type: 'file',
            expected: storedFileChecksum,
            actual: currentFileChecksum
          });
        }
      }
    }
    
    return {
      verified: violations.length === 0,
      violations,
      totalEntries: lines.length,
      date: targetDate
    };
  }

  /**
   * 最近のログエントリ取得
   */
  getRecentLogs(count = 10, filter = null) {
    const logFile = this.getLogFile();
    
    if (!fs.existsSync(logFile)) {
      return [];
    }
    
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    let entries = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(entry => entry !== null);
    
    // フィルタリング
    if (filter) {
      if (filter.action) {
        entries = entries.filter(e => e.action === filter.action);
      }
      if (filter.after) {
        entries = entries.filter(e => new Date(e.timestamp) > new Date(filter.after));
      }
    }
    
    // 最新のエントリから返す
    return entries.slice(-count).reverse();
  }

  /**
   * チェックサムの計算
   */
  calculateChecksum(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 現在の日付取得
   */
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * ログファイルパスの取得
   */
  getLogFile() {
    return path.join(this.logPath, `${this.getCurrentDate()}.log`);
  }

  /**
   * 重要なアクションかどうかの判定
   */
  isCriticalAction(action) {
    const criticalActions = [
      'TAMPERING_DETECTED',
      'INTEGRITY_VIOLATION',
      'UNAUTHORIZED_ACCESS',
      'SYSTEM_COMPROMISE'
    ];
    
    return criticalActions.includes(action);
  }

  /**
   * アラート送信（プレースホルダー）
   */
  sendAlert(entry) {
    console.warn('🚨 重要なセキュリティイベント:', entry.action);
    // 本番環境では、メール送信やSlack通知などを実装
  }

  /**
   * ログのエクスポート（読み取り専用）
   */
  exportLogs(startDate, endDate, format = 'json') {
    const logs = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const logFile = path.join(this.logPath, `${dateStr}.log`);
      
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          try {
            logs.push(JSON.parse(line));
          } catch {
            // 無効な行はスキップ
          }
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    if (format === 'csv') {
      return this.convertToCSV(logs);
    }
    
    return logs;
  }

  /**
   * CSV形式への変換
   */
  convertToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['timestamp', 'action', 'user', 'processId', 'checksum'];
    const rows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = headers.map(h => `"${log[h] || ''}"`).join(',');
      rows.push(row);
    });
    
    return rows.join('\n');
  }
}

module.exports = { AuditLogger };