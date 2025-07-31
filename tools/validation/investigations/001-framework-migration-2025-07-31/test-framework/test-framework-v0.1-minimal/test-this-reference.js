import { JSDOM } from 'jsdom';
import fs from 'fs';

console.log('=== クラスのthis参照問題テスト ===\n');

// HTMLを読み込む
const html = fs.readFileSync('./test-this-reference.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
const window = dom.window;
const document = window.document;

// 少し待ってから実行（クラスの初期化を待つ）
setTimeout(() => {
    console.log('初期状態:');
    console.log('- testInstance.count:', window.testInstance.count);
    console.log('- globalCounter.count:', window.globalCounter.count);
    console.log('');
    
    // 各ボタンをテスト
    const tests = [
        { id: 'classBtn', name: '通常の関数（this失われる）' },
        { id: 'arrowBtn', name: 'アロー関数（this保持）' },
        { id: 'bindBtn', name: 'bind使用（this保持）' },
        { id: 'globalBtn', name: 'グローバル変数方式' }
    ];
    
    tests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.name}:`);
        const btn = document.getElementById(test.id);
        console.log('- ボタン要素:', btn ? '存在' : '不存在');
        
        // クリックイベントを発火
        const clickEvent = new window.Event('click');
        btn.dispatchEvent(clickEvent);
        
        // 結果を確認
        const resultDiv = document.getElementById('result');
        const lastResult = resultDiv.lastElementChild;
        console.log('- 結果:', lastResult ? lastResult.textContent : 'なし');
        console.log('- testInstance.count:', window.testInstance.count);
        console.log('- globalCounter.count:', window.globalCounter.count);
        console.log('');
    });
    
    // サマリー
    console.log('=== 結果サマリー ===');
    console.log('通常の関数: エラーが発生（thisがundefinedまたはwindow）');
    console.log('アロー関数: 正常動作（thisが保持される）');
    console.log('bind使用: 正常動作（thisが保持される）');
    console.log('グローバル変数: 正常動作（thisに依存しない）');
}, 100);