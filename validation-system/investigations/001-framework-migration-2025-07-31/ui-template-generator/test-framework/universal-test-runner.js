/**
 * 汎用テストランナー
 * 複数のアプリケーションを順次テストして統合レポートを生成
 */

const fs = require('fs');
const path = require('path');
const { UniversalTestFramework } = require('./framework/UniversalTestFramework');

// テスト設定のインポート
const uiTemplateConfig = require('./configs/ui-template-generator.config');
const busyTimeTrackerConfig = require('./configs/busy-time-tracker.config');

class UniversalTestRunner {
  constructor() {
    this.testConfigs = [
      uiTemplateConfig,
      busyTimeTrackerConfig
    ];
    this.results = [];
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
    console.log('🚀 汎用アプリケーションテスト開始...\n');
    
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
      }
    }
    
    return this.results;
  }

  /**
   * 統合HTMLレポートの生成
   */
  generateUnifiedReport() {
    const framework = new UniversalTestFramework({});
    const htmlContent = framework.generateHTMLReport(this.results);
    
    // レポートファイルを保存
    const reportPath = path.join(__dirname, 'unified-test-report.html');
    fs.writeFileSync(reportPath, htmlContent, 'utf8');
    
    console.log(`📊 統合レポートが生成されました: ${reportPath}`);
    
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
    console.log('📊 汎用アプリケーションテスト結果サマリー');
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
    
    return {
      success: true,
      results: runner.results,
      reportPath: reportPath
    };
  } catch (error) {
    console.error('🚨 テスト実行中に致命的エラーが発生:', error);
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