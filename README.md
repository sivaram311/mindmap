# Machine AI Operating Model

An interactive, zero-build mind map of the workflows and standing orders followed by AI assistants on this machine.

**Repo:** [github.com/sivaram311/mindmap](https://github.com/sivaram311/mindmap)  
**Sandbox path:** `E:\MyWorkspace\sandbox\mindmap`  
**Port / CSS / DB:** none — static `file://` UI only

## Open

Open [`index.html`](index.html) directly in a browser. No server, package install, database, port reservation, or authentication is required.

The map supports:

- Collapsible branches
- Search across titles, descriptions, and source paths
- A details panel with the authoritative source path
- Responsive desktop and mobile layouts

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

The project intentionally contains no external dependencies. HTML, CSS, map data, rendering, search, and interactions are all contained in `index.html`, allowing it to work offline from the filesystem.
