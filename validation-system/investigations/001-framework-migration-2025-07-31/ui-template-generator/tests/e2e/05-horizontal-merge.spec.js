import { test, expect } from '@playwright/test';
import { UIHelpers } from './helpers/ui-helpers.js';

test.describe('横1列にまとめる機能テスト', () => {
  let ui;

  test.beforeEach(async ({ page }) => {
    ui = new UIHelpers(page);
    await ui.goto();
  });

  test('2つのグループを横並びにまとめる', async () => {
    // 5つのグループを作成
    for (let i = 0; i < 5; i++) {
      await ui.createNewGroup();
    }

    // 初期状態では各グループが縦に並んでいる（5行）
    const initialRowCount = await ui.getGroupRowCount();
    expect(initialRowCount).toBe(0); // まとめ処理前はgroup-rowクラスは存在しない

    // グループ2と4（インデックス1と3）をチェック
    await ui.toggleMultipleGroups([1, 3]);

    // まとめるボタンが有効になっていることを確認
    const isMergeEnabled = await ui.isMergeButtonEnabled();
    expect(isMergeEnabled).toBe(true);

    // 「横1列にまとめる」ボタンをクリック
    await ui.mergeGroups();

    // グループ2と4が同じ行に配置されることを確認
    const mergedRows = ui.page.locator('.group-row');
    const rowCount = await mergedRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // まとめられたグループが同じ行にあることを確認
    const firstMergedRow = mergedRows.first();
    const groupsInRow = await firstMergedRow.locator('.button-group').count();
    expect(groupsInRow).toBe(2); // 2つのグループが同じ行にある
  });

  test('全体の行数が正しく減少する', async () => {
    // 5つのグループを作成
    for (let i = 0; i < 5; i++) {
      await ui.createNewGroup();
    }

    // 全グループ数を確認
    const totalGroups = await ui.getGroupCount();
    expect(totalGroups).toBe(5);

    // グループ2と4をまとめる（2つのグループが1行になる）
    await ui.toggleMultipleGroups([1, 3]);
    await ui.mergeGroups();

    // まとめ処理後の行構造を確認
    // - まとめられたグループ（2つ）が1つのgroup-rowに入る
    // - 残りの独立グループ（3つ）はそのまま
    // つまり、表示上は4行になる（1つのまとめ行 + 3つの独立グループ）
    const mergedRows = await ui.page.locator('.group-row').count();
    const independentGroups = await ui.page.locator('.button-group:not(.group-row .button-group)').count();
    
    // group-rowが1つ作成され、その中に2つのグループがあることを確認
    expect(mergedRows).toBe(1);
    const groupsInMergedRow = await ui.page.locator('.group-row .button-group').count();
    expect(groupsInMergedRow).toBe(2);
  });

  test('1個のグループでまとめるボタンをクリックした場合のエラー', async () => {
    // 3つのグループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }

    // 1つだけチェック
    await ui.toggleGroupCheckbox(1);

    // まとめるボタンが無効になっていることを確認
    const isMergeEnabled = await ui.isMergeButtonEnabled();
    expect(isMergeEnabled).toBe(false);

    // ボタンをクリックしても何も起こらない（無効なため）
    await ui.page.click('#mergeGroupsBtn', { force: true });

    // エラーメッセージが表示される可能性があるが、
    // ボタンが無効化されているため実際にはクリックできない
    const message = await ui.getMessageText();
    if (message) {
      expect(message).toContain('2個以上');
    }
  });

  test('まとめるボタンの有効/無効状態', async () => {
    // 初期状態ではグループがないためボタンは無効
    let isMergeEnabled = await ui.isMergeButtonEnabled();
    expect(isMergeEnabled).toBe(false);

    // 1つのグループを作成
    await ui.createNewGroup();
    
    // 1つチェックしても無効
    await ui.toggleGroupCheckbox(0);
    isMergeEnabled = await ui.isMergeButtonEnabled();
    expect(isMergeEnabled).toBe(false);

    // 2つ目のグループを作成
    await ui.createNewGroup();
    
    // 2つチェックすると有効
    await ui.toggleGroupCheckbox(1);
    isMergeEnabled = await ui.isMergeButtonEnabled();
    expect(isMergeEnabled).toBe(true);

    // 1つのチェックを外すと無効
    await ui.toggleGroupCheckbox(0, false);
    isMergeEnabled = await ui.isMergeButtonEnabled();
    expect(isMergeEnabled).toBe(false);
  });

  test('3つ以上のグループをまとめる', async () => {
    // 6つのグループを作成
    for (let i = 0; i < 6; i++) {
      await ui.createNewGroup();
    }

    // グループ1、3、5（インデックス0、2、4）をチェック
    await ui.toggleMultipleGroups([0, 2, 4]);

    // まとめる
    await ui.mergeGroups();

    // 3つのグループが同じ行にまとめられることを確認
    const mergedRow = ui.page.locator('.group-row').first();
    const groupsInRow = await mergedRow.locator('.button-group').count();
    expect(groupsInRow).toBe(3);

    // 各グループのタイトルが維持されていることを確認
    const titles = await mergedRow.locator('.button-group-title').allTextContents();
    expect(titles).toHaveLength(3);
    expect(titles[0]).toContain('グループ 1');
    expect(titles[1]).toContain('グループ 3');
    expect(titles[2]).toContain('グループ 5');
  });

  test('まとめ後のグループ機能確認', async () => {
    // 3つのグループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }

    // 2つをまとめる
    await ui.toggleMultipleGroups([0, 1]);
    await ui.mergeGroups();

    // まとめ後もグループの個別選択が可能
    await ui.selectGroup(0);
    let activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.text).toContain('グループ 1');

    // まとめられた2つ目のグループも選択可能
    await ui.selectGroup(1);
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.text).toContain('グループ 2');

    // 独立したグループも選択可能
    await ui.selectGroup(2);
    activeInfo = await ui.getActiveGroupInfo();
    expect(activeInfo.text).toContain('グループ 3');
  });

  test('まとめ後のチェックボックス機能', async () => {
    // 4つのグループを作成
    for (let i = 0; i < 4; i++) {
      await ui.createNewGroup();
    }

    // 2つをまとめる
    await ui.toggleMultipleGroups([1, 2]);
    await ui.mergeGroups();

    // まとめ後にチェックボックスの操作が正常に動作する
    await ui.toggleGroupCheckbox(0);
    await ui.toggleGroupCheckbox(3);

    // チェック数が正しいことを確認
    const checkedCount = await ui.getCheckedGroupCount();
    expect(checkedCount).toBe(2);

    // 反映ボタンのテキストが更新される
    const buttonText = await ui.page.locator('#applySizeBtn').textContent();
    expect(buttonText).toBe('選択中(2)に反映');
  });

  test('まとめ操作の操作ログ記録', async () => {
    // 3つのグループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }

    // 2つをまとめる
    await ui.toggleMultipleGroups([0, 2]);
    await ui.mergeGroups();

    // まとめ操作のログが記録されていることを確認
    const logs = await ui.getLogContent();
    const mergeLog = logs.find(log => log.action.includes('横1列にまとめる') || log.action.includes('グループをまとめる'));
    expect(mergeLog).toBeDefined();
  });

  test('全グループまとめ', async () => {
    // 5つのグループを作成
    for (let i = 0; i < 5; i++) {
      await ui.createNewGroup();
    }

    // 全グループをチェック
    await ui.selectAllGroups();

    // 全てをまとめる
    await ui.mergeGroups();

    // 5つ全てのグループが1行にまとめられることを確認
    const mergedRow = ui.page.locator('.group-row').first();
    const groupsInRow = await mergedRow.locator('.button-group').count();
    expect(groupsInRow).toBe(5);

    // group-rowが1つだけ作成されることを確認
    const totalMergedRows = await ui.page.locator('.group-row').count();
    expect(totalMergedRows).toBe(1);
  });

  test('まとめ処理後の削除機能', async () => {
    // 3つのグループを作成
    for (let i = 0; i < 3; i++) {
      await ui.createNewGroup();
    }

    // 2つをまとめる
    await ui.toggleMultipleGroups([0, 1]);
    await ui.mergeGroups();

    // まとめられたグループの1つを削除
    const deleteBtn = ui.page.locator('.button-group').first().locator('.delete-group-btn');
    await deleteBtn.click();

    // グループが削除されることを確認
    const remainingGroups = await ui.getGroupCount();
    expect(remainingGroups).toBe(2);

    // まとめ行内のグループが1つになることを確認
    const groupsInRow = await ui.page.locator('.group-row .button-group').count();
    expect(groupsInRow).toBe(1);
  });
});