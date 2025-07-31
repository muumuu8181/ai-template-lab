/**
 * UI Template Generator テスト用ヘルパー関数
 */

export class UIHelpers {
  constructor(page) {
    this.page = page;
  }

  // 基本的なセレクター
  selectors = {
    // セレクター要素
    colsSelector: '#colsSelector',
    rowsSelector: '#rowsSelector',
    widthSelector: '#widthSelector',
    heightSelector: '#heightSelector',
    alignSelector: '#alignSelector',
    colorSelector: '#colorSelector',
    
    // ボタン
    newGroupBtn: '#newGroupBtn',
    clearBtn: '#clearBtn',
    applySizeBtn: '#applySizeBtn',
    selectAllBtn: '#selectAllBtn',
    deselectAllBtn: '#deselectAllBtn',
    mergeGroupsBtn: '#mergeGroupsBtn',
    copyLogBtn: '#copyLogBtn',
    
    // エリア
    previewArea: '#previewArea',
    messageArea: '#messageArea',
    activeGroupInfo: '#activeGroupInfo',
    logContent: '#logContent',
    
    // 動的要素
    buttonGroup: '.button-group',
    groupCheckbox: '.group-checkbox',
    generatedButton: '.generated-button',
    placeholder: '.placeholder'
  };

  /**
   * ページを開いて初期化
   */
  async goto() {
    const path = require('path');
    const htmlPath = path.resolve(__dirname, '../../../index.html');
    await this.page.goto(`file://${htmlPath}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * セレクター値を選択
   */
  async selectValue(selectorId, value) {
    const selector = `${selectorId} button[data-value="${value}"]`;
    await this.page.click(selector);
    await this.page.waitForTimeout(100); // アニメーション待ち
  }

  /**
   * 横・縦のサイズを設定
   */
  async setGridSize(cols, rows) {
    await this.selectValue(this.selectors.colsSelector, cols.toString());
    await this.selectValue(this.selectors.rowsSelector, rows.toString());
  }

  /**
   * ボタンサイズを設定
   */
  async setButtonSize(width, height) {
    await this.selectValue(this.selectors.widthSelector, width.toString());
    await this.selectValue(this.selectors.heightSelector, height.toString());
  }

  /**
   * ボタンの色を設定
   */
  async setButtonColor(color) {
    await this.selectValue(this.selectors.colorSelector, color);
  }

  /**
   * 新規グループを作成
   */
  async createNewGroup() {
    await this.page.click(this.selectors.newGroupBtn);
    await this.page.waitForTimeout(200); // DOM更新待ち
  }

  /**
   * グループ数を取得
   */
  async getGroupCount() {
    return await this.page.locator(this.selectors.buttonGroup).count();
  }

  /**
   * 指定グループ内のボタン数を取得
   */
  async getButtonCountInGroup(groupIndex = 0) {
    const group = this.page.locator(this.selectors.buttonGroup).nth(groupIndex);
    return await group.locator(this.selectors.generatedButton).count();
  }

  /**
   * プレースホルダーが表示されているかチェック
   */
  async hasPlaceholder() {
    return await this.page.locator(this.selectors.placeholder).isVisible();
  }

  /**
   * グループをクリックして選択
   */
  async selectGroup(groupIndex) {
    const group = this.page.locator(this.selectors.buttonGroup).nth(groupIndex);
    await group.click();
    await this.page.waitForTimeout(100);
  }

  /**
   * グループのチェックボックスを操作
   */
  async toggleGroupCheckbox(groupIndex, checked = true) {
    const checkbox = this.page.locator(this.selectors.groupCheckbox).nth(groupIndex);
    if (checked) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
    await this.page.waitForTimeout(100);
  }

  /**
   * 複数グループのチェックボックスを操作
   */
  async toggleMultipleGroups(groupIndices, checked = true) {
    for (const index of groupIndices) {
      await this.toggleGroupCheckbox(index, checked);
    }
  }

  /**
   * 設定を反映
   */
  async applySettings() {
    await this.page.click(this.selectors.applySizeBtn);
    await this.page.waitForTimeout(200);
  }

  /**
   * 全グループをチェック
   */
  async selectAllGroups() {
    await this.page.click(this.selectors.selectAllBtn);
    await this.page.waitForTimeout(100);
  }

  /**
   * 全グループのチェックを外す
   */
  async deselectAllGroups() {
    await this.page.click(this.selectors.deselectAllBtn);
    await this.page.waitForTimeout(100);
  }

  /**
   * 横1列にまとめる
   */
  async mergeGroups() {
    await this.page.click(this.selectors.mergeGroupsBtn);
    await this.page.waitForTimeout(200);
  }

  /**
   * ボタンの実際のスタイルを取得
   */
  async getButtonStyle(groupIndex, buttonIndex) {
    const button = this.page
      .locator(this.selectors.buttonGroup).nth(groupIndex)
      .locator(this.selectors.generatedButton).nth(buttonIndex);
    
    const computedStyle = await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        width: style.getPropertyValue('width'),
        height: style.getPropertyValue('height'),
        backgroundColor: style.getPropertyValue('background-color'),
        color: style.getPropertyValue('color')
      };
    });

    const inlineStyle = await button.evaluate(el => ({
      width: el.style.width,
      height: el.style.height,
      backgroundColor: el.style.backgroundColor
    }));

    return { computedStyle, inlineStyle };
  }

  /**
   * アクティブグループ情報を取得
   */
  async getActiveGroupInfo() {
    const element = this.page.locator(this.selectors.activeGroupInfo);
    const text = await element.textContent();
    const hasNoActiveClass = await element.locator('.no-active-group').count() > 0;
    return { text, hasNoActiveGroup: hasNoActiveClass };
  }

  /**
   * セレクターの選択状態を取得
   */
  async getSelectedValue(selectorId) {
    const selected = this.page.locator(`${selectorId} .selector-btn.selected`);
    return await selected.getAttribute('data-value');
  }

  /**
   * 現在の設定値を一括取得
   */
  async getCurrentSettings() {
    return {
      cols: await this.getSelectedValue(this.selectors.colsSelector),
      rows: await this.getSelectedValue(this.selectors.rowsSelector),
      width: await this.getSelectedValue(this.selectors.widthSelector),
      height: await this.getSelectedValue(this.selectors.heightSelector),
      align: await this.getSelectedValue(this.selectors.alignSelector),
      color: await this.getSelectedValue(this.selectors.colorSelector)
    };
  }

  /**
   * メッセージエリアの内容を取得
   */
  async getMessageText() {
    return await this.page.locator(this.selectors.messageArea).textContent();
  }

  /**
   * 操作ログの内容を取得
   */
  async getLogContent() {
    const logEntries = await this.page.locator('#logContent .log-entry').count();
    if (logEntries === 0) {
      return [];
    }
    
    const logs = [];
    for (let i = 0; i < logEntries; i++) {
      const entry = this.page.locator('#logContent .log-entry').nth(i);
      const timestamp = await entry.locator('.log-timestamp').textContent();
      const action = await entry.locator('.log-action').textContent();
      logs.push({ timestamp, action });
    }
    return logs;
  }

  /**
   * ボタンのテキスト内容を取得
   */
  async getButtonText(groupIndex, buttonIndex) {
    const button = this.page
      .locator(this.selectors.buttonGroup).nth(groupIndex)
      .locator(this.selectors.generatedButton).nth(buttonIndex);
    return await button.textContent();
  }

  /**
   * チェックされたグループ数を取得
   */
  async getCheckedGroupCount() {
    return await this.page.locator('.group-checkbox:checked').count();
  }

  /**
   * 画面をクリア
   */
  async clearAll() {
    await this.page.click(this.selectors.clearBtn);
    await this.page.waitForTimeout(200);
  }

  /**
   * まとめるボタンの有効状態を確認
   */
  async isMergeButtonEnabled() {
    const button = this.page.locator(this.selectors.mergeGroupsBtn);
    return !(await button.isDisabled());
  }

  /**
   * RGB色をHEXに変換
   */
  rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (!result) return rgb;
    
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * グループの行数を取得
   */
  async getGroupRowCount() {
    return await this.page.locator('.group-row').count();
  }
}