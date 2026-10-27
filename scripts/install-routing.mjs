import { copyFileSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const target = join(homedir(), ".config", "opencode")
mkdirSync(join(target, "plugins"), { recursive: true })
for (const file of ["plugins/routing.ts", "routing.json", "ROUTING.md"]) {
  const destination = join(target, file)
  copyFileSync(join(root, file), destination)
  console.log(`installed ${destination}`)
}
console.log('Add "./plugins/routing.ts" to global plugins, then run: opencode service restart')
