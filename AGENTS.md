# AGENTS.md (project overlay - pairs with the lean global config)

- Prompter first: vague request -> `prompter` sharpens to Brief + route table.
- Jev before LLM: deterministic choice/score/yes-no -> `laya_ask`; live pages -> `jev_search`. No prose guessing.
- Background by default: `explore`, `docs`, `tests`, builds/lint run as `subagent(background=true)` on the free model. Foreground does only the blocking step.
- Skills load on demand (`skill` tool). MCPs are always injected: keep only `jev` + `context7` enabled. `rea` stays OFF unless reverse-engineering a binary/app: `opencode mcp list`, enable, restart, disable after.
- Shell output goes through `rtk` (plugin rewrites `bash`/`shell` automatically). Raw dumps: `rtk pipe`, recall elided output with `rtk recall`.
- Memory: read `MEMORY.md` at session start when the task spans sessions. Never paste secrets.
- Multi-window: run `opencode` in 2 terminals (or `opencode pair` + browser) to watch background subagents live in the TUI. `opencode session list` shows the rest.
- Web research always-on (`web-research` skill): if unsure, search the whole internet first - native `websearch`+`webfetch`, `gh search repos` for similar code, Context7 for library docs, `webfetch https://r.jina.ai/<URL>` for single-page markdown, `jev_search` when blocked. Planners must websearch BEFORE writing PLAN.md. Never guess what the internet knows.
