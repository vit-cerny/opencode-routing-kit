import { Plugin } from "@opencode/plugin"
import { $ } from "bun"

// RTK OpenCode plugin - rewrites shell commands to use rtk for token savings.
// Requires: rtk >= 0.23.0 in PATH.
//
// Thin delegating plugin: rewrite rules live in `rtk rewrite`
// (Rust registry). To change rules, edit the registry - not this file.

export default Plugin.define({
  id: "rtk",
  async setup(ctx) {
    try {
      await $`which rtk`.quiet()
    } catch {
      // ponytail: no rtk binary, skip hook so tools pass through unchanged
      console.warn("[rtk] rtk binary not found in PATH - plugin disabled")
      return
    }

    await ctx.tool.hook("execute.before", async (event) => {
      const tool = String(event.tool ?? "").toLowerCase()
      if (tool !== "bash" && tool !== "shell") return
      const input = event.input as Record<string, unknown> | undefined
      const command = input?.command
      if (typeof command !== "string" || !command) return

      try {
        const result = await $`rtk rewrite ${command}`.quiet().nothrow()
        const rewritten = String(result.stdout).trim()
        if (rewritten && rewritten !== command) {
          input.command = rewritten
        }
      } catch {
        // rtk rewrite failed - pass through unchanged
      }
    })
  },
})
