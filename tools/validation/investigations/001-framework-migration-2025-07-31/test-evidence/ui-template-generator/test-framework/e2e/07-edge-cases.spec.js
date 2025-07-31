import { test, expect } from '@playwright/test';
import { UIHelpers } from './helpers/ui-helpers.js';

test.describe('エッジケーステスト', () => {
  let ui;

  test.beforeEach(async ({ page }) => {
    ui = new UIHelpers(page);
    await ui.goto();
  });

  test('グループが0個の状態で全グループチェックをクリック', async () => {
    // 初期状態（グループ0個）で全グループチェックをクリック
    await ui.selectAllGroups();
    
    // エラーメッセージまたは何も起こらないことを確認
    const checkedCount = await ui.getCheckedGroupCount();
    expect(checkedCount).toBe(0);
    
    // 反映ボタンのテキストは変わらない
    const buttonText = await ui.page.locator('#applySizeBtn').textContent();
    expect(buttonText).toBe('反映');
  });

  test('チェックなしで反映ボタンをクリック', async () => {
    // グループを作成（チェックはしない）
    await ui.createNewGroup();
    await ui.createNewGroup();
    
    // チェックなしで反映ボタンをクリック
    await ui.applySettings();
    
    // エラーメッセージが表示される
    const message = await ui.getMessageText();
    expect(message).toContain('チェックされたグループがありません');
  });

  test('チェック1個で横1列にまとめるをクリック', async () => {
    // 2つのグループを作成
    await ui.createNewGroup();
    await ui.createNewGroup();
    
    // 1つだけチェック
    await ui.toggleGroupCheckbox(0);
    
    // まとめるボタンが無効になっていることを確認
    const isMergeEnabled = await ui.isMergeButtonEnabled();
    expect(isMergeEnabled).toBe(false);
    
    // 無効なボタンをクリック（force: trueで強制実行）
    await ui.page.click('#mergeGroupsBtn', { force: true });
    
    // エラーメッセージが表示される可能性
    const message = await ui.getMessageText();
    if (message) {
      expect(message).toContain('2個以上');
    }
  });

  test('アクティブグループを削除後の表示リセット', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // グループを選択してアクティブ状態にする
    await ui.selectGroup(0);
    
    // アクティブ状態を確認
    let activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(false);
    expect(activeInfo.text).toContain('グループ 1');
    
    // アクティブグループを削除
    await ui.page.click('.delete-group-btn');
    
    // アクティブ表示がリセットされる
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(true);
    expect(activeInfo.text).toContain('グループを選択してください');
    
    // プレースホルダーが再表示される
    const hasPlaceholder = await ui.hasPlaceholder();
    expect(hasPlaceholder).toBe(true);
  });

  test('全グループ削除後の状態確認', async () => {
    // 3つのグループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }
    
    // コントロールパネルが表示されていることを確認
    await expect(ui.page.locator('#layoutControlPanel')).toBeVisible();
    await expect(ui.page.locator('#groupControlPanel')).toBeVisible();
    
    // 全グループを削除
    for (let i = 0; i < 3; i++) {
      await ui.page.click('.delete-group-btn');
    }
    
    // プレースホルダーが再表示される
    const hasPlaceholder = await ui.hasPlaceholder();
    expect(hasPlaceholder).toBe(true);
    
    // コントロールパネルが非表示になる
    await expect(ui.page.locator('#layoutControlPanel')).toBeHidden();
    await expect(ui.page.locator('#groupControlPanel')).toBeHidden();
    
    // グループ数が0
    const groupCount = await ui.getGroupCount();
    expect(groupCount).toBe(0);
  });

  test('存在しないグループの選択試行', async () => {
    // グループを1つ作成
    await ui.createNewGroup();
    
    // 存在しない2番目のグループを選択しようとする
    const nonExistentGroup = ui.page.locator('.button-group').nth(1);
    const exists = await nonExistentGroup.count();
    expect(exists).toBe(0);
    
    // アクティブ状態は変わらない
    const activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(true);
  });

  test('同じグループを連続選択', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // 同じグループを連続で選択
    await ui.selectGroup(0);
    await ui.selectGroup(0);
    await ui.selectGroup(0);
    
    // アクティブ状態は正常に維持される
    const activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.hasNoActiveGroup).toBe(false);
    expect(activeInfo.text).toContain('グループ 1');
  });

  test('チェック状態でのグループ削除', async () => {
    // 3つのグループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }
    
    // 2つをチェック
    await ui.toggleMultipleGroups([0, 2]);
    expect(await ui.getCheckedGroupCount()).toBe(2);
    
    // チェックされたグループの1つを削除
    const firstDeleteBtn = ui.page.locator('.button-group').nth(0).locator('.delete-group-btn');
    await firstDeleteBtn.click();
    
    // グループ数が減る
    expect(await ui.getGroupCount()).toBe(2);
    
    // チェック数も減る（削除されたグループのチェックが外れる）
    expect(await ui.getCheckedGroupCount()).toBe(1);
  });

  test('最大サイズ設定での動作確認', async () => {
    // 最大サイズ（10×10、300px×100px）でグループを作成
    await ui.setGridSize(10, 10);
    await ui.setButtonSize(300, 100);
    await ui.createNewGroup();
    
    // 100個のボタンが作成される
    const buttonCount = await ui.getButtonCountInGroup(0);
    expect(buttonCount).toBe(100);
    
    // 設定を変更して反映
    await ui.toggleGroupCheckbox(0);
    await ui.setButtonSize(20, 30);
    await ui.applySettings();
    
    // 全てのボタンが更新される
    const style = await ui.getButtonStyle(0, 0);
    expect(style.computedStyle.width).toBe('20px');
    expect(style.computedStyle.height).toBe('30px');
  });

  test('最小サイズ設定での動作確認', async () => {
    // 最小サイズ（1×1、20px×30px）でグループを作成
    await ui.setGridSize(1, 1);
    await ui.setButtonSize(20, 30);
    await ui.createNewGroup();
    
    // 1個のボタンが作成される
    const buttonCount = await ui.getButtonCountInGroup(0);
    expect(buttonCount).toBe(1);
    
    // ボタンのサイズが正しい
    const style = await ui.getButtonStyle(0, 0);
    expect(style.computedStyle.width).toBe('20px');
    expect(style.computedStyle.height).toBe('30px');
  });

  test('連続的な設定変更と反映', async () => {
    // グループを作成
    await ui.createNewGroup();
    await ui.toggleGroupCheckbox(0);
    
    // 連続的に設定を変更・反映
    for (let i = 0; i < 5; i++) {
      const width = 60 + (i * 20);
      const height = 40 + (i * 10);
      
      await ui.setButtonSize(width, height);
      await ui.applySettings();
      
      // 設定が正しく反映されることを確認
      const style = await ui.getButtonStyle(0, 0);
      expect(style.computedStyle.width).toBe(`${width}px`);
      expect(style.computedStyle.height).toBe(`${height}px`);
    }
  });

  test('グループ作成直後の即座削除', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // すぐに削除
    await ui.page.click('.delete-group-btn');
    
    // プレースホルダーが表示される
    const hasPlaceholder = await ui.hasPlaceholder();
    expect(hasPlaceholder).toBe(true);
    
    // グループ数が0
    const groupCount = await ui.getGroupCount();
    expect(groupCount).toBe(0);
  });

  test('まとめ処理後の設定変更', async () => {
    // 2つのグループを作成
    await ui.createNewGroup();
    await ui.createNewGroup();
    
    // まとめる
    await ui.toggleMultipleGroups([0, 1]);
    await ui.mergeGroups();
    
    // まとめ後にグループの設定を変更
    await ui.selectGroup(0);
    await ui.setButtonSize(80, 60);
    await ui.toggleGroupCheckbox(0);
    await ui.applySettings();
    
    // まとめられたグループでも設定変更が正常に動作する
    const style = await ui.getButtonStyle(0, 0);
    expect(style.computedStyle.width).toBe('80px');
    expect(style.computedStyle.height).toBe('60px');
  });

  test('全クリア後の即座再作成', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // 全クリア
    await ui.clearAll();
    
    // すぐに新しいグループを作成
    await ui.createNewGroup();
    
    // 正常に作成される
    const groupCount = await ui.getGroupCount();
    expect(groupCount).toBe(1);
    
    // グループタイトルが正しい（カウンターが正常に動作）
    const groupTitle = ui.page.locator('.button-group-title').first();
    await expect(groupTitle).toHaveText('グループ 2 (1×3)'); // カウンターは継続
  });

  test('異常な操作シーケンスでのエラーハンドリング', async () => {
    // 異常な操作シーケンス: 削除→選択→反映
    await ui.createNewGroup();
    
    // グループを削除
    await ui.page.click('.delete-group-btn');
    
    // 存在しないグループに対する操作は何も起こらない
    await ui.page.click('#applySizeBtn'); // 反映ボタンクリック
    
    // エラーメッセージが表示される
    const message = await ui.getMessageText();
    expect(message).toContain('チェックされたグループがありません');
  });
});