// 高さ変更のデバッグテスト
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
  console.log('=== 高さ変更テストのデバッグ ===\n');
  
  const generator = window.uiTemplateGenerator;
  console.log('1. UITemplateGeneratorインスタンス:', generator ? '存在' : '存在しない');
  
  // 初期状態の確認
  console.log('2. 初期selectedHeight:', generator.selectedHeight);
  
  // 新規グループを作成
  generator.createNewGroup();
  const group = document.querySelector('.button-group');
  console.log('3. グループ作成:', group ? '成功' : '失敗');
  
  // 作成されたボタンの初期高さ
  const button = group.querySelector('.generated-button');
  console.log('4. ボタンの初期高さ:', button.style.height);
  
  // チェックボックスをチェック
  const checkbox = group.querySelector('.group-checkbox');
  checkbox.checked = true;
  const changeEvent = document.createEvent('Event');
  changeEvent.initEvent('change', true, true);
  checkbox.dispatchEvent(changeEvent);
  console.log('5. チェックボックス:', checkbox.checked ? 'チェック済み' : '未チェック');
  console.log('   selectedGroupIds:', generator.selectedGroupIds);
  
  // 高さセレクターの状態を確認
  const heightSelector = document.querySelector('#heightSelector');
  const currentSelected = heightSelector.querySelector('.selected');
  console.log('6. 現在選択されている高さ:', currentSelected.getAttribute('data-value'));
  
  // 高さを60に変更
  const heightBtn = document.querySelector('#heightSelector [data-value="60"]');
  console.log('7. 60pxボタン:', heightBtn ? '存在' : '存在しない');
  
  if (heightBtn) {
    // クリックイベントを発火
    const clickEvent = document.createEvent('Event');
    clickEvent.initEvent('click', true, true);
    heightBtn.dispatchEvent(clickEvent);
    
    // 変更後の状態を確認
    const newSelected = document.querySelector('#heightSelector .selected');
    console.log('8. クリック後の選択値:', newSelected.getAttribute('data-value'));
    console.log('   generator.selectedHeight:', generator.selectedHeight);
  }
  
  // 反映ボタンをクリック
  console.log('\n9. 反映ボタンクリック前:');
  console.log('   selectedGroupIds:', generator.selectedGroupIds);
  console.log('   selectedHeight:', generator.selectedHeight);
  
  const applyBtn = document.querySelector('#applySizeBtn');
  const applyClickEvent = document.createEvent('Event');
  applyClickEvent.initEvent('click', true, true);
  applyBtn.dispatchEvent(applyClickEvent);
  
  // 結果を確認
  console.log('\n10. 反映後の結果:');
  console.log('   ボタンのstyle.height:', button.style.height);
  console.log('   groupInfo.height:', generator.buttonGroups[0].height);
  
  // 実際のapplyButtonSize関数の動作を確認
  console.log('\n11. 手動でapplyButtonSizeを実行:');
  generator.selectedHeight = 70;
  generator.selectedGroupIds = ['group-1'];
  generator.applyButtonSize();
  console.log('   selectedHeight=70で実行後のボタン高さ:', button.style.height);
  
  process.exit(0);
}, 100);