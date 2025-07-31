import { test, expect } from '@playwright/test';
import { UIHelpers } from './helpers/ui-helpers.js';

test.describe('基本的なグループ作成テスト', () => {
  let ui;

  test.beforeEach(async ({ page }) => {
    ui = new UIHelpers(page);
    await ui.goto();
  });

  test('初期状態の確認', async () => {
    // プレースホルダーが表示されている
    await expect(await ui.hasPlaceholder()).toBe(true);
    
    // グループが0個
    await expect(await ui.getGroupCount()).toBe(0);
    
    // デフォルト設定値の確認
    const settings = await ui.getCurrentSettings();
    expect(settings.cols).toBe('1');
    expect(settings.rows).toBe('3');
    expect(settings.width).toBe('100');
    expect(settings.height).toBe('40');
    expect(settings.align).toBe('start');
    expect(settings.color).toBe('#34495e');
  });

  test('基本的なグループ作成（3×2）', async () => {
    // 横3、縦2を選択
    await ui.setGridSize(3, 2);
    
    // 新規グループボタンをクリック
    await ui.createNewGroup();
    
    // グループが1つ作成されている
    await expect(await ui.getGroupCount()).toBe(1);
    
    // プレースホルダーが非表示になっている
    await expect(await ui.hasPlaceholder()).toBe(false);
    
    // ボタンが6個（3×2）作成されている
    await expect(await ui.getButtonCountInGroup(0)).toBe(6);
    
    // グループタイトルの確認
    const groupTitle = ui.page.locator('.button-group-title').first();
    await expect(groupTitle).toHaveText('グループ 1 (3×2)');
    
    // ボタンのテキスト内容確認
    for (let i = 0; i < 6; i++) {
      const buttonText = await ui.getButtonText(0, i);
      expect(buttonText).toBe(`G1-${i + 1}`);
    }
  });

  test('複数グループの作成', async () => {
    // グループ1: 2×3
    await ui.setGridSize(2, 3);
    await ui.createNewGroup();
    
    // グループ2: 4×1
    await ui.setGridSize(4, 1);
    await ui.createNewGroup();
    
    // グループ3: 1×5
    await ui.setGridSize(1, 5);
    await ui.createNewGroup();
    
    // 3つのグループが作成されている
    await expect(await ui.getGroupCount()).toBe(3);
    
    // 各グループのボタン数確認
    await expect(await ui.getButtonCountInGroup(0)).toBe(6); // 2×3
    await expect(await ui.getButtonCountInGroup(1)).toBe(4); // 4×1
    await expect(await ui.getButtonCountInGroup(2)).toBe(5); // 1×5
    
    // 各グループのタイトル確認
    const titles = ui.page.locator('.button-group-title');
    await expect(titles.nth(0)).toHaveText('グループ 1 (2×3)');
    await expect(titles.nth(1)).toHaveText('グループ 2 (4×1)');
    await expect(titles.nth(2)).toHaveText('グループ 3 (1×5)');
  });

  test('グループ作成後のパネル表示確認', async () => {
    // 初期状態ではパネルが非表示
    await expect(ui.page.locator('#layoutControlPanel')).toBeHidden();
    await expect(ui.page.locator('#groupControlPanel')).toBeHidden();
    
    // グループ作成後にパネルが表示される
    await ui.createNewGroup();
    
    await expect(ui.page.locator('#layoutControlPanel')).toBeVisible();
    await expect(ui.page.locator('#groupControlPanel')).toBeVisible();
  });

  test('最大サイズグループの作成（10×10）', async () => {
    // 最大サイズ設定
    await ui.setGridSize(10, 10);
    await ui.createNewGroup();
    
    // 100個のボタンが作成されている
    await expect(await ui.getButtonCountInGroup(0)).toBe(100);
    
    // グループタイトルの確認
    const groupTitle = ui.page.locator('.button-group-title').first();
    await expect(groupTitle).toHaveText('グループ 1 (10×10)');
  });

  test('最小サイズグループの作成（1×1）', async () => {
    // 最小サイズ設定
    await ui.setGridSize(1, 1);
    await ui.createNewGroup();
    
    // 1個のボタンが作成されている
    await expect(await ui.getButtonCountInGroup(0)).toBe(1);
    
    // グループタイトルの確認
    const groupTitle = ui.page.locator('.button-group-title').first();
    await expect(groupTitle).toHaveText('グループ 1 (1×1)');
  });

  test('グループ作成時の操作ログ記録', async () => {
    // 初期状態ではログが空
    const initialLogs = await ui.getLogContent();
    expect(initialLogs.length).toBe(0);
    
    // グループ作成
    await ui.setGridSize(3, 2);
    await ui.createNewGroup();
    
    // ログが記録されている
    const logs = await ui.getLogContent();
    expect(logs.length).toBe(1);
    expect(logs[0].action).toContain('新規グループ作成');
  });
});