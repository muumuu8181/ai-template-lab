import { test, expect } from '@playwright/test';
import { UIHelpers } from './helpers/ui-helpers.js';

test.describe('設定反映テスト', () => {
  let ui;

  test.beforeEach(async ({ page }) => {
    ui = new UIHelpers(page);
    await ui.goto();
  });

  test('単一グループへの高さ設定反映', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // グループを選択
    await ui.selectGroup(0);
    
    // 高さを100pxに変更
    await ui.setButtonSize(100, 100);
    
    // グループをチェック
    await ui.toggleGroupCheckbox(0);
    
    // 設定を反映
    await ui.applySettings();
    
    // ボタンの高さが実際に100pxになっていることを確認
    const style = await ui.getButtonStyle(0, 0);
    expect(style.computedStyle.height).toBe('100px');
    expect(style.inlineStyle.height).toBe('100px');
  });

  test('設定反映前後のスタイル値確認', async () => {
    // グループを作成（デフォルト: 100px×40px）
    await ui.createNewGroup();
    
    // 反映前の確認
    let style = await ui.getButtonStyle(0, 0);
    expect(style.computedStyle.width).toBe('100px');
    expect(style.computedStyle.height).toBe('40px');
    
    // 設定変更
    await ui.setButtonSize(60, 80);
    
    // グループをチェックして反映
    await ui.toggleGroupCheckbox(0);
    await ui.applySettings();
    
    // 反映後の確認
    style = await ui.getButtonStyle(0, 0);
    expect(style.computedStyle.width).toBe('60px');
    expect(style.computedStyle.height).toBe('80px');
    expect(style.inlineStyle.width).toBe('60px');
    expect(style.inlineStyle.height).toBe('80px');
  });

  test('色設定の反映確認', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // 色を赤に変更
    await ui.setButtonColor('#e74c3c');
    
    // グループをチェックして反映
    await ui.toggleGroupCheckbox(0);
    await ui.applySettings();
    
    // ボタンの背景色が赤になっていることを確認
    const style = await ui.getButtonStyle(0, 0);
    const hexColor = ui.rgbToHex(style.computedStyle.backgroundColor);
    expect(hexColor).toBe('#e74c3c');
  });

  test('複数のボタンへの一括設定反映', async () => {
    // 3×2のグループを作成（6個のボタン）
    await ui.setGridSize(3, 2);
    await ui.createNewGroup();
    
    // 設定変更
    await ui.setButtonSize(80, 60);
    await ui.setButtonColor('#2ecc71');
    
    // グループをチェックして反映
    await ui.toggleGroupCheckbox(0);
    await ui.applySettings();
    
    // 全てのボタンに設定が反映されていることを確認
    for (let i = 0; i < 6; i++) {
      const style = await ui.getButtonStyle(0, i);
      expect(style.computedStyle.width).toBe('80px');
      expect(style.computedStyle.height).toBe('60px');
      
      const hexColor = ui.rgbToHex(style.computedStyle.backgroundColor);
      expect(hexColor).toBe('#2ecc71');
    }
  });

  test('チェックなしでの反映時のエラーメッセージ', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // チェックせずに反映ボタンをクリック
    await ui.applySettings();
    
    // エラーメッセージが表示される
    const message = await ui.getMessageText();
    expect(message).toContain('チェックされたグループがありません');
  });

  test('反映ボタンのテキスト変更', async () => {
    // 初期状態では「反映」
    let buttonText = await ui.page.locator('#applySizeBtn').textContent();
    expect(buttonText).toBe('反映');
    
    // グループを作成してチェック
    await ui.createNewGroup();
    await ui.toggleGroupCheckbox(0);
    
    // 「選択中(1)に反映」に変わる
    buttonText = await ui.page.locator('#applySizeBtn').textContent();
    expect(buttonText).toBe('選択中(1)に反映');
    
    // さらにグループを追加してチェック
    await ui.createNewGroup();
    await ui.toggleGroupCheckbox(1);
    
    // 「選択中(2)に反映」に変わる
    buttonText = await ui.page.locator('#applySizeBtn').textContent();
    expect(buttonText).toBe('選択中(2)に反映');
    
    // チェックを外す
    await ui.toggleGroupCheckbox(0, false);
    await ui.toggleGroupCheckbox(1, false);
    
    // 「反映」に戻る
    buttonText = await ui.page.locator('#applySizeBtn').textContent();
    expect(buttonText).toBe('反映');
  });

  test('配置設定の反映確認', async () => {
    // グループを作成
    await ui.setGridSize(2, 1);
    await ui.createNewGroup();
    
    // 中央配置に変更
    await ui.selectValue('#alignSelector', 'center');
    
    // 反映
    await ui.toggleGroupCheckbox(0);
    await ui.applySettings();
    
    // グリッドコンテナに中央配置クラスが追加されていることを確認
    const container = ui.page.locator('.button-group').first().locator('.button-grid');
    await expect(container).toHaveClass(/align-center/);
    
    // 右詰めに変更
    await ui.selectValue('#alignSelector', 'end');
    await ui.applySettings();
    
    // 右詰めクラスが追加されていることを確認
    await expect(container).toHaveClass(/align-end/);
    await expect(container).not.toHaveClass(/align-center/);
  });

  test('設定反映の操作ログ記録', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // 設定変更して反映
    await ui.setButtonSize(120, 50);
    await ui.toggleGroupCheckbox(0);
    await ui.applySettings();
    
    // ログが記録されていることを確認
    const logs = await ui.getLogContent();
    const applyLog = logs.find(log => log.action.includes('設定反映'));
    expect(applyLog).toBeDefined();
  });

  test('グリッド列幅の更新確認', async () => {
    // 3列のグループを作成
    await ui.setGridSize(3, 1);
    await ui.createNewGroup();
    
    // 幅を変更して反映
    await ui.setButtonSize(150, 40);
    await ui.toggleGroupCheckbox(0);
    await ui.applySettings();
    
    // グリッドテンプレートカラムが更新されていることを確認
    const container = ui.page.locator('.button-group').first().locator('.button-grid');
    const gridColumns = await container.evaluate(el => el.style.gridTemplateColumns);
    expect(gridColumns).toBe('repeat(3, 150px)');
  });
});