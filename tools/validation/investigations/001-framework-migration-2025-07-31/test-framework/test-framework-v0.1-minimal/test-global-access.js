import { JSDOM } from 'jsdom';
import fs from 'fs';

console.log('=== グローバル関数アクセスの必要性テスト ===\n');

// v0.43のHTMLを準備
let html = fs.readFileSync('../../ui-template-generator/index.html', 'utf8');
html = html.replace('<script src="script.js"></script>', '');

const dom = new JSDOM(html, { runScripts: 'dangerously' });
const window = dom.window;
const document = window.document;

// script.jsを実行
const scriptContent = fs.readFileSync('../../ui-template-generator/script.js', 'utf8');
const scriptElement = document.createElement('script');
scriptElement.textContent = scriptContent;
document.head.appendChild(scriptElement);

// DOMContentLoadedを発火
document.dispatchEvent(new window.Event('DOMContentLoaded'));

setTimeout(() => {
    console.log('1. クラスベース（v0.43）のアクセス方法:');
    console.log('- window.UITemplateGenerator:', typeof window.UITemplateGenerator);
    console.log('- window.uiTemplateGenerator:', typeof window.uiTemplateGenerator);
    console.log('- window.createNewGroup:', typeof window.createNewGroup);
    console.log('- window.clearPreview:', typeof window.clearPreview);
    
    const generator = window.uiTemplateGenerator;
    if (generator) {
        console.log('\n2. インスタンス経由でのメソッドアクセス:');
        console.log('- generator.createNewGroup:', typeof generator.createNewGroup);
        console.log('- generator.clearPreview:', typeof generator.clearPreview);
        console.log('- generator.applyButtonSize:', typeof generator.applyButtonSize);
        
        console.log('\n3. テストからの呼び出し:');
        // インスタンスメソッドを直接呼び出し
        const beforeCount = generator.groupCounter;
        generator.createNewGroup();
        console.log('- createNewGroup呼び出し: 成功');
        console.log('- グループ数変化:', beforeCount, '→', generator.groupCounter);
        
        // プロパティへのアクセス
        console.log('\n4. プロパティアクセス:');
        console.log('- selectedRows取得:', generator.selectedRows);
        generator.selectedRows = 5;
        console.log('- selectedRows設定後:', generator.selectedRows);
    }
    
    // v0.5スタイルのグローバル関数を確認
    console.log('\n5. v0.5スタイルのグローバルアクセス（存在しない）:');
    console.log('- window.uiGenerator:', typeof window.uiGenerator);
    console.log('- グローバル関数がないとテストが難しい？');
    
    console.log('\n=== 分析結果 ===');
    console.log('1. クラスインスタンスは window.uiTemplateGenerator でアクセス可能');
    console.log('2. インスタンス経由でメソッドやプロパティにアクセスできる');
    console.log('3. グローバル関数化は必須ではない');
    console.log('4. ただし、グローバル関数の方がテストは書きやすい');
}, 100);