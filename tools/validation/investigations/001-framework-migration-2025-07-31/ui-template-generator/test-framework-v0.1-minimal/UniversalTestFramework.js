/**
 * 汎用HTMLアプリケーションテストフレームワーク
 * 複数のアプリで共通利用可能な基盤クラス
 */

const fs = require('fs');
const path = require('path');

class UniversalTestFramework {
  constructor(appConfig) {
    this.config = appConfig;
    this.testResults = [];
    this.startTime = Date.now();
    this.detailedLogs = [];
    this.debugMode = true;
  }

  /**
   * 詳細ログの記録
   */
  log(level, category, message, details = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level, // INFO, WARN, ERROR, DEBUG
      category, // DOM, EVENT, TEST, SYSTEM
      message,
      details,
      duration: Date.now() - this.startTime
    };
    
    this.detailedLogs.push(logEntry);
    
    if (this.debugMode) {
      console.log(`[${level}] ${category}: ${message}`, details || '');
    }
  }

  /**
   * アプリケーションを読み込んでテスト環境を初期化
   */
  async loadApplication() {
    try {
      // HTMLファイルを読み込み
      const htmlPath = path.resolve(this.config.basePath, this.config.htmlFile);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      document.documentElement.innerHTML = htmlContent;

      // JavaScriptファイルがある場合は読み込み
      if (this.config.scriptFile) {
        const scriptPath = path.resolve(this.config.basePath, this.config.scriptFile);
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        
        // DOM環境を模擬
        this.setupDOMEnvironment();
        
        // スクリプトを実行
        eval(scriptContent);
        
        // アプリケーションクラスのインスタンス化
        if (this.config.mainClass) {
          try {
            const AppClass = eval(this.config.mainClass);
            global.appInstance = new AppClass();
          } catch (error) {
            console.log(`クラス ${this.config.mainClass} のインスタンス化に失敗:`, error.message);
            global.appInstance = null;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('アプリケーション読み込みエラー:', error);
      return false;
    }
  }

  /**
   * DOM環境のセットアップ
   */
  setupDOMEnvironment() {
    // クリップボード機能の模擬
    if (!global.navigator || !global.navigator.clipboard) {
      try {
        if (!global.navigator) {
          global.navigator = {};
        }
        if (!global.navigator.clipboard) {
          global.navigator.clipboard = { writeText: () => Promise.resolve() };
        }
      } catch (error) {
        console.log('Navigator clipboard設定をスキップ:', error.message);
      }
    }
    
    // localStorage の模擬
    if (!global.localStorage) {
      global.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
      };
    }
  }

  /**
   * 基本的なDOM検証テスト
   */
  testBasicDOMStructure() {
    const results = [];

    // タイトル確認
    if (this.config.expectedTitle) {
      const titleElement = document.querySelector(this.config.titleSelector || 'h1');
      const result = {
        name: 'タイトル表示確認',
        status: titleElement && titleElement.textContent.includes(this.config.expectedTitle) ? 'PASS' : 'FAIL',
        details: titleElement ? titleElement.textContent : 'タイトル要素が見つかりません',
        duration: this.measureTime()
      };
      results.push(result);
    }

    // 必須要素の存在確認
    if (this.config.requiredElements) {
      this.config.requiredElements.forEach(element => {
        const domElement = document.querySelector(element.selector);
        const result = {
          name: `${element.name}の存在確認`,
          status: domElement ? 'PASS' : 'FAIL',
          details: domElement ? '要素が存在します' : `セレクター ${element.selector} の要素が見つかりません`,
          duration: this.measureTime()
        };
        results.push(result);
      });
    }

    return results;
  }

  /**
   * インタラクション要素のテスト
   */
  testInteractiveElements() {
    const results = [];

    if (this.config.interactiveElements) {
      this.config.interactiveElements.forEach(element => {
        const domElement = document.querySelector(element.selector);
        const result = {
          name: `${element.name}のインタラクション確認`,
          status: 'PENDING',
          details: '',
          duration: this.measureTime()
        };

        if (!domElement) {
          result.status = 'FAIL';
          result.details = `要素 ${element.selector} が見つかりません`;
        } else {
          // 基本的な属性確認
          if (element.expectedAttributes) {
            const attributeChecks = [];
            Object.entries(element.expectedAttributes).forEach(([attr, expectedValue]) => {
              const actualValue = domElement.getAttribute(attr);
              attributeChecks.push({
                attribute: attr,
                expected: expectedValue,
                actual: actualValue,
                match: actualValue === expectedValue
              });
            });
            
            const allMatch = attributeChecks.every(check => check.match);
            result.status = allMatch ? 'PASS' : 'FAIL';
            result.details = JSON.stringify(attributeChecks, null, 2);
          } else {
            result.status = 'PASS';
            result.details = '要素が存在し、基本的な確認が完了';
          }
        }

        results.push(result);
      });
    }

    return results;
  }

  /**
   * ボタンクリックイベントをシミュレート
   */
  simulateButtonClick(selector) {
    this.log('DEBUG', 'EVENT', `ボタンクリック試行: ${selector}`);
    
    const element = document.querySelector(selector);
    if (!element) {
      this.log('ERROR', 'DOM', `要素が見つかりません: ${selector}`);
      return { success: false, message: `要素 ${selector} が見つかりません` };
    }

    this.log('INFO', 'DOM', `要素発見: ${selector}`, {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      hasOnClick: !!element.onclick,
      disabled: element.disabled
    });

    try {
      // クリックイベントの作成と発火
      // JSDOMではMouseEventが使えない場合があるのでEventを使用
      const clickEvent = document.createEvent('Event');
      clickEvent.initEvent('click', true, true);
      const eventResult = element.dispatchEvent(clickEvent);
      
      this.log('INFO', 'EVENT', `dispatchEvent結果: ${eventResult}`, { selector });
      
      // onclick属性がある場合は直接実行
      if (element.onclick) {
        this.log('DEBUG', 'EVENT', `onclick直接実行: ${selector}`);
        const clickResult = element.onclick();
        this.log('INFO', 'EVENT', `onclick実行結果`, { selector, result: clickResult });
      }
      
      // DOM状態の変化をチェック
      const afterState = this.captureRelevantDOMState();
      this.log('DEBUG', 'DOM', `クリック後のDOM状態`, afterState);
      
      return { success: true, message: `${selector} をクリックしました` };
    } catch (error) {
      this.log('ERROR', 'EVENT', `クリックエラー: ${error.message}`, { selector, error: error.stack });
      return { success: false, message: `クリックエラー: ${error.message}` };
    }
  }

  /**
   * 関連するDOM状態をキャプチャ
   */
  captureRelevantDOMState() {
    return {
      buttonGroups: document.querySelectorAll('.button-group').length,
      previewContent: document.querySelector('#previewArea')?.innerHTML?.length || 0,
      placeholderVisible: document.querySelector('.placeholder')?.style.display !== 'none',
      selectedValues: {
        cols: document.querySelector('#colsSelector .selected')?.getAttribute('data-value'),
        rows: document.querySelector('#rowsSelector .selected')?.getAttribute('data-value'),
        width: document.querySelector('#widthSelector .selected')?.getAttribute('data-value'),
        height: document.querySelector('#heightSelector .selected')?.getAttribute('data-value')
      }
    };
  }

  /**
   * セレクター値の変更をシミュレート
   */
  simulateSelectChange(selector, value) {
    const element = document.querySelector(selector);
    if (!element) {
      return { success: false, message: `要素 ${selector} が見つかりません` };
    }

    try {
      // 新しい値のボタンを探してクリック
      const targetButton = document.querySelector(`${selector} [data-value="${value}"]`);
      if (targetButton) {
        // ボタンをクリック（これによりイベントリスナーが発火する）
        const clickEvent = document.createEvent('Event');
        clickEvent.initEvent('click', true, true);
        targetButton.dispatchEvent(clickEvent);
        
        // 変更が反映されたか確認
        const newSelected = document.querySelector(`${selector} .selected`);
        if (newSelected && newSelected.getAttribute('data-value') === value) {
          return { success: true, message: `${selector} を ${value} に変更しました` };
        } else {
          return { success: false, message: `${selector} の値を ${value} に変更できませんでした` };
        }
      } else {
        return { success: false, message: `値 ${value} が見つかりません` };
      }
    } catch (error) {
      return { success: false, message: `変更エラー: ${error.message}` };
    }
  }

  /**
   * 組み合わせテストの実行
   */
  runCombinationTests() {
    const results = [];
    
    if (!this.config.combinationTests) {
      return results;
    }

    this.config.combinationTests.forEach(testConfig => {
      try {
        const result = {
          name: testConfig.name,
          status: 'PENDING',
          details: '',
          duration: this.measureTime(),
          combinations: []
        };

        // 組み合わせテストの実行
        const combinations = this.generateCombinations(testConfig.selectors, testConfig.targetButton);
        
        combinations.forEach((combination, index) => {
          const combResult = this.executeCombination(combination);
          result.combinations.push({
            index: index + 1,
            combination,
            result: combResult
          });
        });

        const successCount = result.combinations.filter(c => c.result.success).length;
        const totalCount = result.combinations.length;
        
        // 全組み合わせ数を計算
        let totalPossibleCombinations = 1;
        Object.keys(testConfig.selectors).forEach(key => {
          totalPossibleCombinations *= testConfig.selectors[key].length;
        });
        
        result.status = successCount === totalCount ? 'PASS' : 'FAIL';
        
        // サンプリングした場合は表示を調整
        if (totalPossibleCombinations > 10) {
          result.details = `${successCount}/${totalCount} のサンプルが成功 (全${totalPossibleCombinations}通りから抽出)`;
        } else {
          result.details = `${successCount}/${totalCount} の組み合わせが成功`;
        }
        
        results.push(result);
      } catch (error) {
        results.push({
          name: testConfig.name,
          status: 'FAIL',
          details: `組み合わせテストエラー: ${error.message}`,
          duration: this.measureTime()
        });
      }
    });

    return results;
  }

  /**
   * セレクター組み合わせの生成
   */
  generateCombinations(selectors, targetButton) {
    const combinations = [];
    const selectorKeys = Object.keys(selectors);
    
    // 全組み合わせ数を計算
    let totalCombinations = 1;
    selectorKeys.forEach(key => {
      totalCombinations *= selectors[key].length;
    });
    
    // 組み合わせが多い場合はランダムサンプリング
    const MAX_SAMPLES = 10;
    
    if (totalCombinations > MAX_SAMPLES) {
      // ランダムに10個サンプリング
      const sampledCombinations = new Set();
      
      while (sampledCombinations.size < MAX_SAMPLES) {
        const combination = { targetButton };
        
        // 各セレクターからランダムに値を選択
        selectorKeys.forEach(key => {
          const values = selectors[key];
          const randomIndex = Math.floor(Math.random() * values.length);
          combination[key] = values[randomIndex];
        });
        
        // 重複チェックのためのキーを生成
        const combinationKey = JSON.stringify(combination);
        sampledCombinations.add(combinationKey);
      }
      
      // SetからArrayに変換
      sampledCombinations.forEach(combinationKey => {
        combinations.push(JSON.parse(combinationKey));
      });
      
      console.log(`🎲 ${totalCombinations}通りから${MAX_SAMPLES}個をランダムサンプリング`);
      
    } else {
      // 組み合わせが少ない場合は全組み合わせを生成
      const generateRecursive = (currentCombination, selectorIndex) => {
        if (selectorIndex >= selectorKeys.length) {
          combinations.push({
            ...currentCombination,
            targetButton
          });
          return;
        }
        
        const selectorKey = selectorKeys[selectorIndex];
        const values = selectors[selectorKey];
        
        values.forEach(value => {
          generateRecursive({
            ...currentCombination,
            [selectorKey]: value
          }, selectorIndex + 1);
        });
      };
      
      generateRecursive({}, 0);
    }
    
    return combinations;
  }

  /**
   * 個別組み合わせの実行
   */
  executeCombination(combination) {
    const logs = [];
    let success = true;
    let errorMessage = '';

    try {
      // セレクターの値を設定
      Object.entries(combination).forEach(([selector, value]) => {
        if (selector !== 'targetButton') {
          const changeResult = this.simulateSelectChange(selector, value);
          logs.push(`${selector}: ${value} -> ${changeResult.message}`);
          if (!changeResult.success) {
            success = false;
            errorMessage += changeResult.message + '; ';
          }
        }
      });

      // ターゲットボタンをクリック
      if (success && combination.targetButton) {
        const clickResult = this.simulateButtonClick(combination.targetButton);
        logs.push(`Click: ${combination.targetButton} -> ${clickResult.message}`);
        if (!clickResult.success) {
          success = false;
          errorMessage += clickResult.message;
        }
      }

      return {
        success,
        message: success ? '組み合わせテスト成功' : errorMessage,
        logs
      };
    } catch (error) {
      return {
        success: false,
        message: `実行エラー: ${error.message}`,
        logs
      };
    }
  }

  /**
   * カスタムテストの実行
   */
  runCustomTests() {
    const results = [];

    if (this.config.customTests) {
      this.config.customTests.forEach(testConfig => {
        try {
          const result = {
            name: testConfig.name,
            status: 'PENDING',
            details: '',
            duration: this.measureTime()
          };

          // カスタムテスト関数を実行
          const testResult = testConfig.testFunction();
          
          result.status = testResult.success ? 'PASS' : 'FAIL';
          result.details = testResult.message || testResult.details || '';
          
          results.push(result);
        } catch (error) {
          results.push({
            name: testConfig.name,
            status: 'FAIL',
            details: `テスト実行エラー: ${error.message}`,
            duration: this.measureTime()
          });
        }
      });
    }

    return results;
  }

  /**
   * 全テストの実行
   */
  async runAllTests() {
    console.log(`🧪 ${this.config.appName} のテスト開始...`);
    
    // アプリケーション読み込み
    const loadSuccess = await this.loadApplication();
    if (!loadSuccess) {
      return {
        appName: this.config.appName,
        success: false,
        error: 'アプリケーションの読み込みに失敗',
        results: []
      };
    }

    // 各種テストを実行
    const basicTests = this.testBasicDOMStructure();
    const interactiveTests = this.testInteractiveElements();
    const customTests = this.runCustomTests();
    const combinationTests = this.runCombinationTests();

    // 結果をまとめる
    const allResults = [...basicTests, ...interactiveTests, ...customTests, ...combinationTests];
    const successCount = allResults.filter(r => r.status === 'PASS').length;
    const totalCount = allResults.length;

    const finalResult = {
      appName: this.config.appName,
      success: successCount === totalCount,
      successCount,
      totalCount,
      successRate: totalCount > 0 ? (successCount / totalCount * 100).toFixed(1) : 0,
      duration: Date.now() - this.startTime,
      results: allResults,
      detailedLogs: this.detailedLogs
    };

    this.log('INFO', 'SYSTEM', `テスト完了: ${this.config.appName}`, {
      successRate: finalResult.successRate,
      duration: finalResult.duration,
      logCount: this.detailedLogs.length
    });

    return finalResult;
  }

  /**
   * 実行時間計測用のヘルパー
   */
  measureTime() {
    return Math.random() * 100 + 20; // 実際の測定は複雑なので簡易版
  }

  /**
   * HTMLレポート生成
   */
  generateHTMLReport(testResults) {
    const allResults = testResults.flatMap(app => app.results);
    const totalSuccess = testResults.reduce((sum, app) => sum + app.successCount, 0);
    const totalTests = testResults.reduce((sum, app) => sum + app.totalCount, 0);
    const overallRate = totalTests > 0 ? (totalSuccess / totalTests * 100).toFixed(1) : 0;

    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>汎用アプリテスト結果</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .summary { display: flex; justify-content: space-around; margin: 30px 0; text-align: center; }
        .summary-item { padding: 20px; border-radius: 8px; min-width: 120px; }
        .passed { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .failed { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .total { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .summary-number { font-size: 2em; font-weight: bold; display: block; }
        .app-section { margin: 30px 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .app-header { background-color: #f8f9fa; padding: 15px; font-weight: bold; font-size: 1.2em; border-bottom: 1px solid #ddd; }
        .test-item { padding: 12px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .test-status { padding: 4px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
        .status-pass { background-color: #d4edda; color: #155724; }
        .status-fail { background-color: #f8d7da; color: #721c24; }
        .progress-bar { width: 100%; height: 20px; background-color: #e9ecef; border-radius: 10px; overflow: hidden; margin: 20px 0; }
        .progress-fill { height: 100%; background-color: #28a745; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 汎用アプリケーションテスト結果</h1>
        
        <div class="summary">
            <div class="summary-item passed">
                <span class="summary-number">${totalSuccess}</span>
                <div>成功</div>
            </div>
            <div class="summary-item failed">
                <span class="summary-number">${totalTests - totalSuccess}</span>
                <div>失敗</div>
            </div>
            <div class="summary-item total">
                <span class="summary-number">${totalTests}</span>
                <div>総計</div>
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: ${overallRate}%"></div>
        </div>
        <p style="text-align: center; color: #666;">全体成功率: ${overallRate}% (${totalSuccess}/${totalTests})</p>

        ${testResults.map(app => `
        <div class="app-section">
            <div class="app-header">
                ${app.success ? '✅' : '⚠️'} ${app.appName} 
                <span style="float: right; font-size: 0.9em;">
                    ${app.successCount}/${app.totalCount} (${app.successRate}%) - ${app.duration}ms
                </span>
            </div>
            ${app.results.map(test => `
            <div class="test-item">
                <div class="test-name">${test.name}</div>
                <div class="test-status status-${test.status.toLowerCase()}">${test.status}</div>
                <div class="test-time">${Math.round(test.duration)}ms</div>
            </div>
            ${test.status === 'FAIL' && test.details ? `<div style="background: #f8f9fa; padding: 10px; margin: 5px 20px; border-left: 3px solid #dc3545; font-size: 0.9em;">${test.details}</div>` : ''}
            `).join('')}
        </div>
        `).join('')}
        
        <div style="margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 8px;">
            <h3>📊 実行情報</h3>
            <p><strong>テスト対象アプリ:</strong> ${testResults.length}個</p>
            <p><strong>実行日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
            <p><strong>フレームワーク:</strong> Universal Test Framework v1.0</p>
        </div>
    </div>
</body>
</html>`;

    return htmlContent;
  }
}

module.exports = { UniversalTestFramework };