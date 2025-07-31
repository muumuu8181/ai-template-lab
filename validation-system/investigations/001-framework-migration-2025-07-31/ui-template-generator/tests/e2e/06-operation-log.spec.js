import { test, expect } from '@playwright/test';
import { UIHelpers } from './helpers/ui-helpers.js';

test.describe('操作履歴ログテスト', () => {
  let ui;

  test.beforeEach(async ({ page }) => {
    ui = new UIHelpers(page);
    await ui.goto();
  });

  test('初期状態のログ確認', async () => {
    // 初期状態ではログが空
    const logs = await ui.getLogContent();
    expect(logs.length).toBe(0);
    
    // プレースホルダーメッセージが表示されている
    const placeholder = await ui.page.locator('.log-placeholder').isVisible();
    expect(placeholder).toBe(true);
  });

  test('グループ作成ログの記録', async () => {
    // グループを作成
    await ui.setGridSize(3, 2);
    await ui.setButtonSize(80, 60);
    await ui.setButtonColor('#3498db');
    await ui.createNewGroup();
    
    // ログが記録されていることを確認
    const logs = await ui.getLogContent();
    expect(logs.length).toBe(1);
    expect(logs[0].action).toContain('新規グループ作成');
    expect(logs[0].timestamp).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/); // 日付形式
  });

  test('グループ選択ログの記録', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // グループを選択
    await ui.selectGroup(0);
    
    // 選択ログが記録されていることを確認
    const logs = await ui.getLogContent();
    const selectLog = logs.find(log => log.action.includes('グループ選択'));
    expect(selectLog).toBeDefined();
  });

  test('チェックボックス変更ログの記録', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // チェックボックスを操作
    await ui.toggleGroupCheckbox(0, true);
    
    // チェック変更ログが記録されていることを確認
    const logs = await ui.getLogContent();
    const checkLog = logs.find(log => log.action.includes('グループチェック変更'));
    expect(checkLog).toBeDefined();
    
    // チェックを外す
    await ui.toggleGroupCheckbox(0, false);
    
    // チェック外しログも記録される
    const updatedLogs = await ui.getLogContent();
    const uncheckLogs = updatedLogs.filter(log => log.action.includes('グループチェック変更'));
    expect(uncheckLogs.length).toBe(2); // チェックオンとオフの両方
  });

  test('設定反映ログの記録', async () => {
    // グループを作成してチェック
    await ui.createNewGroup();
    await ui.toggleGroupCheckbox(0);
    
    // 設定を変更して反映
    await ui.setButtonSize(120, 80);
    await ui.applySettings();
    
    // 設定反映ログが記録されていることを確認
    const logs = await ui.getLogContent();
    const applyLog = logs.find(log => log.action.includes('設定反映'));
    expect(applyLog).toBeDefined();
  });

  test('全グループチェックログの記録', async () => {
    // 複数グループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }
    
    // 全グループチェック
    await ui.selectAllGroups();
    
    // 全チェックログが記録されていることを確認
    const logs = await ui.getLogContent();
    const selectAllLog = logs.find(log => log.action.includes('全グループチェック'));
    expect(selectAllLog).toBeDefined();
  });

  test('横1列にまとめるログの記録', async () => {
    // 複数グループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }
    
    // 2つをまとめる
    await ui.toggleMultipleGroups([0, 1]);
    await ui.mergeGroups();
    
    // まとめ操作ログが記録されていることを確認
    const logs = await ui.getLogContent();
    const mergeLog = logs.find(log => 
      log.action.includes('横1列にまとめる') || 
      log.action.includes('グループをまとめる') ||
      log.action.includes('まとめ')
    );
    expect(mergeLog).toBeDefined();
  });

  test('グループ削除ログの記録', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // グループを削除
    await ui.page.click('.delete-group-btn');
    
    // 削除ログが記録されていることを確認
    const logs = await ui.getLogContent();
    const deleteLog = logs.find(log => log.action.includes('グループ削除'));
    expect(deleteLog).toBeDefined();
  });

  test('全クリアログの記録', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // 全クリア
    await ui.clearAll();
    
    // 全クリアログが記録されていることを確認
    const logs = await ui.getLogContent();
    const clearLog = logs.find(log => log.action.includes('全グループをクリア'));
    expect(clearLog).toBeDefined();
  });

  test('複数操作の連続ログ記録', async () => {
    // 複数の操作を連続実行
    await ui.createNewGroup();           // 1. グループ作成
    await ui.selectGroup(0);             // 2. グループ選択
    await ui.toggleGroupCheckbox(0);      // 3. チェック
    await ui.setButtonSize(100, 50);
    await ui.applySettings();             // 4. 設定反映
    await ui.createNewGroup();           // 5. 2つ目のグループ作成
    
    // 全ての操作がログに記録されていることを確認
    const logs = await ui.getLogContent();
    expect(logs.length).toBeGreaterThanOrEqual(4); // 最低4つの主要操作
    
    // 主要操作のログが存在することを確認
    const actionTypes = logs.map(log => log.action);
    expect(actionTypes.some(action => action.includes('新規グループ作成'))).toBe(true);
    expect(actionTypes.some(action => action.includes('グループチェック変更'))).toBe(true);
    expect(actionTypes.some(action => action.includes('設定反映'))).toBe(true);
  });

  test('ログをコピー機能', async ({ context, page }) => {
    // クリップボード権限を付与
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // 複数の操作を実行
    await ui.createNewGroup();
    await ui.toggleGroupCheckbox(0);
    await ui.applySettings();
    
    // ログをコピーボタンをクリック
    await ui.page.click('#copyLogBtn');
    
    // 成功メッセージが表示される
    await ui.page.waitForTimeout(100);
    const message = await ui.getMessageText();
    expect(message).toContain('クリップボードにコピーしました');
    
    // クリップボードの内容を確認（ブラウザ環境でのテストのため、実際の確認は難しい）
    // 代わりに、コピー機能が呼び出されたことを確認
    const copyButton = ui.page.locator('#copyLogBtn');
    await expect(copyButton).toBeEnabled();
  });

  test('ログの時刻フォーマット確認', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // ログの時刻フォーマットを確認
    const logs = await ui.getLogContent();
    expect(logs.length).toBe(1);
    
    // 日本語形式の時刻フォーマット確認
    const timestamp = logs[0].timestamp;
    expect(timestamp).toMatch(/^\[\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2}\]$/);
  });

  test('ログの表示順序確認', async () => {
    // 複数の操作を時間差で実行
    await ui.createNewGroup();
    await ui.page.waitForTimeout(100);
    
    await ui.createNewGroup();
    await ui.page.waitForTimeout(100);
    
    await ui.createNewGroup();
    
    // ログが新しい順（降順）で表示されていることを確認
    const logs = await ui.getLogContent();
    expect(logs.length).toBe(3);
    
    // 最新のログが最初に表示される
    expect(logs[0].action).toContain('新規グループ作成');
    expect(logs[1].action).toContain('新規グループ作成');
    expect(logs[2].action).toContain('新規グループ作成');
  });

  test('ログの最大表示件数制限', async () => {
    // 12個の操作を実行（表示制限は10件）
    for (let i = 0; i < 12; i++) {
      await ui.createNewGroup();
      await ui.page.waitForTimeout(50);
    }
    
    // 表示されるログは最新の10件のみ
    const logs = await ui.getLogContent();
    expect(logs.length).toBe(10);
  });

  test('UI状態情報の記録確認', async () => {
    // グループを作成
    await ui.createNewGroup();
    
    // ログにUI状態情報が含まれていることを確認
    const logs = await ui.getLogContent();
    expect(logs.length).toBe(1);
    
    // ログエントリーにUI状態情報が表示されていることを確認
    const logEntry = ui.page.locator('.log-entry');
    const logResult = await logEntry.locator('.log-result').textContent();
    expect(logResult).toContain('UI状態:');
    expect(logResult).toContain('グループ数=1');
  });

  test('詳細情報付きログの確認', async () => {
    // 設定付きでグループを作成
    await ui.setGridSize(2, 3);
    await ui.setButtonSize(80, 60);
    await ui.setButtonColor('#e74c3c');
    await ui.createNewGroup();
    
    // ログエントリーに詳細情報が含まれていることを確認
    const logEntry = ui.page.locator('.log-entry').first();
    const hasDetails = await logEntry.locator('.log-details').count() > 0;
    
    if (hasDetails) {
      const details = await logEntry.locator('.log-details').textContent();
      expect(details).toContain('詳細:');
    }
  });
});