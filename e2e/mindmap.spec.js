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

test('initial D3 render completes within 500ms', async ({ page }) => {
  const readyAt = await page.evaluate(() => window.__mindmap.readyAt);
  expect(readyAt).toBeGreaterThan(0);
  expect(readyAt).toBeLessThan(500);
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

test('hover tooltip shows node title and summary', async ({ page }) => {
  await page.evaluate(() => window.__mindmap.selectByTitle('Governance'));
  await page.waitForTimeout(400);
  const governance = node(page, 'Governance');
  await governance.locator('.node-hit').hover();
  await expect(page.locator('#tooltip')).toHaveClass(/visible/);
  await expect(page.locator('#tooltip')).toContainText('Governance');
  await expect(page.locator('#tooltip')).toContainText('Authority, scope');
});

test('keyboard shortcuts focus search, clear it, and zoom', async ({ page }) => {
  await page.keyboard.press('/');
  await expect(page.locator('#search')).toBeFocused();

  await page.keyboard.type('ports');
  await expect(page.locator('#search-count')).toContainText('match');
  await expect(node(page, 'Reserve ports before binding')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('#search')).toHaveValue('');
  await expect(page.locator('#search-count')).toHaveText('');

  const before = await page.locator('.zoom-layer').getAttribute('transform');
  await page.keyboard.press('+');
  await page.waitForTimeout(350);
  const after = await page.locator('.zoom-layer').getAttribute('transform');
  expect(after).not.toBe(before);
});

test('node drag records a custom offset and keeps links rendered', async ({ page }) => {
  await page.evaluate(() => window.__mindmap.selectByTitle('Governance'));
  await page.waitForTimeout(400);
  const target = node(page, 'Governance');
  const box = await target.locator('.node-hit').boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 36, box.y + box.height / 2 + 24, { steps: 5 });
  await page.mouse.up();

  const result = await target.evaluate((el) => {
    const datum = window.d3.select(el).datum();
    return { dragX: datum._dragX, dragY: datum._dragY };
  });

  expect(Math.abs(result.dragX)).toBeGreaterThan(5);
  expect(Math.abs(result.dragY)).toBeGreaterThan(5);
  await expect(node(page, 'Governance')).toHaveAttribute('transform', /translate\(/);
  await expect(page.locator('path.link').first()).toBeVisible();
});

// Workstream C — editing and accessibility. Browser execution remains owned by
// the parent serialized runner (CONSCIOUS #15).
test('edit mode reveals selected-node fields and saves changes', async ({ page }) => {
  await page.evaluate(() => window.__mindmap.selectByTitle('Governance'));
  await page.locator('#edit-mode').click();

  await expect(page.locator('#edit-mode')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#edit-form')).toBeVisible();
  await expect(page.locator('#edit-title')).toHaveValue('Governance');

  await page.locator('#edit-summary').fill('Updated governance summary');
  await page.locator('#save-node').click();
  await expect(page.locator('#detail-text')).toContainText('Machine policy');
  await expect(node(page, 'Governance')).toContainText('Updated governance summary');
});

test('edited values survive tree rerenders in the current session', async ({ page }) => {
  await page.evaluate(() => {
    window.__mindmap.updateNode('Governance', {
      title: 'Governance updated',
      summary: 'Persistent across rerenders',
      color: '#123456'
    });
    window.__mindmap.toggleByTitle('Governance updated');
  });

  await expect(node(page, 'Governance updated')).toContainText('Persistent across rerenders');
  await expect(node(page, 'Governance updated').locator('.node-card')).toHaveAttribute('stroke', '#123456');
});

test('editing can add and delete a non-root child with confirmation', async ({ page }) => {
  await page.evaluate(() => window.__mindmap.selectByTitle('Governance'));
  await page.locator('#edit-mode').click();
  await page.locator('#add-child').click();
  await page.locator('#edit-title').fill('Temporary child');
  await page.locator('#save-node').click();
  await expect(node(page, 'Temporary child')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#delete-node').click();
  await expect(node(page, 'Temporary child')).toHaveCount(0);
  await expect(page.locator('#detail-title')).toHaveText('Governance');
});

test('root cannot be deleted', async ({ page }) => {
  await page.locator('#edit-mode').click();
  await expect(page.locator('#delete-node')).toBeDisabled();
  expect(await page.evaluate(() => window.__mindmap.deleteNode('This Machine — AI Operating Model', false))).toBe(false);
});

test('reload restores edits when the Workstream A state store is integrated', async ({ page }) => {
  const hasPersistence = await page.evaluate(
    () => typeof window.__mindmap.saveState === 'function' || typeof window.saveState === 'function'
  );
  test.skip(!hasPersistence, 'Requires the A-owned state envelope after A → C integration');

  await page.evaluate(() => window.__mindmap.updateNode('Governance', { title: 'Saved governance' }));
  await page.reload();
  await expect(node(page, 'Saved governance')).toBeVisible();
  expect(await page.evaluate(() => window.__mindmap.MAP_SCHEMA_VERSION)).toBe(1);
});

test('map exposes ARIA tree semantics and roving tabindex', async ({ page }) => {
  await expect(page.locator('#map')).toHaveAttribute('role', 'tree');
  const root = page.locator('g.node.root');
  await expect(root).toHaveAttribute('role', 'treeitem');
  await expect(root).toHaveAttribute('aria-level', '1');
  await expect(root).toHaveAttribute('aria-selected', 'true');
  await expect(root).toHaveAttribute('aria-expanded', 'true');
  await expect(root).toHaveAttribute('tabindex', '0');
  await expect(page.locator('g.node[tabindex="0"]')).toHaveCount(1);
});

test('arrow, Home, and End keys move tree focus', async ({ page }) => {
  const root = page.locator('g.node.root');
  await root.focus();
  await page.keyboard.press('ArrowDown');
  await expect(node(page, 'Governance')).toBeFocused();
  await page.keyboard.press('End');
  await expect(node(page, 'Apps & Interfaces')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(root).toBeFocused();
});

test('left and right arrows expand and collapse branches while preserving focus', async ({ page }) => {
  const governance = node(page, 'Governance');
  await governance.focus();
  await expect(governance).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('ArrowRight');
  await expect(node(page, 'All AI providers')).toBeVisible();
  await expect(governance).toBeFocused();
  await expect(governance).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(node(page, 'All AI providers')).toHaveCount(0);
  await expect(governance).toBeFocused();
});

test('global shortcuts do not fire while typing in edit fields', async ({ page }) => {
  await page.locator('#search').evaluate((element) => { element.value = 'machine'; });
  await page.locator('#edit-mode').click();
  const title = page.locator('#edit-title');
  await title.focus();
  const before = await page.locator('.zoom-layer').getAttribute('transform');
  await page.keyboard.type('/+0-');
  await page.keyboard.press('Escape');
  await expect(title).toHaveValue('This Machine — AI Operating Model/+0-');
  await expect(page.locator('#search')).not.toBeFocused();
  await expect(page.locator('#search')).toHaveValue('machine');
  await expect(page.locator('.zoom-layer')).toHaveAttribute('transform', before);
});
