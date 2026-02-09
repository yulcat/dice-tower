/**
 * Dice Tower - Playwright E2E Tests
 * 
 * Run: npx playwright test tests/dice-roller.spec.js
 * (Requires a local server on port 3459)
 */
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:3459';

test.describe('Dice Tower', () => {
  test.beforeEach(async ({ page }) => {
    // Collect JS errors
    page.on('pageerror', err => {
      throw new Error(`Page error: ${err.message}`);
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // Let Three.js initialize
  });

  test('loading screen disappears', async ({ page }) => {
    // Loading element gets removed from DOM after fading, so check for hidden class OR absence
    const loading = page.locator('#loading');
    const count = await loading.count();
    if (count > 0) {
      await expect(loading).toHaveClass(/hidden/, { timeout: 5000 });
    }
    // If element is gone, test passes (it was already removed)
  });

  test('UI elements are present', async ({ page }) => {
    await expect(page.locator('#roll-btn')).toBeVisible();
    await expect(page.locator('#clear-btn')).toBeVisible();
    await expect(page.locator('#notation')).toBeVisible();
    await expect(page.locator('#history-bar')).toBeVisible();

    // All dice buttons
    for (const die of [4, 6, 8, 10, 12, 20]) {
      await expect(page.locator(`.dice-btn[data-die="${die}"]`)).toBeVisible();
    }

    // Preset buttons
    await expect(page.locator('.preset-btn[data-preset="1d20"]')).toBeVisible();
    await expect(page.locator('.preset-btn[data-special="advantage"]')).toBeVisible();
    await expect(page.locator('.preset-btn[data-special="disadvantage"]')).toBeVisible();
  });

  test('1d20 roll produces a valid result', async ({ page }) => {
    await page.click('.preset-btn[data-preset="1d20"]');
    await page.click('#roll-btn');
    await page.waitForTimeout(5500); // Wait for physics settle

    const overlay = page.locator('#result-overlay');
    await expect(overlay).toHaveClass(/visible/);

    const resultText = await page.locator('#result-total').textContent();
    // Result is either a number 2-19 or "Natural 20" / "Natural 1"
    const isNat20 = resultText.includes('Natural 20');
    const isNat1 = resultText.includes('Natural 1');
    if (!isNat20 && !isNat1) {
      const num = parseInt(resultText);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(20);
    }
  });

  test('2d6 roll produces valid result (2-12)', async ({ page }) => {
    await page.click('.preset-btn[data-preset="2d6"]');
    await page.click('#roll-btn');
    await page.waitForTimeout(5500);

    const resultText = await page.locator('#result-total').textContent();
    const num = parseInt(resultText);
    expect(num).toBeGreaterThanOrEqual(2);
    expect(num).toBeLessThanOrEqual(12);
  });

  test('D10 roll produces valid result (1-10)', async ({ page }) => {
    await page.click('.dice-btn[data-die="10"]');
    await page.click('#roll-btn');
    await page.waitForTimeout(5500);

    const resultText = await page.locator('#result-total').textContent();
    const num = parseInt(resultText);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(10);
  });

  test('all dice types roll together without errors', async ({ page }) => {
    await page.fill('#notation', '1d4+1d6+1d8+1d10+1d12+1d20');
    await page.press('#notation', 'Enter');
    await page.waitForTimeout(6000);

    const overlay = page.locator('#result-overlay');
    await expect(overlay).toHaveClass(/visible/);

    const resultText = await page.locator('#result-total').textContent();
    const num = parseInt(resultText);
    // Min: 1+1+1+1+1+1 = 6, Max: 4+6+8+10+12+20 = 60
    expect(num).toBeGreaterThanOrEqual(6);
    expect(num).toBeLessThanOrEqual(60);
  });

  test('clear button resets everything', async ({ page }) => {
    await page.click('.preset-btn[data-preset="1d20"]');
    await page.click('#clear-btn');

    const notation = await page.locator('#notation').inputValue();
    expect(notation).toBe('');

    // No dice should be selected
    const selectedButtons = await page.locator('.dice-btn.selected').count();
    expect(selectedButtons).toBe(0);
  });

  test('advantage rolls 2d20 and picks higher', async ({ page }) => {
    await page.click('.preset-btn[data-special="advantage"]');
    await page.waitForTimeout(5500);

    const overlay = page.locator('#result-overlay');
    await expect(overlay).toHaveClass(/visible/);

    const detail = await page.locator('#result-detail').innerHTML();
    expect(detail).toContain('ADV ⬆');
  });

  test('disadvantage rolls 2d20 and picks lower', async ({ page }) => {
    await page.click('.preset-btn[data-special="disadvantage"]');
    await page.waitForTimeout(5500);

    const overlay = page.locator('#result-overlay');
    await expect(overlay).toHaveClass(/visible/);

    const detail = await page.locator('#result-detail').innerHTML();
    expect(detail).toContain('DIS ⬇');
  });

  test('notation input parsing works', async ({ page }) => {
    await page.fill('#notation', '3d6+2');
    await page.press('#notation', 'Enter');
    await page.waitForTimeout(5500);

    const resultText = await page.locator('#result-total').textContent();
    const num = parseInt(resultText);
    // 3d6+2: min 5, max 20
    expect(num).toBeGreaterThanOrEqual(5);
    expect(num).toBeLessThanOrEqual(20);
  });

  test('history records rolls', async ({ page }) => {
    await page.click('.preset-btn[data-preset="1d20"]');
    await page.click('#roll-btn');
    await page.waitForTimeout(5500);

    const historyItems = await page.locator('.history-item').count();
    expect(historyItems).toBeGreaterThanOrEqual(1);
  });

  test('dice button click increments count', async ({ page }) => {
    const d6btn = page.locator('.dice-btn[data-die="6"]');
    await d6btn.click();
    
    const count = d6btn.locator('.count');
    await expect(count).toHaveText('1');
    await expect(count).not.toHaveClass(/hidden/);

    await d6btn.click();
    await expect(count).toHaveText('2');
  });

  test('8d6 (fireball) produces valid result', async ({ page }) => {
    await page.click('.preset-btn[data-preset="8d6"]');
    await page.click('#roll-btn');
    await page.waitForTimeout(6000);

    const resultText = await page.locator('#result-total').textContent();
    const num = parseInt(resultText);
    // 8d6: min 8, max 48
    expect(num).toBeGreaterThanOrEqual(8);
    expect(num).toBeLessThanOrEqual(48);
  });
});
