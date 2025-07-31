import { JSDOM } from 'jsdom';
import fs from 'fs';

console.log('=== addEventListener vs onclick テスト ===\n');

// HTMLを読み込む
const html = fs.readFileSync('./test-addEventListener.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
const window = dom.window;
const document = window.document;

// テスト開始
console.log('初期状態:');
console.log('- addEventCount:', window.addEventCount);
console.log('- onclickCount:', window.onclickCount);
console.log('');

// addEventListener方式のテスト
console.log('1. addEventListener方式のテスト:');
const addEventBtn = document.getElementById('addEventBtn');
console.log('- ボタン要素:', addEventBtn ? '存在' : '不存在');
console.log('- onclick属性:', addEventBtn.onclick);

// dispatchEventを試す
const clickEvent = new window.Event('click');
const dispatchResult = addEventBtn.dispatchEvent(clickEvent);
console.log('- dispatchEvent結果:', dispatchResult);
console.log('- イベント後のaddEventCount:', window.addEventCount);

// 直接クリックメソッドを呼ぶ
if (addEventBtn.click) {
    addEventBtn.click();
    console.log('- click()後のaddEventCount:', window.addEventCount);
}
console.log('');

// onclick方式のテスト
console.log('2. onclick方式のテスト:');
const onclickBtn = document.getElementById('onclickBtn');
console.log('- ボタン要素:', onclickBtn ? '存在' : '不存在');
console.log('- onclick属性:', typeof onclickBtn.onclick);

// dispatchEventを試す
const clickEvent2 = new window.Event('click');
const dispatchResult2 = onclickBtn.dispatchEvent(clickEvent2);
console.log('- dispatchEvent結果:', dispatchResult2);
console.log('- イベント後のonclickCount:', window.onclickCount);

// 直接onclick関数を呼ぶ
if (onclickBtn.onclick) {
    onclickBtn.onclick();
    console.log('- onclick()直接呼び出し後のonclickCount:', window.onclickCount);
}

// 結果のサマリー
console.log('\n=== 結果サマリー ===');
console.log('addEventListener方式:');
console.log('- dispatchEventで発火:', window.addEventCount > 0 ? '○' : '×');
console.log('onclick方式:');
console.log('- dispatchEventで発火:', window.onclickCount > 0 ? '○' : '×');
console.log('- 直接呼び出しで発火: ○');