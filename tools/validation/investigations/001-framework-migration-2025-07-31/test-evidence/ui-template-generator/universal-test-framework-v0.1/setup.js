const fs = require('fs');
const path = require('path');

// HTMLファイルを読み込んでDOMに設定
const htmlPath = path.resolve(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// JSDOMにHTMLを設定
beforeEach(() => {
  document.documentElement.innerHTML = htmlContent;
  
  // script.jsを読み込んで実行
  const scriptPath = path.resolve(__dirname, '../script.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  
  // DOM環境を模擬
  global.navigator = { clipboard: { writeText: jest.fn() } };
  
  // グローバルにクラスを定義
  eval(scriptContent);
  
  // UITemplateGeneratorがグローバルに定義されていることを確認
  try {
    // evalでクラスがwindowオブジェクトに定義される場合があるので確認
    if (typeof UITemplateGenerator !== 'undefined') {
      global.uiGenerator = new UITemplateGenerator();
    } else if (typeof global.UITemplateGenerator !== 'undefined') {
      global.uiGenerator = new global.UITemplateGenerator();
    } else if (typeof window !== 'undefined' && typeof window.UITemplateGenerator !== 'undefined') {
      global.uiGenerator = new window.UITemplateGenerator();
    } else {
      // クラスが見つからない場合は手動でスクリプトを再実行
      const execScript = new Function('return ' + scriptContent + '; new UITemplateGenerator();');
      global.uiGenerator = execScript();
    }
  } catch (error) {
    console.log('UITemplateGenerator作成エラー:', error.message);
    global.uiGenerator = null;
  }
  
  // 少し待つ（初期化のため）
  return new Promise(resolve => setTimeout(resolve, 10));
});