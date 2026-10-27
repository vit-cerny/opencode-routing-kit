import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const FEATURES = ["core","skills","search","brain","graphify","tokensave","parallel","decisions","mcp","headroom"]

function stripJsonComments(text) {
  return text.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
}

function parseValue(value) {
  if (value === "on" || value === "true") return true
  if (value === "off" || value === "false") return false
  throw new Error(`Value must be on/off/true/false, got: ${value}`)
}

function configPath() {
  const args = process.argv.slice(2)
  const project = args.includes("--project") ? args[args.indexOf("--project") + 1] : null
  const explicit = args.includes("--config") ? args[args.indexOf("--config") + 1] : null
  if (explicit) return explicit
  if (project) return join(project, ".opencode", "routing.json")
  return join(homedir(), ".config", "opencode", "routing.json")
}

const args = process.argv.slice(2)
if (args.includes("--list")) {
  console.log(FEATURES.join("\n"))
  process.exit(0)
}

const feature = args[0]
const value = args[1]
if (!feature || !value || !FEATURES.includes(feature)) {
  console.error("Usage: node scripts/switch.mjs <feature> <on|off<|end|>true|false> [--global|--project <dir>|--config <file>]")
  process.exit(1)
}

const path = configPath()
let settings = {}
try {
  settings = JSON.parse(stripJsonComments(readFileSync(path, "utf8")))
} catch (error) {
  if (!error?.code || error.code !== "ENOENT") throw error
}
if (path.endsWith(".json") && path.includes(".opencode")) mkdirSync(join(path, ".."), { recursive: true })
settings[feature] = parseValue(value)
writeFileSync(path, `${JSON.stringify(settings, null, 2)}\n`)
console.log(`${path}: ${feature}=${settings[feature]}`)
console.log("Restart OpenCode service for the change to take effect.")
