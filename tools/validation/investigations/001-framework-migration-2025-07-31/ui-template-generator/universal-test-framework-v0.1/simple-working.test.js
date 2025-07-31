/**
 * 実際に動作するシンプルなテスト
 */

describe('UI Template Generator 動作テスト', () => {
  
  test('HTMLファイルが正しく読み込まれている', () => {
    // タイトルが正しい
    const title = document.querySelector('h1');
    expect(title).toBeTruthy();
    expect(title.textContent).toBe('UI Template Generator v0.41');
    
    // 必要な要素が存在する
    expect(document.getElementById('newGroupBtn')).toBeTruthy();
    expect(document.getElementById('clearBtn')).toBeTruthy();
    expect(document.getElementById('applySizeBtn')).toBeTruthy();
    expect(document.querySelector('.placeholder')).toBeTruthy();
  });

  test('初期状態のセレクター値確認', () => {
    // デフォルト選択値の確認
    const colsSelected = document.querySelector('#colsSelector .selected');
    const rowsSelected = document.querySelector('#rowsSelector .selected');
    const widthSelected = document.querySelector('#widthSelector .selected');
    const heightSelected = document.querySelector('#heightSelector .selected');
    
    expect(colsSelected.dataset.value).toBe('1');
    expect(rowsSelected.dataset.value).toBe('3');
    expect(widthSelected.dataset.value).toBe('100');
    expect(heightSelected.dataset.value).toBe('40');
  });

  test('プレースホルダーが正しく表示されている', () => {
    const placeholder = document.querySelector('.placeholder');
    expect(placeholder.textContent).toContain('設定を選択してボタンを生成してください');
  });

  test('初期状態ではグループが0個', () => {
    const groups = document.querySelectorAll('.button-group');
    expect(groups.length).toBe(0);
  });

  test('コントロールパネルが初期状態で非表示', () => {
    const layoutPanel = document.getElementById('layoutControlPanel');
    const groupPanel = document.getElementById('groupControlPanel');
    
    expect(layoutPanel.style.display).toBe('none');
    expect(groupPanel.style.display).toBe('none');
  });

  test('操作ログパネルが存在する', () => {
    const logPanel = document.getElementById('operationLogPanel');
    const logContent = document.getElementById('logContent');
    const copyBtn = document.getElementById('copyLogBtn');
    
    expect(logPanel).toBeTruthy();
    expect(logContent).toBeTruthy();
    expect(copyBtn).toBeTruthy();
  });

  test('ボタンセレクターが正しく配置されている', () => {
    // 横セレクター（1-10）
    const colsButtons = document.querySelectorAll('#colsSelector .selector-btn');
    expect(colsButtons.length).toBe(10);
    expect(colsButtons[0].dataset.value).toBe('1');
    expect(colsButtons[9].dataset.value).toBe('10');
    
    // 縦セレクター（1-10）
    const rowsButtons = document.querySelectorAll('#rowsSelector .selector-btn');
    expect(rowsButtons.length).toBe(10);
    expect(rowsButtons[0].dataset.value).toBe('1');
    expect(rowsButtons[9].dataset.value).toBe('10');
  });

  test('サイズセレクターが正しく配置されている', () => {
    // 幅セレクター
    const widthButtons = document.querySelectorAll('#widthSelector .selector-btn');
    expect(widthButtons.length).toBe(8);
    expect(widthButtons[0].dataset.value).toBe('20');
    expect(widthButtons[7].dataset.value).toBe('300');
    
    // 高さセレクター
    const heightButtons = document.querySelectorAll('#heightSelector .selector-btn');
    expect(heightButtons.length).toBe(6);
    expect(heightButtons[0].dataset.value).toBe('30');
    expect(heightButtons[5].dataset.value).toBe('100');
  });

  test('色セレクターが正しく配置されている', () => {
    const colorButtons = document.querySelectorAll('#colorSelector .color-btn');
    expect(colorButtons.length).toBe(8);
    
    // デフォルト色が選択されている
    const selectedColor = document.querySelector('#colorSelector .selected');
    expect(selectedColor.dataset.value).toBe('#34495e');
  });
});