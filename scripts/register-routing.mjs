import { copyFileSync, readFileSync, writeFileSync } from "node:fs"

const config = process.argv[2]
if (!config) throw new Error("Usage: node scripts/register-routing.mjs <opencode.jsonc>")

function uncomment(text) {
  return text.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
}

const parsed = JSON.parse(uncomment(readFileSync(config, "utf8")))
const plugins = Array.isArray(parsed.plugins) ? parsed.plugins : []
const entry = "./plugins/routing.ts"
const duplicate = plugins.some((plugin) => plugin === entry || (typeof plugin === "object" && plugin?.package === entry))
if (!duplicate) {
  plugins.push(entry)
  const start = readFileSync(config, "utf8").replace('{ "routing": false }', '{}')
  const match = start.match(/^(\s*)"plugins"\s*:\s*\[/m)
  if (match?.index === undefined) throw new Error('Add "plugins": ["./plugins/routing.ts"] manually')
  const insertion = match.index + match[0].length
  const prefix = match ? `\n${match[1]}  ${JSON.stringify(entry)},` : `\n  "plugins": [${JSON.stringify(entry)}],`
  const result = start.slice(0, insertion) + prefix + start.slice(insertion)
  const backup = `${config}.bak.${new Date().toISOString().replace(/[:.]/g, "-")}`
  copyFileSync(config, backup)
  writeFileSync(config, result)
  JSON.parse(uncomment(result))
  console.log(`registered ${entry}; backup: ${backup}`)
} else {
  console.log(`${entry} already registered`)
}
