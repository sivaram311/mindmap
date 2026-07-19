# Machine AI Operating Model

An interactive, zero-build D3.js mind map of the workflows and standing orders followed by AI assistants on this machine.

**Repo:** [github.com/sivaram311/mindmap](https://github.com/sivaram311/mindmap)  
**Sandbox path:** `E:\MyWorkspace\sandbox\mindmap`  
**Port / CSS / DB:** none — static `file://` UI only  
**Roadmap:** [ROADMAP.md](ROADMAP.md) (Phase 2 complete · [Phase 3–4 plan](PHASE-3-PLAN.md) ready)

## Open

Open [`index.html`](index.html) directly in a browser. No server, package install, database, port reservation, or authentication is required. D3 is vendored at `vendor/d3.v7.min.js` so offline `file://` works without a CDN.

The map supports:

- D3 tree layout with SVG nodes and links
- Zoom / pan (scroll + drag) and **Reset view**
- Collapsible branches (`_children` pattern)
- Debounced search across titles, descriptions, and source paths (including collapsed nodes), with match count
- Hover/focus tooltips and keyboard-operable nodes
- Drag nodes to arrange them while links update live
- Keyboard shortcuts: `/` search · `+`/`-` zoom · `0` reset · `Esc` clear
- A details panel with the authoritative source path
- Responsive desktop, tablet, and Realme P2 Pro layouts

## Scope

Version 1 maps:

1. Governance and sources of truth
2. Standing machine rules
3. Delivery roles and workflow
4. Drives and environment isolation
5. Machine apps and agent interfaces

It includes the current `CONSCIOUS.md` rules covering safety, ports, environment-specific databases, CSS authentication, evidence-gated promotion, activity documentation, E2E hires, the Playwright execution slot, DEV-domain login, and reviewer sign-off before push.

## Sources

The map is a hand-authored navigation and awareness layer. It does not replace the source documents. Primary authorities include:

- `E:\MyAgent\AGENTS.md`
- `E:\MyAgent\workflow\CONSCIOUS.md`
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

## E2E

Evidence: [`e2e/RESULTS.md`](e2e/RESULTS.md) — 39 tests across 3 viewports (Realme / desktop / tablet), including the `<500ms` initial-render target.
