import { Plugin } from "@opencode/plugin"
import { existsSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

export const FEATURES = [
  "core", "skills", "search", "brain", "graphify", "tokensave",
  "parallel", "decisions", "mcp", "headroom",
] as const

export type Feature = (typeof FEATURES)[number]
export type Routing = Record<Feature, boolean>

const defaults = Object.fromEntries(FEATURES.map((key) => [key, key !== "headroom"])) as Routing

const prompts: Record<Exclude<Feature, "core" | "headroom">, string> = {
  skills: "Skills: load only the one relevant skill. Ponytail is always active; use its full body only when needed.",
  search: "Live web: deepseek.search, then deepseek.fetch for a known URL. Fallback: native websearch/webfetch. Firecrawl is a native provider, not DeepSeek. Agent Reach is a CLI fallback. Docs: context7. JS/login pages: jev.jev_search. Bulk/social data: treg.",
  brain: "Prior work: bounded second-brain search before code/build/debug tasks; read only the relevant section. Jev searches the live web, not the local brain.",
  graphify: "Code context: if graphify-out/graph.json exists, run graphify query with a budget before broad reads. Build it only for multi-file work; otherwise use focused search.",
  tokensave: "Code context: use tokensave_context/tokensave_search before broad source reads when the project is indexed; disclose a stale or missing index.",
  parallel: "Agents: run independent research/tests/review in parallel background subagents. Do not let concurrent agents edit the same files. Small tasks need no subagent.",
  decisions: "Decisions: jev.laya_ask for typed choices over known state; jev.jev_search for live pages. Do not use either for code, prose, or explanations.",
  mcp: "MCP: use REA only for reverse engineering, then disable it. Keep unused servers disabled; tool catalogs and local processes cost resources.",
}

export function readRouting(directory = process.cwd(), env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): Routing {
  const files = [
    env.OPENCODE_ROUTING_CONFIG,
    join(directory, ".opencode", "routing.json"),
    join(homedir(), ".config", "opencode", "routing.json"),
  ].filter((file) => typeof file === "string" && file.length > 0) as string[]
  const file = files.find((candidate) => existsSync(candidate))
  if (!file) return { ...defaults }
  let values: Record<string, unknown>
  try {
    values = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>
  } catch {
    console.warn(`[routing] ignoring invalid routing file: ${file}`)
    return { ...defaults }
  }
  return Object.fromEntries(FEATURES.map((key) => [key, typeof values[key] === "boolean" ? values[key] : defaults[key]])) as Routing
}

export function routingPrompt(settings: Routing): string {
  if (!settings.core) return ""
  const lines = FEATURES.filter((key) => key !== "core" && key !== "headroom" && settings[key])
    .map((key) => prompts[key as keyof typeof prompts])
  return lines.length ? `TOOL ROUTING (use only when relevant; never call every tool):\n${lines.join("\n")}` : ""
}

async function loadHeadroom(ctx: any, enabled: boolean) {
  if (!enabled) return
  try {
    const { default: plugin } = await import("headroom-opencode")
    return await plugin.setup(ctx)
  } catch (error) {
    console.warn(`[routing] Headroom unavailable; continuing without compression: ${String(error)}`)
  }
}

export default Plugin.define({
  id: "routing",
  async setup(ctx) {
    const directory = ctx.location.project?.canonical ?? ctx.location.directory ?? process.cwd()
    const settings = readRouting(directory, ctx.options?.routing === false ? { OPENCODE_ROUTING_CONFIG: "" } : process.env)
    const pending = new Map<string, string>()
    const prompt = routingPrompt(settings)

    if (prompt) {
      await ctx.session.hook("prompt", (event) => {
        pending.set(event.sessionID, prompt)
      })
      await ctx.session.hook("context", (event) => {
        const text = pending.get(event.sessionID)
        if (!text) return
        event.system.push({ type: "text", text })
        pending.delete(event.sessionID)
      })
    }

    return await loadHeadroom(ctx, settings.headroom)
  },
})
