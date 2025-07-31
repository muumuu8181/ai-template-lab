import { JSDOM } from 'jsdom';
import fs from 'fs';

console.log('=== UI Template Generator v0.43 詳細テスト ===\n');

// HTMLとJSを読み込む
const html = fs.readFileSync('../../ui-template-generator/index.html', 'utf8');
const scriptContent = fs.readFileSync('../../ui-template-generator/script.js', 'utf8');

// JSDOMを設定
const dom = new JSDOM(html, { 
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost'
});
const window = dom.window;
const document = window.document;

// script.jsを実行
const scriptElement = document.createElement('script');
scriptElement.textContent = scriptContent;
document.body.appendChild(scriptElement);

// 少し待ってから実行
setTimeout(() => {
    console.log('1. クラスのインスタンス化確認:');
    console.log('- window.UITemplateGenerator:', typeof window.UITemplateGenerator);
    console.log('- window.uiGenerator:', typeof window.uiGenerator);
    
    // ボタン要素の確認
    const newGroupBtn = document.getElementById('newGroupBtn');
    console.log('\n2. newGroupBtnの詳細:');
    console.log('- 要素:', newGroupBtn ? '存在' : '不存在');
    console.log('- tagName:', newGroupBtn?.tagName);
    console.log('- id:', newGroupBtn?.id);
    console.log('- onclick:', newGroupBtn?.onclick);
    console.log('- イベントリスナー数:', newGroupBtn?._events ? Object.keys(newGroupBtn._events).length : '不明');
    
    // プレビューエリアの初期状態
    const previewArea = document.getElementById('previewArea');
    console.log('\n3. プレビューエリアの初期状態:');
    console.log('- innerHTML長:', previewArea.innerHTML.length);
    console.log('- placeholder存在:', previewArea.querySelector('.placeholder') ? 'あり' : 'なし');
    console.log('- buttonGroups数:', document.querySelectorAll('.button-group').length);
    
    // クリックイベントを発火
    console.log('\n4. クリックイベント発火テスト:');
    console.log('- dispatchEvent前のbuttonGroups数:', document.querySelectorAll('.button-group').length);
    
    const clickEvent = new window.Event('click', { bubbles: true });
    const dispatchResult = newGroupBtn.dispatchEvent(clickEvent);
    console.log('- dispatchEvent結果:', dispatchResult);
    
    // 結果確認
    setTimeout(() => {
        console.log('- dispatchEvent後のbuttonGroups数:', document.querySelectorAll('.button-group').length);
        console.log('- プレビューエリアの変化:', previewArea.innerHTML.length);
        console.log('- placeholder存在:', previewArea.querySelector('.placeholder') ? 'あり' : 'なし');
        
        // アロー関数で定義されたメソッドを直接呼び出してみる
        console.log('\n5. 直接メソッド呼び出しテスト:');
        try {
            // UITemplateGeneratorのインスタンスを作成
            const generator = new window.UITemplateGenerator();
            console.log('- インスタンス作成: 成功');
            console.log('- generator.createNewGroup:', typeof generator.createNewGroup);
            
            // メソッドを直接呼び出す
            generator.createNewGroup();
            console.log('- createNewGroup呼び出し: 成功');
            console.log('- 呼び出し後のbuttonGroups数:', document.querySelectorAll('.button-group').length);
        } catch (e) {
            console.log('- エラー:', e.message);
        }
        
        // まとめ
        console.log('\n=== 問題の分析 ===');
        console.log('1. クラスベースのコードは正常にロードされている');
        console.log('2. addEventListenerでイベントは登録されている');
        console.log('3. dispatchEventは成功するが、ハンドラーが実行されない可能性');
        console.log('4. アロー関数を使っているため、this参照は保持されるはず');
        console.log('5. 直接メソッド呼び出しは動作する可能性がある');
    }, 100);
}, 500);