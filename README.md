# Machine AI Operating Model

An interactive, zero-build D3.js mind map of the workflows and standing orders followed by AI assistants on this machine.

**Repo:** [github.com/sivaram311/mindmap](https://github.com/sivaram311/mindmap)  
**Sandbox path:** `E:\MyWorkspace\sandbox\mindmap`  
**Port / CSS / DB:** none — static `file://` UI only  
**Roadmap:** [ROADMAP.md](ROADMAP.md) (Phase 3 advanced features integrated · [plan](PHASE-3-PLAN.md))

## Open

Open [`index.html`](index.html) directly in a browser. No server, package install, database, port reservation, or authentication is required. D3 is vendored at `vendor/d3.v7.min.js` so offline `file://` works without a CDN.

The map supports:

- D3 tree layout with SVG nodes and links
- Layout modes via the `#layout-mode` selector: **horizontal** (default), **radial**, and **cluster** (`__mindmap.setLayout` / `getLayout`); transition throttling keeps 200+ nodes responsive
- Zoom / pan (scroll + drag) and **Reset view**
- Collapsible branches (`_children` pattern)
- Debounced search across titles, descriptions, and source paths (including collapsed nodes), with match count
- Hover/focus tooltips and keyboard-operable nodes
- Drag nodes to arrange them while links update live
- Offline SVG, PNG, Markdown outline, and JSON exports (including collapsed map data)
- Local persistence for collapse state, node positions, zoom, and selection, with separate **Reset state** and **Reset view** controls
- Keyboard shortcuts: `/` search · `+`/`-` zoom · `0` reset · `Esc` clear
- Optional editing for node title, summary, detail, color, and source, including add/delete
- Accessible ARIA tree semantics with roving focus and arrow/Home/End navigation
- A details panel with the authoritative source path
- Responsive desktop, tablet, and Realme P2 Pro layouts

## Scope

Version 1 maps:

1. Governance and sources of truth
2. Standing machine rules
3. Delivery roles and workflow
4. Drives and environment isolation
5. Machine apps and agent interfaces

It includes the current `CONSCIOUS.md` rules covering safety, ports, environment-specific databases, CSS authentication, evidence-gated promotion, activity documentation, E2E hires, the Playwright execution slot, DEV-domain login, reviewer sign-off before push, and **Cloudflare Workers AI credentials via env** (rule **#19**).

## Sources

The map is a hand-authored navigation and awareness layer. It does not replace the source documents. Primary authorities include:

- `E:\MyAgent\AGENTS.md`
- `E:\MyAgent\workflow\CONSCIOUS.md`
- `E:\MyAgent\workflow\cloudflare-workers-ai.md`
- `E:\MyWorkspace\agent-portal\docs\platform\WORKFLOW.md`
- `E:\MyWorkspace\agent-portal\docs\platform\ACCESS-PROTOCOLS.md`
- `E:\MyWorkspace\agent-portal\docs\platform\SANDBOX.md`
- `E:\MyWorkspace\agent-portal\docs\platform\AGENT-API.md`

When a standing order changes, update its node in the `mapData` object inside `index.html`.

## Architecture

| Piece | Location |
|-------|----------|
| UI + `mapData` + D3 render | `index.html` |
| D3 v7 (offline) | `vendor/d3.v7.min.js` |
| Enhancement plan | `ROADMAP.md` |
| Playwright E2E | `e2e/` |

No build step. Open the HTML file and use it.

## Data schema and persistence integration

The editable tree schema is versioned by `MAP_SCHEMA_VERSION` in `index.html`
(currently `1`). A snapshot envelope contains `{ schemaVersion, tree }`; loaders
must migrate older snapshots before rendering and reject unsupported newer
versions. See [CONTRIBUTING.md](CONTRIBUTING.md) for the node shape.

Editing remains functional without persistence. When Workstream A's state store
is present, tree changes call `window.__mindmap.saveState` (or
`window.saveState`) with the versioned tree payload and emit
`mindmap:treechange`. The integrated state envelope must restore that tree
before constructing the D3 hierarchy; no second local-storage path is used.

## E2E

Evidence: [`e2e/RESULTS.md`](e2e/RESULTS.md) — **108 tests** across 3 viewports (Realme / desktop / tablet), covering Phase 3 A/B/C plus the `<500ms` initial-render target.

Playwright is a machine-wide serialized resource. Keep `workers: 1` and
`fullyParallel: false`; never use a parallel project matrix against the single
runner slot. Claim and release the slot around every browser run.
