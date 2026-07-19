# Mindmap Offline UI — E2E Test Evidence

- **App under test:** `E:\MyWorkspace\sandbox\mindmap\index.html` (offline, `file://`)
- **Role:** E2E hire (QA) + Builder fix follow-up
- **Date:** 2026-07-19
- **Method:** Playwright 1.61.1 (Chromium, headless) via `@playwright/test`
- **Runner policy:** single serialized runner (`workers: 1`); Playwright slot claimed before run and released after
- **Spec:** `e2e/mindmap.spec.js` · **Config:** `e2e/playwright.config.js`

## How to reproduce

```powershell
cd E:\MyWorkspace\sandbox\mindmap\e2e
$env:NODE_PATH="E:\MyWorkspace\sandbox\library\node_modules"
node E:\MyWorkspace\sandbox\library\node_modules\@playwright\test\cli.js test --config=playwright.config.js
```

## Viewports (validated sequentially)

| Preset | Size |
|---|---|
| Realme P2 Pro | 360 × 780 |
| Desktop | 1280 × 800 |
| Tablet | 800 × 1280 |

## Results — 24 tests, exit code 0

| # | Check | Result |
|---|---|---|
| 1 | Initial render: root, 5 branches, collapsed by default, default detail + source | **PASS** |
| 2 | Branch expand/collapse via node click + Expand all / Collapse branches | **PASS** |
| 3 | Search filters + highlights a match; no-results stays hidden | **PASS** |
| 4 | Search no-results state for an unknown term | **PASS** |
| 5 | Clearing search restores tree and removes highlights | **PASS** |
| 6 | Search reveals matches across sibling branches | **PASS** |
| 7 | Selecting a node updates detail title, text, and source | **PASS** |
| 8 | Responsive usability: toolbar/search/detail reachable | **PASS** |

## Defect history

### DEFECT-1 (fixed) — Search missed cross-branch matches

- **Found:** first E2E hire run (`e2e-mindmap-2026-07-19`) — search used `children.some(visit)`, which short-circuits side-effecting recursion.
- **Fix:** `children.map(visit).some(Boolean)` in `index.html` `filterTree()`.
- **Retest:** session `e2e-mindmap-fix-2026-07-19` — 24/24 **PASS**, including cross-branch search for `ports`.

## Verdict

**PASS** — rendering, expand/collapse, search (including cross-branch), selection/detail, and responsive usability across all three required viewports.
