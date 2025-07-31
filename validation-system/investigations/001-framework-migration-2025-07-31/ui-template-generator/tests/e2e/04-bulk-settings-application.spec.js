import { test, expect } from '@playwright/test';
import { UIHelpers } from './helpers/ui-helpers.js';

test.describe('複数グループへの一括反映テスト', () => {
  let ui;

  test.beforeEach(async ({ page }) => {
    ui = new UIHelpers(page);
    await ui.goto();
  });

  test('複数グループに緑色を一括反映', async () => {
    // 5つのグループを作成
    for (let i = 0; i < 5; i++) {
      await ui.createNewGroup();
    }

    // グループ1、3、5（インデックス0、2、4）にチェック
    await ui.toggleMultipleGroups([0, 2, 4]);

    // 色を緑（#2ecc71）に変更
    await ui.setButtonColor('#2ecc71');

    // 反映ボタンをクリック
    await ui.applySettings();

    // グループ1、3、5のボタンが緑色になることを確認
    for (const groupIndex of [0, 2, 4]) {
      const style = await ui.getButtonStyle(groupIndex, 0);
      const hexColor = ui.rgbToHex(style.computedStyle.backgroundColor);
      expect(hexColor).toBe('#2ecc71');
    }

    // グループ2、4（インデックス1、3）は変更されないことを確認
    for (const groupIndex of [1, 3]) {
      const style = await ui.getButtonStyle(groupIndex, 0);
      const hexColor = ui.rgbToHex(style.computedStyle.backgroundColor);
      expect(hexColor).toBe('#34495e'); // デフォルト色
    }
  });

  test('異なるサイズのグループへの一括サイズ変更', async () => {
    // 異なるサイズのグループを作成
    await ui.setGridSize(2, 2); // 4個のボタン
    await ui.createNewGroup();

    await ui.setGridSize(3, 1); // 3個のボタン
    await ui.createNewGroup();

    await ui.setGridSize(1, 4); // 4個のボタン
    await ui.createNewGroup();

    // 全グループをチェック
    await ui.selectAllGroups();

    // サイズを変更
    await ui.setButtonSize(80, 60);

    // 一括反映
    await ui.applySettings();

    // 全グループの全ボタンがサイズ変更されていることを確認
    const groupSizes = [4, 3, 4]; // 各グループのボタン数
    
    for (let groupIndex = 0; groupIndex < 3; groupIndex++) {
      for (let buttonIndex = 0; buttonIndex < groupSizes[groupIndex]; buttonIndex++) {
        const style = await ui.getButtonStyle(groupIndex, buttonIndex);
        expect(style.computedStyle.width).toBe('80px');
        expect(style.computedStyle.height).toBe('60px');
      }
    }
  });

  test('全グループチェック機能', async () => {
    // 4つのグループを作成
    for (let i = 0; i < 4; i++) {
      await ui.createNewGroup();
    }

    // 全グループチェックボタンをクリック
    await ui.selectAllGroups();

    // 全グループがチェックされていることを確認
    const checkedCount = await ui.getCheckedGroupCount();
    expect(checkedCount).toBe(4);

    // 反映ボタンのテキストが更新されていることを確認
    const buttonText = await ui.page.locator('#applySizeBtn').textContent();
    expect(buttonText).toBe('選択中(4)に反映');
  });

  test('全グループ外す機能', async () => {
    // 3つのグループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }

    // 全グループをチェック
    await ui.selectAllGroups();
    expect(await ui.getCheckedGroupCount()).toBe(3);

    // 全グループ外すボタンをクリック
    await ui.deselectAllGroups();

    // 全グループのチェックが外れていることを確認
    const checkedCount = await ui.getCheckedGroupCount();
    expect(checkedCount).toBe(0);

    // 反映ボタンのテキストが元に戻っていることを確認
    const buttonText = await ui.page.locator('#applySizeBtn').textContent();
    expect(buttonText).toBe('反映');
  });

  test('一部チェック状態での全グループ外す', async () => {
    // 4つのグループを作成
    for (let i = 0; i < 4; i++) {
      await ui.createNewGroup();
    }

    // 2つだけチェック
    await ui.toggleMultipleGroups([1, 3]);
    expect(await ui.getCheckedGroupCount()).toBe(2);

    // 全グループ外す
    await ui.deselectAllGroups();

    // 全てのチェックが外れることを確認
    expect(await ui.getCheckedGroupCount()).toBe(0);
  });

  test('混在設定の一括反映', async () => {
    // 異なる設定で複数グループを作成
    await ui.setGridSize(2, 1);
    await ui.setButtonColor('#3498db');
    await ui.createNewGroup();

    await ui.setGridSize(1, 3);
    await ui.setButtonColor('#e74c3c');
    await ui.createNewGroup();

    await ui.setGridSize(3, 2);
    await ui.setButtonColor('#f39c12');
    await ui.createNewGroup();

    // グループ2と3をチェック
    await ui.toggleMultipleGroups([1, 2]);

    // 新しい設定で一括反映
    await ui.setButtonSize(120, 70);
    await ui.setButtonColor('#9b59b6');
    await ui.applySettings();

    // チェックしたグループのみ更新されることを確認
    for (const groupIndex of [1, 2]) {
      const style = await ui.getButtonStyle(groupIndex, 0);
      expect(style.computedStyle.width).toBe('120px');
      expect(style.computedStyle.height).toBe('70px');
      
      const hexColor = ui.rgbToHex(style.computedStyle.backgroundColor);
      expect(hexColor).toBe('#9b59b6');
    }

    // チェックしなかったグループは変更されない
    const unchangedStyle = await ui.getButtonStyle(0, 0);
    const unchangedColor = ui.rgbToHex(unchangedStyle.computedStyle.backgroundColor);
    expect(unchangedColor).toBe('#3498db'); // 元の青色のまま
  });

  test('大量グループへの一括反映', async () => {
    // 10個のグループを作成
    for (let i = 0; i < 10; i++) {
      await ui.createNewGroup();
    }

    // 全グループをチェック
    await ui.selectAllGroups();

    // サイズと色を変更
    await ui.setButtonSize(50, 30);
    await ui.setButtonColor('#1abc9c');

    // 一括反映
    await ui.applySettings();

    // 全グループが更新されていることを確認（サンプリング）
    const sampleIndices = [0, 4, 9];
    for (const groupIndex of sampleIndices) {
      const style = await ui.getButtonStyle(groupIndex, 0);
      expect(style.computedStyle.width).toBe('50px');
      expect(style.computedStyle.height).toBe('30px');
      
      const hexColor = ui.rgbToHex(style.computedStyle.backgroundColor);
      expect(hexColor).toBe('#1abc9c');
    }
  });

  test('一括反映の操作ログ記録', async () => {
    // 3つのグループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }

    // 全グループチェックのログ
    await ui.selectAllGroups();
    
    // 設定反映のログ
    await ui.setButtonColor('#e74c3c');
    await ui.applySettings();

    // ログが記録されていることを確認
    const logs = await ui.getLogContent();
    
    // 全グループチェックのログ
    const selectAllLog = logs.find(log => log.action.includes('全グループチェック'));
    expect(selectAllLog).toBeDefined();
    
    // 設定反映のログ
    const applyLog = logs.find(log => log.action.includes('設定反映'));
    expect(applyLog).toBeDefined();
  });

  test('配置設定の一括反映', async () => {
    // 3つのグループを作成
    for (let i = 0; i < 3; i++) {
      await ui.setGridSize(3, 1);
      await ui.createNewGroup();
    }

    // 2つのグループをチェック
    await ui.toggleMultipleGroups([0, 2]);

    // 中央配置に変更して反映
    await ui.selectValue('#alignSelector', 'center');
    await ui.applySettings();

    // チェックしたグループに中央配置クラスが適用されることを確認
    for (const groupIndex of [0, 2]) {
      const container = ui.page.locator('.button-group').nth(groupIndex).locator('.button-grid');
      await expect(container).toHaveClass(/align-center/);
    }

    // チェックしなかったグループは変更されない
    const unchangedContainer = ui.page.locator('.button-group').nth(1).locator('.button-grid');
    await expect(unchangedContainer).not.toHaveClass(/align-center/);
  });
});