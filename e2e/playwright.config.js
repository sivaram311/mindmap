// E2E config for offline mindmap UI. Read-only against index.html (file://).
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'report.json' }]],
  use: { headless: true },
  projects: [
    { name: 'realme-p2-pro-360x780', use: { viewport: { width: 360, height: 780 } } },
    { name: 'desktop-1280x800', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'tablet-800x1280', use: { viewport: { width: 800, height: 1280 } } },
  ],
});
