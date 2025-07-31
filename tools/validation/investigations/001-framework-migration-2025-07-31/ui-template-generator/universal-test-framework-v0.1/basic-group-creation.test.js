/**
 * 基本的なグループ作成テスト
 */

describe('基本的なグループ作成テスト', () => {
  
  test('初期状態の確認', () => {
    // プレースホルダーが表示されている
    const placeholder = document.querySelector('.placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder.textContent).toContain('設定を選択してボタンを生成してください');
    
    // グループが0個
    const groups = document.querySelectorAll('.button-group');
    expect(groups.length).toBe(0);
    
    // デフォルト設定値の確認
    const colsSelected = document.querySelector('#colsSelector .selected');
    const rowsSelected = document.querySelector('#rowsSelector .selected');
    const widthSelected = document.querySelector('#widthSelector .selected');
    const heightSelected = document.querySelector('#heightSelector .selected');
    
    expect(colsSelected.dataset.value).toBe('1');
    expect(rowsSelected.dataset.value).toBe('3');
    expect(widthSelected.dataset.value).toBe('100');
    expect(heightSelected.dataset.value).toBe('40');
  });

  test('基本的なグループ作成（3×2）', () => {
    const ui = global.uiGenerator;
    
    // 横3、縦2を選択
    ui.selectedCols = 3;
    ui.selectedRows = 2;
    
    // 新規グループを作成
    ui.createNewGroup();
    
    // グループが1つ作成されている
    const groups = document.querySelectorAll('.button-group');
    expect(groups.length).toBe(1);
    
    // プレースホルダーが非表示になっている
    const placeholder = document.querySelector('.placeholder');
    expect(placeholder).toBeFalsy();
    
    // ボタンが6個（3×2）作成されている
    const buttons = groups[0].querySelectorAll('.generated-button');
    expect(buttons.length).toBe(6);
    
    // グループタイトルの確認
    const groupTitle = groups[0].querySelector('.button-group-title');
    expect(groupTitle.textContent).toBe('グループ 1 (3×2)');
    
    // ボタンのテキスト内容確認
    buttons.forEach((button, index) => {
      expect(button.textContent).toBe(`G1-${index + 1}`);
    });
  });

  test('複数グループの作成', () => {
    const ui = global.uiGenerator;
    
    // グループ1: 2×3
    ui.selectedCols = 2;
    ui.selectedRows = 3;
    ui.createNewGroup();
    
    // グループ2: 4×1
    ui.selectedCols = 4;
    ui.selectedRows = 1;
    ui.createNewGroup();
    
    // グループ3: 1×5
    ui.selectedCols = 1;
    ui.selectedRows = 5;
    ui.createNewGroup();
    
    // 3つのグループが作成されている
    const groups = document.querySelectorAll('.button-group');
    expect(groups.length).toBe(3);
    
    // 各グループのボタン数確認
    expect(groups[0].querySelectorAll('.generated-button').length).toBe(6); // 2×3
    expect(groups[1].querySelectorAll('.generated-button').length).toBe(4); // 4×1
    expect(groups[2].querySelectorAll('.generated-button').length).toBe(5); // 1×5
    
    // 各グループのタイトル確認
    expect(groups[0].querySelector('.button-group-title').textContent).toBe('グループ 1 (2×3)');
    expect(groups[1].querySelector('.button-group-title').textContent).toBe('グループ 2 (4×1)');
    expect(groups[2].querySelector('.button-group-title').textContent).toBe('グループ 3 (1×5)');
  });

  test('グループ作成後のパネル表示確認', () => {
    const ui = global.uiGenerator;
    
    // 初期状態ではパネルが非表示
    const layoutPanel = document.getElementById('layoutControlPanel');
    const groupPanel = document.getElementById('groupControlPanel');
    
    expect(layoutPanel.style.display).toBe('none');
    expect(groupPanel.style.display).toBe('none');
    
    // グループ作成後にパネルが表示される
    ui.createNewGroup();
    
    expect(layoutPanel.style.display).toBe('block');
    expect(groupPanel.style.display).toBe('block');
  });

  test('最大サイズグループの作成（10×10）', () => {
    const ui = global.uiGenerator;
    
    // 最大サイズ設定
    ui.selectedCols = 10;
    ui.selectedRows = 10;
    ui.createNewGroup();
    
    // 100個のボタンが作成されている
    const buttons = document.querySelectorAll('.generated-button');
    expect(buttons.length).toBe(100);
    
    // グループタイトルの確認
    const groupTitle = document.querySelector('.button-group-title');
    expect(groupTitle.textContent).toBe('グループ 1 (10×10)');
  });

  test('最小サイズグループの作成（1×1）', () => {
    const ui = global.uiGenerator;
    
    // 最小サイズ設定
    ui.selectedCols = 1;
    ui.selectedRows = 1;
    ui.createNewGroup();
    
    // 1個のボタンが作成されている
    const buttons = document.querySelectorAll('.generated-button');
    expect(buttons.length).toBe(1);
    
    // グループタイトルの確認
    const groupTitle = document.querySelector('.button-group-title');
    expect(groupTitle.textContent).toBe('グループ 1 (1×1)');
  });

  test('グループ作成時の操作ログ記録', () => {
    const ui = global.uiGenerator;
    
    // 初期状態ではログが空
    expect(ui.operationLog.length).toBe(0);
    
    // グループ作成
    ui.selectedCols = 3;
    ui.selectedRows = 2;
    ui.createNewGroup();
    
    // ログが記録されている
    expect(ui.operationLog.length).toBe(1);
    expect(ui.operationLog[0].action).toContain('新規グループ作成');
    expect(ui.operationLog[0].details.size).toBe('3×2');
  });
});