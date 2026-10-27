# Global tool routing

`~/.config/opencode/routing.json` controls routing hints for primary and child agents. Change a boolean and restart the OpenCode service:

```bash
node scripts/switch.mjs headroom on
node scripts/switch.mjs search off --project .
node scripts/switch.mjs --list
```

A project's `.opencode/routing.json` overrides global settings; `OPENCODE_ROUTING_CONFIG` selects another file. Global plugin registration belongs in `~/.config/opencode/opencode.jsonc`: `"plugins": ["./plugins/routing.ts"]`. The repository template keeps its local router disabled with `{ "package": "./plugins/routing.ts", "options": { "routing": false } }`. `core:false` disables all routing hints without removing tools.

| Switch | Default | Effect |
|---|---|---|
| `core` | `true` | Master switch for all routing hints. Does not remove tools. |
| `skills` | `true` | Load one relevant skill; keep Ponytail core active without its full body. |
| `search` | `true` | DeepSeek search/fetch, native websearch/webfetch, Context7, Jev, Treg, Agent Reach. |
| `brain` | `true` | Narrow prior-work retrieval; Jev never replaces local brain search. |
| `graphify` | `true` | Query an existing graph before broad reads; omit the hint when no graph exists. |
| `tokensave` | `true` | Use the code graph for indexed projects; do not silently use a stale index. |
| `parallel` | `true` | Parallel independent background agents; no parallel edits to the same file. |
| `decisions` | `true` | Laya for typed decisions; Jev for live pages. |
| `mcp` | `true` | REA only for reverse engineering; disable unused servers. |
| `headroom` | `false` | Load the native Headroom OpenCode plugin and its retrieve tool. |

These are deterministic routing hints, not hard enforcement. The model still decides whether a tool is relevant. Forcing every tool on every request would waste context and money. MCP server switches remain in `opencode.json(c)`; use V2's `disabled`, not legacy `enabled`.

## Search order

1. Current facts: `deepseek.search`; known page: `deepseek.fetch`.
2. Fallback: native `websearch`/`webfetch`. Native Firecrawl uses `FIRECRAWL_API_KEY` or `/connect`; `"provider": "firecrawl"` selects it. `"random"` rotates among configured providers.
3. Library/API docs: Context7.
4. JS-heavy or login-gated page: Jev `jev_search`.
5. Broad structured/social research: Treg. Agent Reach is an installed CLI fallback for supported channels.

DeepSeek and Firecrawl are independent providers. Firecrawl is not used by the DeepSeek plugin. Native search is configured globally, but a failing provider can still return an error such as HTTP 402; use the next route.

## Keys: no secrets in this repository

Set environment variables in Windows **User environment variables**, then fully restart the OpenCode desktop app and service. A newly changed variable can otherwise remain stale in an already-running app.

```jsonc
// Portable config examples; no real values.
{ "websearch": { "provider": "firecrawl" } }
{ "mcp": { "servers": { "example": { "type": "remote", "url": "https://example.com/mcp", "headers": { "Authorization": "Bearer {env:EXAMPLE_API_KEY}" } } } } }
```

| Variable | Consumer |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek search/fetch plugin, if configured to read it. The currently installed local plugin uses an inline key instead; move it to user-local secret storage before changing this behavior. |
| `FIRECRAWL_API_KEY` | Native OpenCode websearch provider. |
| `EXA_API_KEY`, `TAVILY_API_KEY`, `PARALLEL_API_KEY`, `TINYFISH_API_KEY` | Other native search providers. |
| `TREG_API_KEY` | Use for your own Treg configuration, if supported by that service; keep team tokens in user-local config. |
| `GEMINI_API_KEY` or `GOOGLE_API_KEY` | Optional Graphify semantic extraction; code-only graphs need no key. |
| `HEADROOM_PROXY_URL` | Optional Headroom proxy, normally `http://127.0.0.1:8787`. No model key belongs here. |

Jev/Laya decision settings belong in the user-local Jev MCP configuration. This machine's Jev server runs from `~/Documents/browseruse/jev_mcp.py`; inspect its CLI/config documentation for supported variables. Do not put Jev credentials in `routing.json`. Laya is a local deterministic engine and needs no model key; Jev live-browser access may need separate local configuration. There is no global `JEV_API_KEY` setting documented in OpenCode itself.

## Headroom, optional

The switch expects the official `headroom-opencode` package next to the global plugin. Install its dependencies in the isolated global config environment, not in a project:

```powershell
npm install --prefix "$env:USERPROFILE\.config\opencode" headroom-opencode
uv tool install --python 3.13 "headroom-ai[all]"
headroom proxy --port 8787
```

Then set `"headroom": true` and restart the service. Run `headroom doctor` to verify routing. Headroom is useful on long, output-heavy sessions; already-dense or short work may not benefit. Its vendor's benchmark numbers are not measurements from this machine. The proxy must be running before model traffic can use it.

The plugin and proxy are reversible: set `headroom` to `false` and restart. No `headroom wrap` changes are required for the native plugin path.

## Audit result: 2026-10-27

Verified on OpenCode v2.0.32:

- Globally connected: DeepSeek tools, Jev, Context7, Obsidian, Tokensave, Treg, Foreman, OpenCode Console.
- REA is configured but disabled. Enable it only for RE work.
- Native search was set to `random`; one actual request returned HTTP 402. DeepSeek search/fetch worked independently.
- Graphify CLI was installed. `graphify install --platform opencode` installed its global skill; the legacy per-project hook was replaced by this V2 router.
- Subagent routing is instructed globally, not enforced at runtime. Concurrent file ownership is still required.
- Headroom was not installed before this setup; it stays opt-in.
- `~/.config/opencode/opencode.json` and `.jsonc` both exist and merge. This project also has its own config, which overrides global agent/MCP definitions. Publishing this project as-is does not reproduce the full personal global setup.

User-local configs currently contain hard-coded credentials. They are not copied into this repository. Rotate any exposed credential and replace it with `{env:VARIABLE_NAME}` or user-local secret storage before sharing that configuration.
