---
name: Web research
description: Ground any external fact, library API, error, or plan in live web sources before designing. Use when planning a project, choosing a dependency, or stating anything version-sensitive.
---

# Web research (cheapest ladder first, stop when grounded)

1. Native `websearch` for facts/threads; `webfetch` the best 1-3 hits (markdown, token-lean). Never claim a page you could not load.
2. Library/framework API, setup, migration: `context7` first (version-pinned docs), not blogs.
3. Similar code/patterns: `gh search repos` + `gh api` (needs `gh` on PATH; auth via `gh auth login`, never tokens in files).
4. Blocked/JS-only page or single-source scrape: `webfetch https://r.jina.ai/<URL>` (free URL-to-markdown, no key, no MCP). Needs-JS/clicks/forms: `jev_search`.
5. Planners: steps 1-2 are MANDATORY before writing PLAN.md. Cite sources inline (URL + what it proved). Memory is not a source.

Escalation only, never default: Tavily/Exa/Firecrawl MCPs (need paid keys, inject tools every turn). Keep them disabled unless keys exist AND volume justifies it.
