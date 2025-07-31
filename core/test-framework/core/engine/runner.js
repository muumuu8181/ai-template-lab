/**
 * テストランナー v0.2
 * v0.1の機能を保持しつつ、改ざん防止機能を統合
 */

const fs = require('fs');
const path = require('path');
const { UniversalTestFramework } = require('../lib/UniversalTestFramework');
const { IntegrityChecker } = require('./integrity');
const { AuditLogger } = require('./audit-logger');
const debugUtils = require('./debug-utils'); // パフォーマンス監視

// テスト設定のインポート
const currentAppConfig = require('../../configs/current-app.config');

class UniversalTestRunner {
  constructor() {
    this.testConfigs = [
      currentAppConfig
    ];
    this.results = [];
    this.integrityChecker = new IntegrityChecker();
    this.auditLogger = new AuditLogger();
  }

  /**
   * Jest環境のセットアップ（JSDOM環境の模擬）
   */
  setupJestEnvironment() {
    // JSDOMの基本的な環境を模擬
    if (typeof document === 'undefined') {
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      global.document = dom.window.document;
      global.window = dom.window;
      
      // navigatorは読み取り専用なので条件付きで設定
      if (!global.navigator) {
        try {
          global.navigator = dom.window.navigator;
        } catch (error) {
          // navigatorが読み取り専用の場合は無視
          console.log('Navigator設定をスキップ:', error.message);
        }
      }
    }
  }

  /**
   * 全アプリケーションのテストを実行
   */
  async runAllApplicationTests() {
    console.log('🚀 汎用アプリケーションテスト v0.2 開始...\n');
    
    // システム整合性チェック
    console.log('🔒 システム整合性チェック...');
    const integrityResult = await this.integrityChecker.verifySystemIntegrity();
    if (integrityResult.status !== 'verified') {
      console.error('❌ システム整合性エラー: コアファイルが改ざんされています');
      this.auditLogger.log('INTEGRITY_VIOLATION', integrityResult);
      process.exit(1);
    }
    console.log('✅ システム整合性: 正常\n');
    
    // テスト開始を記録
    this.auditLogger.log('TEST_RUN_START', {
      version: '0.2',
      apps: this.testConfigs.map(c => c.appName)
    });
    
    // Jest環境セットアップ
    this.setupJestEnvironment();
    
    // 各アプリケーションのテストを順次実行
    for (const config of this.testConfigs) {
      try {
        console.log(`📱 ${config.appName} のテスト実行中...`);
        
        const framework = new UniversalTestFramework(config);
        const result = await framework.runAllTests();
        
        this.results.push(result);
        
        console.log(`✅ ${config.appName}: ${result.successCount}/${result.totalCount} (${result.successRate}%)\n`);
        
        // テスト結果を記録
        this.auditLogger.log('TEST_APP_COMPLETE', {
          appName: config.appName,
          successRate: result.successRate,
          duration: result.duration
        });
        
      } catch (error) {
        console.error(`❌ ${config.appName} でエラーが発生:`, error.message);
        
        this.results.push({
          appName: config.appName,
          success: false,
          successCount: 0,
          totalCount: 0,
          successRate: 0,
          duration: 0,
          error: error.message,
          results: []
        });
        
        // エラーを記録
        this.auditLogger.log('TEST_APP_ERROR', {
          appName: config.appName,
          error: error.message
        });
      }
    }
    
    return this.results;
  }

  /**
   * HTMLレポートにダウンロード機能を追加
   */
  addDownloadFunctionality(htmlContent) {
    const downloadScript = `
    <script>
    function downloadTestReport() {
      const content = document.documentElement.outerHTML;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = \`test-report-\${timestamp}.html\`;
      
      // 常にデフォルトダウンロードフォルダに保存（フォルダ選択なし）
      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      // 成功メッセージ
      alert('テストレポートをダウンロードしました: ' + filename);
    }
    </script>`;
    
    // ダウンロードボタンを追加
    const downloadButton = `
      <div style="text-align: center; margin: 20px 0;">
        <button onclick="downloadTestReport()" style="
          background: #007bff; color: white; border: none; padding: 10px 20px; 
          border-radius: 5px; cursor: pointer; font-size: 16px;
        ">📥 テストレポートをダウンロード</button>
      </div>`;
    
    // HTMLにスクリプトとボタンを挿入
    return htmlContent
      .replace('</head>', downloadScript + '</head>')
      .replace('<h1>🧪 汎用アプリケーションテスト結果</h1>', 
               '<h1>🧪 汎用アプリケーションテスト結果</h1>' + downloadButton);
  }

  /**
   * 統合HTMLレポートの生成
   */
  generateUnifiedReport() {
    const framework = new UniversalTestFramework({});
    const htmlContent = framework.generateHTMLReport(this.results);
    
    // ダウンロード機能を追加したHTMLを生成
    const enhancedHtmlContent = this.addDownloadFunctionality(htmlContent);
    
    // レポートファイルを保存
    const reportPath = path.join(__dirname, '../../unified-test-report.html');
    fs.writeFileSync(reportPath, enhancedHtmlContent, 'utf8');
    
    console.log(`📊 統合レポートが生成されました: ${reportPath}`);
    
    // レポート生成を記録
    this.auditLogger.log('REPORT_GENERATED', {
      path: reportPath,
      totalApps: this.results.length
    });
    
    return reportPath;
  }

  /**
   * コンソール用サマリーレポート
   */
  printSummary() {
    const totalApps = this.results.length;
    const successfulApps = this.results.filter(r => r.success).length;
    const totalTests = this.results.reduce((sum, r) => sum + r.totalCount, 0);
    const totalSuccess = this.results.reduce((sum, r) => sum + r.successCount, 0);
    const overallRate = totalTests > 0 ? (totalSuccess / totalTests * 100).toFixed(1) : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 汎用アプリケーションテスト結果サマリー (v0.2)');
    console.log('='.repeat(60));
    console.log(`🎯 対象アプリケーション: ${totalApps}個`);
    console.log(`✅ 完全成功アプリ: ${successfulApps}個`);
    console.log(`📋 総テスト数: ${totalTests}個`);
    console.log(`🎉 成功テスト: ${totalSuccess}個`);
    console.log(`📈 全体成功率: ${overallRate}%`);
    console.log('='.repeat(60));
    
    // アプリ別詳細
    this.results.forEach(result => {
      const status = result.success ? '✅' : '⚠️';
      console.log(`${status} ${result.appName}: ${result.successCount}/${result.totalCount} (${result.successRate}%) - ${result.duration}ms`);
      
      if (result.error) {
        console.log(`   ❌ エラー: ${result.error}`);
      }
    });
    
    console.log('='.repeat(60) + '\n');
  }
}

// Jest環境での実行をサポート
async function runUniversalTests() {
  const runner = new UniversalTestRunner();
  
  try {
    await runner.runAllApplicationTests();
    runner.printSummary();
    const reportPath = runner.generateUnifiedReport();
    
    // テスト完了を記録
    runner.auditLogger.log('TEST_RUN_COMPLETE', {
      success: true,
      totalApps: runner.results.length,
      reportPath
    });
    
    return {
      success: true,
      results: runner.results,
      reportPath: reportPath
    };
  } catch (error) {
    console.error('🚨 テスト実行中に致命的エラーが発生:', error);
    
    // 致命的エラーを記録
    runner.auditLogger.log('TEST_RUN_FATAL_ERROR', {
      error: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      error: error.message,
      results: runner.results
    };
  }
}

// 直接実行された場合
if (require.main === module) {
  runUniversalTests().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { UniversalTestRunner, runUniversalTests };