# Cloudflare Workers AI (mindmap awareness)

This static mindmap does **not** call Workers AI at runtime.

Machine credentials and standing order live in **MyAgent**:

| Item | Location |
|------|----------|
| Standing order | `E:\MyAgent\workflow\CONSCIOUS.md` rule **#19** |
| How-to (models + quota) | `E:\MyAgent\workflow\cloudflare-workers-ai.md` |
| Secrets (gitignored) | `E:\MyAgent\workflow\secrets\cloudflare-workers-ai.env` |
| Env example | `E:\MyAgent\workflow\cloudflare-workers-ai.env.example` |
| User env | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_WORKERS_AI_TOKEN` |

## Ops agents should follow

1. **Models** — `GET …/accounts/{id}/ai/models/search` (live catalog; do not hardcode).
2. **Quota** — Free **10,000 neurons/day** (UTC reset). Read `cf-ai-neurons` on each `ai/run`. Account totals need GraphQL `aiInferenceAdaptiveGroups` + analytics permission; otherwise use the Cloudflare Workers AI dashboard. Error **4006** = daily free allocation exhausted.
3. Never commit tokens; keep Workers AI token separate from Zone Edit DNS.

Map nodes: **Standing rules → Cloudflare Workers AI via env** and **Environments → Workers AI credentials**.
