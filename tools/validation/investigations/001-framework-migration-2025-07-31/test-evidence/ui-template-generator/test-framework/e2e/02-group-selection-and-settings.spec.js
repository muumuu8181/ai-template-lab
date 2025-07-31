import { test, expect } from '@playwright/test';
import { UIHelpers } from './helpers/ui-helpers.js';

test.describe('グループ選択と設定読み込みテスト', () => {
  let ui;

  test.beforeEach(async ({ page }) => {
    ui = new UIHelpers(page);
    await ui.goto();
  });

  test('グループクリックでアクティブ状態になる', async () => {
    // 初期状態では「グループを選択してください」が表示
    const initialInfo = await ui.getActiveGroupInfo();
    expect(initialInfo.hasNoActiveGroup).toBe(true);
    expect(initialInfo.text).toContain('グループを選択してください');

    // グループを作成
    await ui.setGridSize(3, 2);
    await ui.createNewGroup();

    // グループをクリックして選択
    await ui.selectGroup(0);

    // アクティブグループ情報が更新される
    const activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(false);
    expect(activeInfo.text).toContain('グループ 1');
    expect(activeInfo.text).toContain('3×2');
  });

  test('グループ選択時に設定値が読み込まれる', async () => {
    // グループ1: デフォルト設定で作成
    await ui.setGridSize(3, 2);
    await ui.createNewGroup();

    // 設定を変更
    await ui.setGridSize(2, 3);
    await ui.setButtonSize(60, 80);

    // グループ2: 変更した設定で作成
    await ui.createNewGroup();

    // グループ1を選択
    await ui.selectGroup(0);

    // セレクターがグループ1の設定値に戻る
    const settings1 = await ui.getCurrentSettings();
    expect(settings1.cols).toBe('3');
    expect(settings1.rows).toBe('2');
    expect(settings1.width).toBe('100'); // デフォルト値
    expect(settings1.height).toBe('40'); // デフォルト値

    // グループ2を選択
    await ui.selectGroup(1);

    // セレクターがグループ2の設定値に変わる
    const settings2 = await ui.getCurrentSettings();
    expect(settings2.cols).toBe('2');
    expect(settings2.rows).toBe('3');
    expect(settings2.width).toBe('60');
    expect(settings2.height).toBe('80');
  });

  test('複数グループの設定読み込み詳細テスト', async () => {
    // グループ1: 3×2、幅100px、高さ40px、グレー
    await ui.setGridSize(3, 2);
    await ui.setButtonSize(100, 40);
    await ui.setButtonColor('#34495e');
    await ui.createNewGroup();

    // グループ2: 2×3、幅60px、高さ80px、青
    await ui.setGridSize(2, 3);
    await ui.setButtonSize(60, 80);
    await ui.setButtonColor('#3498db');
    await ui.createNewGroup();

    // グループ3: 4×1、幅140px、高さ50px、緑
    await ui.setGridSize(4, 1);
    await ui.setButtonSize(140, 50);
    await ui.setButtonColor('#2ecc71');
    await ui.createNewGroup();

    // 各グループを選択して設定値を確認
    
    // グループ1の確認
    await ui.selectGroup(0);
    let settings = await ui.getCurrentSettings();
    expect(settings.cols).toBe('3');
    expect(settings.rows).toBe('2');
    expect(settings.width).toBe('100');
    expect(settings.height).toBe('40');
    expect(settings.color).toBe('#34495e');

    // グループ2の確認
    await ui.selectGroup(1);
    settings = await ui.getCurrentSettings();
    expect(settings.cols).toBe('2');
    expect(settings.rows).toBe('3');
    expect(settings.width).toBe('60');
    expect(settings.height).toBe('80');
    expect(settings.color).toBe('#3498db');

    // グループ3の確認
    await ui.selectGroup(2);
    settings = await ui.getCurrentSettings();
    expect(settings.cols).toBe('4');
    expect(settings.rows).toBe('1');
    expect(settings.width).toBe('140');
    expect(settings.height).toBe('50');
    expect(settings.color).toBe('#2ecc71');
  });

  test('グループ選択時のアクティブグループ表示更新', async () => {
    // 複数グループを作成
    await ui.setGridSize(3, 2);
    await ui.createNewGroup();
    
    await ui.setGridSize(2, 4);
    await ui.createNewGroup();

    await ui.setGridSize(5, 1);
    await ui.createNewGroup();

    // 各グループを順番に選択してアクティブ表示を確認
    await ui.selectGroup(0);
    let activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.text).toContain('グループ 1');
    expect(activeInfo.text).toContain('3×2');

    await ui.selectGroup(1);
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.text).toContain('グループ 2');
    expect(activeInfo.text).toContain('2×4');

    await ui.selectGroup(2);
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.text).toContain('グループ 3');
    expect(activeInfo.text).toContain('5×1');
  });

  test('グループ削除後のアクティブ状態リセット', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // グループを選択
    await ui.selectGroup(0);
    
    // アクティブ状態を確認
    let activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(false);

    // グループを削除
    await ui.page.click('.delete-group-btn');

    // アクティブ状態がリセットされる
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(true);
    expect(activeInfo.text).toContain('グループを選択してください');
  });

  test('全クリア後のアクティブ状態リセット', async () => {
    // グループを作成して選択
    await ui.createNewGroup();
    await ui.selectGroup(0);
    
    // アクティブ状態を確認
    let activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(false);

    // 全クリア
    await ui.clearAll();

    // アクティブ状態がリセットされる
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(true);
    expect(activeInfo.text).toContain('グループを選択してください');
  });

  test('チェックボックスクリックではアクティブ化しない', async () => {
    // グループを作成
    await ui.createNewGroup();

    // 初期状態確認
    let activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(true);

    // チェックボックスをクリック
    await ui.toggleGroupCheckbox(0);

    // アクティブ状態は変わらない
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(true);

    // グループエリアをクリック
    await ui.selectGroup(0);

    // アクティブ状態になる
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(false);
  });

  test('ボタンクリックではアクティブ化しない', async () => {
    // グループを作成
    await ui.createNewGroup();

    // 初期状態確認
    let activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(true);

    // 生成されたボタンをクリック
    const button = ui.page.locator('.generated-button').first();
    await button.click();

    // アクティブ状態は変わらない（ボタンクリックでは選択されない）
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(true);
  });
});