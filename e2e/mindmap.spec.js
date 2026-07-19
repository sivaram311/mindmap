// E2E validation of the offline D3 mindmap UI.
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

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

test('export menu and reset state remain reachable in the viewport', async ({ page }) => {
  await expect(page.locator('#export-menu > summary')).toBeVisible();
  await expect(page.locator('#reset-state')).toBeVisible();
  await page.locator('#export-menu > summary').click();

  for (const selector of ['#export-svg', '#export-png', '#export-md', '#export-json']) {
    const control = page.locator(selector);
    await expect(control).toBeVisible();
    const box = await control.boundingBox();
    const viewport = page.viewportSize();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  }
});

test('SVG export downloads an offline map containing the root title', async ({ page }) => {
  await page.locator('#export-menu > summary').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#export-svg').click()
  ]);
  const content = fs.readFileSync(await download.path(), 'utf8');
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
  expect(content).toContain('This Machine — AI Operating Model');
  expect(content).toContain('<metadata>');
});

test('PNG export downloads a non-empty image', async ({ page }) => {
  await page.locator('#export-menu > summary').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#export-png').click()
  ]);
  const content = fs.readFileSync(await download.path());
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  expect(content.length).toBeGreaterThan(1000);
  expect(content.subarray(1, 4).toString()).toBe('PNG');
});

test('Markdown export includes nested titles even while branches are collapsed', async ({ page }) => {
  await page.locator('#export-menu > summary').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#export-md').click()
  ]);
  const content = fs.readFileSync(await download.path(), 'utf8');
  expect(content).toContain('- Governance');
  expect(content).toContain('    - E:\\MyAgent');
  expect(content).toContain('      - Three visual presets');
});

test('JSON export includes complete map data and the view snapshot', async ({ page }) => {
  await page.locator('#export-menu > summary').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#export-json').click()
  ]);
  const content = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  expect(content.mapData.title).toBe('This Machine — AI Operating Model');
  expect(content.mapData.children[1].children.some((item) => item.title === 'Reserve ports before binding')).toBe(true);
  expect(content.view).toEqual(expect.objectContaining({
    collapsed: expect.any(Object),
    dragOffsets: expect.any(Object),
    zoom: expect.any(Object),
    selectedTitle: expect.any(String)
  }));
});

test('collapse, drag, zoom, and selection state survive reload', async ({ page }) => {
  await page.evaluate(() => {
    window.__mindmap.toggleByTitle('Governance');
    const state = window.__mindmap.collectState();
    state.dragOffsets.Governance = { x: 24, y: 36 };
    state.zoom = { x: 73, y: 41, k: 1.2 };
    state.selectedTitle = 'Governance';
    window.__mindmap.applyState(state);
    window.__mindmap.saveState();
  });
  await page.reload();
  await expect(page.locator('g.node.root')).toBeVisible();

  const state = await page.evaluate(() => window.__mindmap.collectState());
  expect(state.collapsed.Governance).toBe(false);
  expect(state.dragOffsets.Governance).toEqual({ x: 24, y: 36 });
  expect(state.zoom.k).toBeCloseTo(1.2, 5);
  expect(state.selectedTitle).toBe('Governance');
  await expect(page.locator('#detail-title')).toHaveText('Governance');
});

test('reset state clears persisted view state', async ({ page }) => {
  await page.evaluate(() => {
    window.__mindmap.toggleByTitle('Governance');
    window.__mindmap.saveState();
  });
  expect(await page.evaluate(() => localStorage.getItem(window.__mindmap.STORAGE_KEY))).not.toBeNull();
  await page.locator('#reset-state').click();
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => localStorage.getItem(window.__mindmap.STORAGE_KEY))).toBeNull();
});

test('reset view preserves custom node drag offsets', async ({ page }) => {
  await page.evaluate(() => {
    const state = window.__mindmap.collectState();
    state.dragOffsets.Governance = { x: 18, y: 27 };
    window.__mindmap.applyState(state);
    window.__mindmap.saveState();
  });
  await page.locator('#reset-view').click();
  await page.waitForTimeout(350);
  const offset = await page.evaluate(() => window.__mindmap.collectState().dragOffsets.Governance);
  expect(offset).toEqual({ x: 18, y: 27 });
});

// --- Workstream B: Layout Modes & Performance -------------------------------

test('layout switcher is visible and defaults to horizontal', async ({ page }) => {
  const select = page.locator('#layout-mode');
  await expect(select).toBeVisible();
  await expect(select).toHaveValue('horizontal');
  const mode = await page.evaluate(() => window.__mindmap.getLayout());
  expect(mode).toBe('horizontal');
});

test('radial layout keeps the root and five branches visible', async ({ page }) => {
  await page.selectOption('#layout-mode', 'radial');
  await expect.poll(() => page.evaluate(() => window.__mindmap.getLayout())).toBe('radial');
  await page.waitForTimeout(400);

  await expect(page.locator('g.node.root')).toBeVisible();
  for (const label of ['Governance', 'Standing Rules', 'Delivery Workflow', 'Environments & Drives', 'Apps & Interfaces']) {
    await expect(node(page, label)).toBeVisible();
  }
  await expect(page.locator('path.link').first()).toBeVisible();
});

test('radial layout survives a reset view', async ({ page }) => {
  await page.selectOption('#layout-mode', 'radial');
  await page.waitForTimeout(400);
  await page.locator('#reset-view').click();
  await page.waitForTimeout(400);

  await expect(page.locator('g.node.root')).toBeVisible();
  await expect(node(page, 'Governance')).toBeVisible();
  const mode = await page.evaluate(() => window.__mindmap.getLayout());
  expect(mode).toBe('radial');
});

test('switching back to horizontal restores toggle interactions', async ({ page }) => {
  await page.selectOption('#layout-mode', 'radial');
  await page.waitForTimeout(400);
  await page.selectOption('#layout-mode', 'horizontal');
  await expect.poll(() => page.evaluate(() => window.__mindmap.getLayout())).toBe('horizontal');
  await page.waitForTimeout(400);

  const govChild = node(page, 'All AI providers');
  await expect(govChild).toHaveCount(0);
  await page.evaluate(() => {
    const ok = window.__mindmap.toggleByTitle('Governance');
    if (!ok) throw new Error('toggleByTitle Governance failed');
  });
  await expect(govChild).toBeVisible();
  await page.evaluate(() => window.__mindmap.toggleByTitle('Governance'));
  await expect(govChild).toHaveCount(0);
});

test('layout switch completes under 500ms', async ({ page }) => {
  const elapsed = await page.evaluate(() => {
    const t0 = performance.now();
    window.__mindmap.setLayout('radial');
    return performance.now() - t0;
  });
  expect(elapsed).toBeGreaterThanOrEqual(0);
  expect(elapsed).toBeLessThan(500);
});

test('expand-all under radial stays interactive', async ({ page }) => {
  await page.selectOption('#layout-mode', 'radial');
  await page.waitForTimeout(400);
  await page.locator('#expand').click();
  await page.waitForTimeout(500);

  await expect(node(page, 'Reserve ports before binding')).toBeVisible();
  await page.evaluate(() => window.__mindmap.selectByTitle('Reserve ports before binding'));
  await expect(page.locator('#detail-title')).toHaveText('Reserve ports before binding');
  await expect(node(page, 'Reserve ports before binding')).toHaveClass(/active/);
});
