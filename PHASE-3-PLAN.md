# Phase 3–4 Implementation Plan

**Project:** [sivaram311/mindmap](https://github.com/sivaram311/mindmap)  
**Status:** Planned (July 19, 2026) — docs only; implementation not started  
**Constraints:** Offline `file://`, zero-build, vendored D3 only, CONSCIOUS #12 / #15 / #17

Planned in parallel by three workstreams. Merge order: **A → B → C → docs/E2E → Reviewer GO → push**.

---

## Workstream A — Export & Persistence

### Scope
Offline export (SVG / PNG / Markdown / JSON) and LocalStorage view-state restore. No new runtime deps.

### Toolbar
| Control | ID |
|---------|-----|
| Export SVG | `#export-svg` |
| Export PNG | `#export-png` |
| Export Markdown | `#export-md` |
| Export JSON | `#export-json` |
| Reset state | `#reset-state` (distinct from `#reset-view`) |

On ≤480px, wrap exports in `<details id="export-menu">`.

### Functions
`downloadBlob`, `cloneMapSvg`, `exportSvg`, `exportPng`, `exportMarkdown`, `exportJson`, `collectState`, `applyState`, `saveState`, `loadState`, `resetState`  
`STORAGE_KEY = mindmap.ui.v1` — keys by **title** (not numeric id).

### Hooks
Call `saveState()` from `toggleNode` / `setExpanded`, `selectNode`, `nodeDrag` end, and debounced `zoom`. Boot: `loadState()` before first `update`. Expose helpers on `window.__mindmap`.

### E2E (append)
1. Export controls visible (incl. Realme viewport)
2. SVG download contains root title
3. PNG download non-empty
4. Markdown includes nested titles
5. JSON includes `mapData` + view snapshot
6. LocalStorage survives reload (collapse, drag, zoom, selection)
7. Reset state clears persistence
8. Reset view does **not** clear drag offsets

---

## Workstream B — Layout Modes & Performance

**Status:** Implemented (July 19, 2026) on branch `feat/phase3-b-layout-modes` — awaiting single serialized E2E run (parent-owned, CONSCIOUS #15) and Reviewer GO. APIs kept additive for merge after A.

### Scope
≥2 hierarchical layouts. **Defer force-directed** (fights collapse/`_children` + drag; poor scale).

| Mode | Engine |
|------|--------|
| `horizontal` (default) | current `d3.tree` + cubic links |
| `radial` | polar `d3.tree` + `d3.linkRadial` |
| `cluster` (optional) | `d3.cluster` same polar path |

Toolbar: `#layout-mode`. Clear `_drag*` on switch. Expose `__mindmap.setLayout` / `getLayout`.

### Refactor
`applyLayout(root)`, `linkPath(s,d)`, keep one `update()` join. Unify coordinate convention in `applyLayout` so `fitView` / `centerOn` / drag stay consistent.

### Performance (200+ nodes)
Delivered: transition throttling — joins skip the tween above `PERF_NODE_LIMIT = 200` visible nodes (`dur = 0`) plus a `renderGen` token; radial uses stable normalized polar coords; search `matchIds` reduction preserved; `<500ms` `readyAt` intact (default layout unchanged). Viewport culling **deferred** — not robust enough to enable without risking current rendering.

### Delivered
- Modes: `horizontal` (default), `radial`, `cluster` — one shared `update()` join.
- `applyLayout(root)` unifies the coordinate convention (`d.y` = screen X, `d.x` = screen Y); `linkPath(s,d)` dispatches cubic vs `d3.linkRadial`.
- `#layout-mode` toolbar select; `_drag*` cleared and disabled off horizontal; `__mindmap.setLayout` / `getLayout` exposed (additive).

### E2E (append) — authored, not yet run (parent-owned serialized runner)
1. Layout switcher visible / default horizontal
2. Radial keeps root + five branches
3. Radial + reset view still visible
4. Back to horizontal restores toggle interactions
5. Layout switch under 500ms
6. Expand-all under radial stays interactive

---

## Workstream C — Editing, Accessibility & Phase 4

**Depends on A’s state store** — extend envelope; no second persistence path.

### Editing
`#edit-mode` toggle → aside form for title / summary / detail / color / source. Add child, delete non-root (confirm). Persist via A’s `saveState` with `schemaVersion` + tree snapshot. `__mindmap.setEditMode|addChild|updateNode|deleteNode`.

### Accessibility
`#map` → `role="tree"`; nodes → `treeitem` with `aria-expanded` / `aria-level` / `aria-selected`; roving tabindex; ↑↓←→ Home/End; restore focus after `update()`.

### Phase 4 docs (C-owned files — safe parallel)
- `MAP_SCHEMA_VERSION = 1` + migrate-on-load
- `CONTRIBUTING.md` (zero-build, #12/#15/#17)
- `.github/ISSUE_TEMPLATE/` bug + feature
- README/CI note: Playwright `workers:1`, never parallel matrix against machine slot

### E2E (append)
Edit toggle/fields · edit persists · add child · delete non-root · reload keeps edits · ARIA tree · arrow focus · expand/collapse keys · shortcuts ignore edit fields

---

## Conflict avoidance (`index.html` shared)

| Region | Owner |
|--------|-------|
| Export toolbar + persistence JS | A |
| `#layout-mode` + layout adapter | B |
| `#edit-mode` + aside form + ARIA attrs | C |
| `localStorage` envelope | A defines; C adds `tree`/`schemaVersion` |
| `window.__mindmap` | Additive only |
| Docs / `.github` / CONTRIBUTING | C |
| E2E execution | Serialized (`workers:1`, CONSCIOUS #15) |

## Suggested landing order
1. A store + reset-state → A exports → A E2E  
2. B layout adapter → B E2E  
3. C edit + a11y → C docs → C E2E  
4. Full suite (one runner) → Reviewer GO → push
