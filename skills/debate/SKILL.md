---
name: debate
description: Coder vs critic vs fixer argue loop. Use for any task that needs implementation + review. Trigger: debate, argue, coder vs critic.
---

# Debate (coder -> critic -> fixer, max 2 rounds)

Primary orchestrates. No direct edits by primary; only subagents touch files.

1. `coder`: implement smallest diff for the task. Report files changed + check command.
2. `critic`: read-only review of coder diff. Output MUST list: load-bearing bugs (if none, say NO EVIDENCE of bugs), then nits. Never fix.
3. `fixer`: apply critic load-bearing fixes only. Re-run check command. Report pass/fail.
4. If critic finds new load-bearing bugs after fixer, repeat once (max 2 rounds). Then primary merges and stops.
5. State file: `.opencode/DEBATE.md` (task, round, verdict). T3 Code shows the parent session; child sessions visible via session_child_first.

Invoke: `@coder <task>` then `@critic review <files>` then `@fixer apply <bugs>`.
From T3 Code type: `debate: <task>` (T3 Code forwards to one opencode session, primary fans out).
