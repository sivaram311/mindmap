# Contributing

This mind map is a zero-build, offline-first application. Keep runtime code in
`index.html`, keep D3 vendored, and do not add CDN, package, server, database,
port, or authentication requirements.

## Development

1. Create a feature branch or isolated worktree from current `main`.
2. Open `index.html` directly with a `file://` URL.
3. Keep `mapData` compatible with `MAP_SCHEMA_VERSION` in `index.html`.
4. Update documentation and tests with behavior changes.
5. Inspect the diff and run proportionate static checks before committing.

Node data uses this versioned shape:

```json
{
  "schemaVersion": 1,
  "tree": {
    "title": "Required title",
    "icon": "Optional short icon",
    "summary": "Optional summary",
    "detail": "Optional detail",
    "color": "#62d9ff",
    "source": "Optional authoritative path",
    "children": []
  }
}
```

`MAP_SCHEMA_VERSION` is currently `1`. Persistence loaders must migrate older
snapshots before rendering and must not silently load a newer unsupported
version. Tree edits call an existing `window.__mindmap.saveState` or
`window.saveState` hook with `{ schemaVersion, tree }`; the persistence owner
must include those fields in its state envelope.

## Verification and machine safety

- Follow the machine standing orders, especially CONSCIOUS #12 (record
  meaningful work), #15 (one Playwright runner), and #17 (Reviewer GO before
  push).
- Playwright configuration must keep `workers: 1` and `fullyParallel: false`.
- Never use a parallel browser-project matrix against the single machine slot.
- Claim the Playwright slot before a run and release it with the result.
- Do not commit generated reports, test results, secrets, or local environment
  files.

Open pull requests with a focused description, verification evidence, schema
impact, and any persistence migration or integration notes.
