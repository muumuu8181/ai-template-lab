import { test, expect } from '@playwright/test';

test('ページが正常に読み込まれるか確認', async ({ page }) => {
  const path = require('path');
  const htmlPath = path.resolve(__dirname, '../index.html');
  
  await page.goto(`file://${htmlPath}`);
  await page.waitForLoadState('domcontentloaded');
  
  // タイトルが正しいかチェック
  const title = await page.locator('h1').textContent();
  expect(title).toBe('UI Template Generator v0.41');
  
  // プレースホルダーが表示されているかチェック  
  const placeholder = page.locator('.placeholder');
  await expect(placeholder).toBeVisible();
  
  console.log('✓ ページの読み込みと基本要素の確認に成功');
});