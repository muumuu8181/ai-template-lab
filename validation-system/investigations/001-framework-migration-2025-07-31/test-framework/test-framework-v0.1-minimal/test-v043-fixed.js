import { JSDOM } from 'jsdom';
import fs from 'fs';

console.log('=== UI Template Generator v0.43 修正版テスト ===\n');

// HTMLを読み込む（scriptタグを削除）
let html = fs.readFileSync('../../ui-template-generator/index.html', 'utf8');
html = html.replace('<script src="script.js"></script>', '');

// JSDOMを設定
const dom = new JSDOM(html, { 
    runScripts: 'dangerously',
    resources: 'usable'
});
const window = dom.window;
const document = window.document;

// script.jsを読み込んで実行
const scriptContent = fs.readFileSync('../../ui-template-generator/script.js', 'utf8');
const scriptElement = document.createElement('script');
scriptElement.textContent = scriptContent;
document.head.appendChild(scriptElement);

// DOMContentLoadedイベントを手動で発火
const event = new window.Event('DOMContentLoaded', {
    bubbles: true,
    cancelable: true
});
document.dispatchEvent(event);

// 少し待ってから実行
setTimeout(() => {
    console.log('1. 初期化確認:');
    console.log('- window.UITemplateGenerator:', typeof window.UITemplateGenerator);
    console.log('- window.uiTemplateGenerator:', typeof window.uiTemplateGenerator);
    console.log('- インスタンス存在:', window.uiTemplateGenerator ? 'あり' : 'なし');
    
    if (!window.uiTemplateGenerator) {
        console.log('\n初期化失敗。手動で初期化を試みます...');
        window.uiTemplateGenerator = new window.UITemplateGenerator();
    }
    
    const generator = window.uiTemplateGenerator;
    console.log('\n2. インスタンスの状態:');
    console.log('- selectedRows:', generator.selectedRows);
    console.log('- selectedCols:', generator.selectedCols);
    console.log('- buttonGroups長:', generator.buttonGroups.length);
    console.log('- groupCounter:', generator.groupCounter);
    
    // ボタン要素の確認
    const newGroupBtn = document.getElementById('newGroupBtn');
    console.log('\n3. newGroupBtnの確認:');
    console.log('- 要素:', newGroupBtn ? '存在' : '不存在');
    console.log('- onclick:', newGroupBtn?.onclick);
    
    // プレビューエリアの初期状態
    const previewArea = document.getElementById('previewArea');
    console.log('\n4. 初期状態:');
    console.log('- buttonGroups数（DOM）:', document.querySelectorAll('.button-group').length);
    console.log('- placeholder:', previewArea.querySelector('.placeholder') ? 'あり' : 'なし');
    
    // クリックイベントを発火
    console.log('\n5. イベント発火テスト:');
    const clickEvent = new window.Event('click', { bubbles: true });
    const dispatchResult = newGroupBtn.dispatchEvent(clickEvent);
    console.log('- dispatchEvent結果:', dispatchResult);
    
    setTimeout(() => {
        console.log('- イベント後のgroupCounter:', generator.groupCounter);
        console.log('- イベント後のbuttonGroups長:', generator.buttonGroups.length);
        console.log('- イベント後のDOM buttonGroups:', document.querySelectorAll('.button-group').length);
        
        // 直接メソッド呼び出し
        console.log('\n6. 直接メソッド呼び出し:');
        const beforeCount = generator.groupCounter;
        generator.createNewGroup();
        console.log('- 呼び出し前のgroupCounter:', beforeCount);
        console.log('- 呼び出し後のgroupCounter:', generator.groupCounter);
        console.log('- 呼び出し後のbuttonGroups長:', generator.buttonGroups.length);
        console.log('- 呼び出し後のDOM buttonGroups:', document.querySelectorAll('.button-group').length);
        
        // 問題の分析
        console.log('\n=== 分析結果 ===');
        const eventWorked = document.querySelectorAll('.button-group').length === 0;
        const directCallWorked = generator.groupCounter > beforeCount;
        
        console.log('1. addEventListenerイベント:', eventWorked ? '動作しない' : '動作する');
        console.log('2. 直接メソッド呼び出し:', directCallWorked ? '動作する' : '動作しない');
        console.log('3. 結論: 移行ガイドの主張は', eventWorked ? '正しい' : '誤り');
    }, 100);
}, 100);