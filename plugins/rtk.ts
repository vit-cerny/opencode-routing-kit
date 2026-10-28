import { Plugin } from "@opencode/plugin"
import { spawnSync } from "node:child_process"

// RTK OpenCode plugin — rewrites shell/bash commands through `rtk rewrite`.
// Requires rtk in PATH. RTK's own V1 hook is replaced by this V2 shape.
//
// `rtk rewrite` exits nonzero when no terminal hook is installed, but still
// prints a valid rewritten command on stdout. Read stdout instead of treating
// the exit status as failure.

export function rewriteCommand(command: string): string | null {
  const result = spawnSync("rtk", ["rewrite", command], {
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  })
  const rewritten = String(result.stdout ?? "").trim()
  if (!rewritten || rewritten === command || !rewritten.startsWith("rtk ")) return null
  return rewritten
}

export default Plugin.define({
  id: "rtk",
  async setup(ctx) {
    const version = spawnSync("rtk", ["--version"], { encoding: "utf8", timeout: 5000, windowsHide: true })
    if (version.status !== 0 && !version.stdout) {
      console.warn("[rtk] rtk binary not found in PATH — plugin disabled")
      return
    }

    await ctx.tool.hook("execute.before", (event) => {
      const tool = String(event.tool ?? "").toLowerCase()
      if (tool !== "bash" && tool !== "shell") return
      const input = event.input as { command?: unknown } | undefined
      if (!input || typeof input !== "object" || typeof input.command !== "string" || !input.command) return
      const rewritten = rewriteCommand(input.command)
      if (rewritten) input.command = rewritten
    })
  },
})
