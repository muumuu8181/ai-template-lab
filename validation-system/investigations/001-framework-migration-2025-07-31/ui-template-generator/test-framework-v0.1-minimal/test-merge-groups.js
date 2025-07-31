// 横1列にまとめる機能のテスト
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// HTMLとJSを読み込み
const html = fs.readFileSync(path.join('/mnt/c/Users/user/ui-template-generator', 'index.html'), 'utf8');
const scriptContent = fs.readFileSync(path.join('/mnt/c/Users/user/ui-template-generator', 'script.js'), 'utf8');

// JSDOM環境を構築
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable'
});

global.document = dom.window.document;
global.window = dom.window;

// scriptを実行
const scriptElement = document.createElement('script');
scriptElement.textContent = scriptContent;
document.head.appendChild(scriptElement);

// DOMContentLoadedを発火
const event = document.createEvent('Event');
event.initEvent('DOMContentLoaded', true, true);
document.dispatchEvent(event);

// テスト実行
setTimeout(() => {
  console.log('=== 横1列にまとめる機能のテスト ===\n');
  
  const generator = window.uiTemplateGenerator;
  
  // グループを2つ作成
  generator.createNewGroup();
  generator.createNewGroup();
  
  console.log('1. グループ数:', generator.buttonGroups.length);
  
  // 両方のグループにチェック
  const checkboxes = document.querySelectorAll('.group-checkbox');
  checkboxes.forEach((checkbox, index) => {
    checkbox.checked = true;
    const event = document.createEvent('Event');
    event.initEvent('change', true, true);
    checkbox.dispatchEvent(event);
  });
  
  console.log('2. 選択されたグループ:', generator.selectedGroupIds);
  console.log('3. まとめるボタンの状態:', generator.mergeGroupsBtn.disabled ? '無効' : '有効');
  
  // まとめるボタンをクリック
  try {
    generator.mergeSelectedGroups();
    console.log('4. まとめる処理: 成功');
    
    // 結果を確認
    const groupRows = document.querySelectorAll('.group-row');
    console.log('5. group-rowの数:', groupRows.length);
    console.log('6. mergedRows:', generator.getCurrentUIState().mergedRows);
    
  } catch (error) {
    console.log('4. まとめる処理: エラー発生');
    console.log('   エラー内容:', error.message);
  }
  
  process.exit(0);
}, 100);