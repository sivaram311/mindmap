// E2E validation of the offline D3 mindmap UI.
const { test, expect } = require('@playwright/test');
const path = require('path');

const APP_URL =
  'file://' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

const node = (page, title) => page.locator(`g.node[data-title="${title}"]`);

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator('#map svg')).toBeVisible();
  await expect(page.locator('g.node.root')).toBeVisible({ timeout: 5000 });
});

test('initial rendering: root, five branches, collapsed children, default detail', async ({ page }) => {
  await expect(page.locator('h1')).toHaveText('Machine AI Operating Model');

  const root = page.locator('g.node.root');
  await expect(root).toBeVisible();
  await expect(root).toContainText('This Machine — AI Operating Model');

  for (const label of ['Governance', 'Standing Rules', 'Delivery Workflow', 'Environments & Drives', 'Apps & Interfaces']) {
    await expect(node(page, label)).toBeVisible();
  }

  await expect(node(page, 'Reserve ports before binding')).toHaveCount(0);

  await expect(page.locator('#detail-title')).toHaveText('This Machine — AI Operating Model');
  await expect(page.locator('#detail-source')).toContainText('CONSCIOUS.md');
  await expect(page.locator('#no-results')).toBeHidden();
});

test('branch expand/collapse via node click and toolbar buttons', async ({ page }) => {
  const govChild = node(page, 'All AI providers');

  await expect(govChild).toHaveCount(0);
  await page.evaluate(() => {
    const ok = window.__mindmap.toggleByTitle('Governance');
    if (!ok) throw new Error('toggleByTitle Governance failed');
  });
  await expect(govChild).toBeVisible();
  await page.evaluate(() => window.__mindmap.toggleByTitle('Governance'));
  await expect(govChild).toHaveCount(0);

  await page.locator('#expand').click();
  await page.waitForTimeout(400);
  await expect(node(page, 'Reserve ports before binding')).toBeVisible();

  await page.locator('#collapse').click();
  await page.waitForTimeout(400);
  await expect(node(page, 'Reserve ports before binding')).toHaveCount(0);
  await expect(page.locator('g.node.root')).toBeVisible();
});

test('search filters and highlights a match, hiding no-results', async ({ page }) => {
  const search = page.locator('#search');
  await search.fill('machine');
  await expect(page.locator('#no-results')).toBeHidden();
  await expect(page.locator('g.node.root')).toBeVisible();
  await expect(page.locator('g.node.root.match')).toBeVisible();
  await expect(page.locator('g.node.root tspan.mark')).toBeVisible();
});

test('search shows the no-results state for an unknown term', async ({ page }) => {
  await page.locator('#search').fill('zzqqxnotfound');
  await expect(page.locator('#no-results')).toBeVisible();
});

test('clearing the search restores the tree and removes highlights', async ({ page }) => {
  const search = page.locator('#search');
  await search.fill('machine');
  await expect(page.locator('g.node.match').first()).toBeVisible();

  await search.fill('');
  await expect(page.locator('#no-results')).toBeHidden();
  await expect(page.locator('g.node.match')).toHaveCount(0);
  await expect(page.locator('g.node.root')).toBeVisible();
});

test('search reveals matches across sibling branches', async ({ page }) => {
  await page.locator('#search').fill('ports');
  await expect(page.locator('#no-results')).toBeHidden();
  await expect(node(page, 'Reserve ports before binding')).toBeVisible({ timeout: 4000 });
});

test('selecting a node updates detail title, text, and source', async ({ page }) => {
  await page.evaluate(() => window.__mindmap.selectByTitle('Reserve ports before binding'));

  await expect(page.locator('#detail-title')).toHaveText('Reserve ports before binding');
  await expect(page.locator('#detail-text')).toContainText('Update both markdown and JSON registries');
  await expect(page.locator('#detail-source')).toContainText('ports\\REGISTRY.md');
  await expect(node(page, 'Reserve ports before binding')).toHaveClass(/active/);
});

test('responsive usability: toolbar controls reachable in viewport', async ({ page }, testInfo) => {
  const vp = page.viewportSize();
  const search = page.locator('#search');

  await expect(search).toBeVisible();
  await expect(page.locator('#expand')).toBeVisible();
  await expect(page.locator('#collapse')).toBeVisible();
  await expect(page.locator('#reset-view')).toBeVisible();

  for (const sel of ['#search', '#expand', '#collapse', '#reset-view']) {
    const box = await page.locator(sel).boundingBox();
    expect(box, `${sel} has a layout box`).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
  }

  await search.fill('workflow');
  await expect(page.locator('#no-results')).toBeHidden();
  await expect(page.locator('aside #detail-title')).toBeVisible();
  await expect(page.locator('#map svg')).toBeVisible();

  await testInfo.attach('viewport', { body: `${vp.width}x${vp.height}`, contentType: 'text/plain' });
});

test('zoom layer exists and reset view keeps the tree visible', async ({ page }) => {
  await expect(page.locator('#map svg g.zoom-layer')).toBeVisible();
  await page.locator('#reset-view').click();
  await expect(page.locator('g.node.root')).toBeVisible();
});
