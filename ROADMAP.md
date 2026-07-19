# D3.js Enhancement Roadmap for Machine AI Operating Model Mindmap

**Project**: [sivaram311/mindmap](https://github.com/sivaram311/mindmap)  
**Goal**: Evolve the static vanilla JS mindmap into a powerful, interactive D3.js visualization while keeping it lightweight, offline-first, and aligned with Machine AI Operating Model principles.  
**Status**: Phase 2 complete · Phase 3 Workstream C and initial Phase 4 docs complete (July 19, 2026) — see [PHASE-3-PLAN.md](PHASE-3-PLAN.md)
**Estimated Effort**: 1–2 weeks (part-time)

## Why D3.js?

- Superior hierarchical layouts (`d3-hierarchy`, `d3-tree`)
- Native support for zoom, pan, drag, collapse, transitions
- Scalable SVG rendering
- Future-proof for editing, real-time updates, and alternative views (radial, force-directed)
- Minimal overhead (vendored `vendor/d3.v7.min.js` for offline `file://`)

**Non-Goals**: Heavy frameworks, build tools, or breaking offline `file://` support.

## High-Level Phases & Milestones

### Phase 1: Core D3 Integration (MVP)

**Duration**: 1–2 days  
**Focus**: Replace vanilla tree with functional D3 equivalent.

**Key Tasks**:

- [x] Add D3 v7 via local vendor (offline-safe)
- [x] Convert `mapData` to `d3.hierarchy`
- [x] Implement `d3.tree()` layout with SVG nodes + links
- [x] Port click-to-collapse/expand (with `_children` pattern)
- [x] Sync with existing detail panel + search (basic filtering)
- [x] Preserve colors, icons, and CSS variables
- [x] Zoom/pan enabled

**Milestone 1 – "D3 Foundation"** (Target: July 20–21, 2026)

- Fully working tree visualization matching current UI
- Zoom/pan enabled
- All original features functional
- **Deliverable**: Updated `index.html` (committed with E2E passing)

### Phase 2: UX Polish & Interactions

**Duration**: 2–3 days  
**Focus**: Make it feel premium and delightful.

**Key Tasks**:

- [x] Smooth transitions and reduced-motion support
- [x] Advanced search (highlight matches, dynamic re-layout, 140ms debounce, match count)
- [x] Hover/focus tooltips with summaries
- [x] Node dragging (repositioning with live link updates)
- [x] Keyboard shortcuts (`/` search, `+`/`-` zoom, `0` reset, `Esc` clear)
- [x] Mobile/touch optimization (Realme P2 Pro friendly)
- [x] Better responsive behavior (compact three-column controls at ≤480px)

**Milestone 2 – "Polished Interactive Map"** (Target: July 22–24)

- Butter-smooth 60fps interactions
- Search + filter works intuitively
- Visual consistency with the dark theme and accents
- **Deliverable**: Production-ready version + updated README — **complete**

### Phase 3: Advanced Features & Extensibility

**Duration**: 3–5 days  
**Focus**: Unlock power-user capabilities.  
**Plan:** [PHASE-3-PLAN.md](PHASE-3-PLAN.md) (Workstreams A–C, planned in parallel July 19)

**Key Tasks**:

- [ ] **A** Export SVG / PNG / Markdown / JSON (offline, no CDN)
- [ ] **A** LocalStorage persistence + `#reset-state` (distinct from `#reset-view`)
- [ ] **B** Layout modes: horizontal (default) + radial; optional cluster; **defer force-directed**
- [ ] **B** Viewport culling / transition throttling for 200+ nodes
- [x] **C** Inline editing mode (add / edit / delete; color + source)
- [x] **C** ARIA tree + arrow-key navigation
- [ ] Integration hooks for live markdown sources (later)
- [ ] Playwright coverage for A/B/C (serialized runner, CONSCIOUS #15)

**Milestone 3 – "Feature-Rich Visualization"** (Target: July 25–28)

- Export and editing functional
- At least 2 layout options
- Updated Playwright E2E covering new interactions
- **Deliverable**: Comprehensive release with docs
- **Merge order:** A → B → C → full E2E → Reviewer GO → push

### Phase 4: Documentation, Testing & Maintenance

**Duration**: Ongoing (1–2 days initial)  
**Plan:** Workstream C in [PHASE-3-PLAN.md](PHASE-3-PLAN.md)

**Key Tasks**:

- [x] Expand README; add `CONTRIBUTING.md`
- [x] `MAP_SCHEMA_VERSION` contract and migration requirement for the A-owned loader
- [x] `.github/ISSUE_TEMPLATE/` (bug + feature)
- [x] CI note: Playwright `workers: 1` only; never parallel matrix vs machine slot
- [ ] Optional later: Web Component wrapper; visual regression goldens

**Milestone 4 – "Mature & Maintainable"** (Target: End of July 2026)

- Public-ready repo
- CI-friendly tests (single runner)
- Clear path for future contributors (including other agents)

## Success Criteria

- **Performance**: <500ms initial load, smooth interactions
- **Bundle Size**: <100KB added (gzipped) beyond D3 vendor
- **Compatibility**: Works offline, on desktop + mobile
- **Fidelity**: All existing features preserved + improved
- **Alignment**: Follows CONSCIOUS rules, evidence-gated, documented changes

## Risks & Mitigations

- **Learning Curve**: Start with small prototypes; use ObservableHQ examples
- **Size**: Vendor only the full D3 v7 build for Phase 1; trim modules later if needed
- **Complexity**: Keep editing optional behind a toggle (Phase 3)
- **Testing**: Extend existing Playwright suite early (Phase 1)

## Resources

- D3 official: https://d3js.org/
- Tree examples on ObservableHQ
- Existing `mapData` structure (hierarchical — fits `d3.hierarchy`)
