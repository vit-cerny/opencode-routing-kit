# Opencode-better: lean token-efficient OpenCode preset

No keys in this repo. Providers stay user-local. Run `install.ps1` (Win) or `sh install.sh` (Mac/Linux).

## Global tool routing

See [ROUTING.md](ROUTING.md) for the audit, per-feature on/off switches, search order, key locations, and optional Headroom setup. `routing.json` controls search, skills, second brain, Graphify, Tokensave, parallel agents, Jev/Laya decisions, and REA guidance. It contains no keys. Headroom defaults to OFF.

## What you get

- `plugins/routing.ts` + `routing.json`: compact V2 routing hints, applied once per prompt to primary and child agents; Headroom loads only when enabled.
- `scripts/switch.mjs`: on/off routing features with `node scripts/switch.mjs <feature> <on|off>`.
- `opencode.jsonc`: free models for all subagents, `tool_output` 60 lines/4KB, compaction auto (12k keep), `git push` asks, `rm -rf` denied. Only 2 MCPs enabled: `jev` (browser + local `laya_ask` decisions, ~0 LLM tokens) and `context7` (remote docs, 0 RAM). `rea` present but OFF - enable only for reverse-engineering, disable after. NOTE: the `jev` command must point at the Python that has the `mcp` package + jev deps (here: the browseruse `.venv` interpreter, NOT bare `python`) - otherwise the server exits on import and shows as failed in `opencode mcp list`. Adjust the two paths to your machine.
- `agents/prompter.md`: sharpens vague prompts, routes Jev vs subagent vs primary.
- `skills/jev-routing/SKILL.md`: when to use Jev/Laya instead of LLM prose.
- `plugins/rtk.ts`: rewrites shell output through `rtk` (biggest shell-token saver). Requires `rtk init -g --opencode`.
- `MEMORY.md`: file memory (cheap, read on demand). Memory MCP stays OFF.
- `AGENTS.md`: project overlay (prompter-first, Jev-before-LLM, background-by-default).

## V2 features used

Hooks (`execute.before` via rtk plugin), lazy skills, compaction summaries, background subagents, `tool_output` caps, MCP on-demand.

## Watch agents live

Option A: two terminals, both `opencode` in the same directory. Option B: `opencode pair` + browser. Background subagents show as TUI tabs; `opencode session list` covers the rest.

## Goal loop that runs forever (`goal-runner.ps1`)

`/loop-goal` works inside a session; `goal-runner.ps1` keeps it going unattended - one `opencode run` wave per cycle until `GOAL.md` is done/blocked/paused or `.opencode/STOP-GOAL` exists:

```powershell
powershell -ExecutionPolicy Bypass -File goal-runner.ps1 -ProjectDir C:\proj -SessionId goal -PollSeconds 300
```

Survive reboots via Task Scheduler (runs the driver at logon):

```powershell
schtasks /create /tn opencode-goal /tr "powershell -ExecutionPolicy Bypass -File C:\path\to\goal-runner.ps1 -ProjectDir C:\proj" /sc onlogon
schtasks /delete /tn opencode-goal /f   # stop forever mode
```

Stop anytime: `/loop-goal-pause` in the session, `New-Item .opencode\STOP-GOAL`, or Ctrl+C the driver. `--auto` approves non-denied permissions; `rm -rf` stays denied by global config.

## REA (opt-in, heavy)

Default OFF (token/RAM heavy, needs Node 22+). Enable per task: `install.ps1 -IncludeREA` or `sh install.sh --include-rea`, restart, disable after.
