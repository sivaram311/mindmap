// E2E validation of the offline mindmap UI. Application is not modified.
const { test, expect } = require('@playwright/test');
const path = require('path');

const APP_URL =
  'file://' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator('#map .tree')).toBeVisible();
});

test('initial rendering: root, five branches, collapsed children, default detail', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText('Machine AI Operating Model');

  const root = page.locator('button.node.root');
  await expect(root).toBeVisible();
  await expect(root).toContainText('This Machine — AI Operating Model');

  for (const label of ['Governance', 'Standing Rules', 'Delivery Workflow', 'Environments & Drives', 'Apps & Interfaces']) {
    await expect(page.locator('button.node', { hasText: label })).toBeVisible();
  }

  // Branches start collapsed (setCollapsed(true)) so deep child is hidden.
  await expect(page.locator('button.node', { hasText: 'Reserve ports before binding' })).toBeHidden();

  // Default detail panel content.
  await expect(page.locator('#detail-title')).toHaveText('This Machine — AI Operating Model');
  await expect(page.locator('#detail-source')).toContainText('CONSCIOUS.md');
  await expect(page.locator('#no-results')).toBeHidden();
});

test('branch expand/collapse via node click and toolbar buttons', async ({ page }) => {
  const governance = page.locator('button.node', { hasText: 'Governance' });
  const govChild = page.locator('button.node', { hasText: 'CONSCIOUS rules 1' });

  await expect(govChild).toBeHidden();
  await governance.click();               // expand
  await expect(govChild).toBeVisible();
  await governance.click();               // collapse
  await expect(govChild).toBeHidden();

  // Expand all reveals a deep leaf.
  await page.locator('#expand').click();
  await expect(page.locator('button.node', { hasText: 'Reserve ports before binding' })).toBeVisible();

  // Collapse branches hides them again but keeps root visible.
  await page.locator('#collapse').click();
  await expect(page.locator('button.node', { hasText: 'Reserve ports before binding' })).toBeHidden();
  await expect(page.locator('button.node.root')).toBeVisible();
});

test('search filters and highlights a match, hiding no-results', async ({ page }) => {
  const search = page.locator('#search');

  // "machine" matches the root title, which is always visited/highlighted first.
  await search.fill('machine');
  await expect(page.locator('#no-results')).toBeHidden();
  await expect(page.locator('button.node.root')).toBeVisible();
  await expect(page.locator('button.node.root mark')).toBeVisible();
});

test('search shows the no-results state for an unknown term', async ({ page }) => {
  const search = page.locator('#search');
  await search.fill('zzqqxnotfound');
  await expect(page.locator('#no-results')).toBeVisible();
});

test('clearing the search restores the tree and removes highlights', async ({ page }) => {
  const search = page.locator('#search');
  await search.fill('machine');
  await expect(page.locator('mark').first()).toBeVisible();

  await search.fill('');
  await expect(page.locator('#no-results')).toBeHidden();
  await expect(page.locator('mark')).toHaveCount(0);
  await expect(page.locator('button.node.root')).toBeVisible();
});

test('search reveals matches across sibling branches', async ({ page }) => {
  const search = page.locator('#search');
  await search.fill('ports');
  await expect(page.locator('#no-results')).toBeHidden();
  await expect(page.locator('button.node', { hasText: 'Reserve ports before binding' })).toBeVisible({ timeout: 4000 });
});

test('selecting a node updates detail title, text, and source', async ({ page }) => {
  await page.locator('#expand').click();

  const leaf = page.locator('button.node', { hasText: 'Reserve ports before binding' });
  await leaf.click();

  await expect(page.locator('#detail-title')).toHaveText('Reserve ports before binding');
  await expect(page.locator('#detail-text')).toContainText('Update both markdown and JSON registries');
  await expect(page.locator('#detail-source')).toContainText('ports\\REGISTRY.md');
});

test('responsive usability: toolbar controls reachable in viewport', async ({ page }, testInfo) => {
  const vp = page.viewportSize();

  const search = page.locator('#search');
  await expect(search).toBeVisible();
  await expect(page.locator('#expand')).toBeVisible();
  await expect(page.locator('#collapse')).toBeVisible();

  // Controls must sit within the viewport width (no clipped/offscreen toolbar).
  for (const sel of ['#search', '#expand', '#collapse']) {
    const box = await page.locator(sel).boundingBox();
    expect(box, `${sel} has a layout box`).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
  }

  // Search is usable at this viewport.
  await search.fill('workflow');
  await expect(page.locator('#no-results')).toBeHidden();

  // Detail/aside panel is reachable at every viewport.
  await expect(page.locator('aside #detail-title')).toBeVisible();

  await testInfo.attach('viewport', { body: `${vp.width}x${vp.height}`, contentType: 'text/plain' });
});
