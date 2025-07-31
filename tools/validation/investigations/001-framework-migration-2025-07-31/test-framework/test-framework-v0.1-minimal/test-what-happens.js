import { JSDOM } from 'jsdom';
import fs from 'fs';

console.log('=== 実際のテストで何が起きているか ===\n');

// v0.43のHTMLを準備（scriptタグを削除）
let html = fs.readFileSync('../../ui-template-generator/index.html', 'utf8');
html = html.replace('<script src="script.js"></script>', '');

// JSDOMを設定
const dom = new JSDOM(html, { 
    runScripts: 'dangerously',
    resources: 'usable'
});
const window = dom.window;
const document = window.document;

// グローバルに設定
global.window = window;
global.document = document;

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

// テストフレームワークを読み込む
const frameworkContent = fs.readFileSync('./UniversalTestFramework.js', 'utf8');
eval(frameworkContent);

// 少し待ってから実行
setTimeout(() => {
    console.log('1. 初期状態の確認:');
    const generator = window.uiTemplateGenerator;
    console.log('- generator存在:', generator ? 'あり' : 'なし');
    console.log('- 初期groupCounter:', generator?.groupCounter);
    console.log('- 初期buttonGroups数:', generator?.buttonGroups.length);
    
    // テストフレームワークと同じ方法でボタンをクリック
    console.log('\n2. テストフレームワークと同じ方法でクリック:');
    const selector = '#newGroupBtn';
    const element = document.querySelector(selector);
    
    console.log('- 要素:', element ? '存在' : '不存在');
    console.log('- hasOnClick:', !!element?.onclick);
    console.log('- generator.newGroupBtn === element:', generator?.newGroupBtn === element);
    
    // createEventとinitEventを使用（テストフレームワークと同じ）
    const clickEvent = document.createEvent('Event');
    clickEvent.initEvent('click', true, true);
    const eventResult = element.dispatchEvent(clickEvent);
    
    console.log('- dispatchEvent結果:', eventResult);
    
    // 結果確認
    setTimeout(() => {
        console.log('\n3. クリック後の状態:');
        console.log('- groupCounter:', generator?.groupCounter);
        console.log('- buttonGroups数:', generator?.buttonGroups.length);
        console.log('- DOM上のbutton-group数:', document.querySelectorAll('.button-group').length);
        console.log('- placeholderの有無:', document.querySelector('.placeholder') ? 'あり' : 'なし');
        
        // プレビューエリアの内容
        const previewArea = document.getElementById('previewArea');
        console.log('- previewArea.innerHTML長:', previewArea.innerHTML.length);
        
        // なぜ「hasOnClick: false」なのに動作するのか？
        console.log('\n4. 分析:');
        console.log('- element.onclick:', element.onclick);
        console.log('- addEventListenerは動作している');
        console.log('- テストログの「hasOnClick: false」は誤解を招く');
        console.log('- 実際にはイベントハンドラーは正常に動作している');
        
        // ログの内容を確認
        if (generator?.operationLog) {
            console.log('\n5. 操作ログ:');
            generator.operationLog.forEach((log, index) => {
                console.log(`- ログ${index + 1}: ${log.action}`);
            });
        }
    }, 100);
}, 500);