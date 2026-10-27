import assert from "node:assert/strict"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const { default: plugin } = await import(pathToFileURL(join(process.cwd(), "plugins", "routing.ts")).href)
assert.equal(plugin.id, "routing")

const hooks = {}
const context = {
  location: { directory: process.cwd() },
  options: {},
  session: {
    async hook(name, callback) { hooks[name] = callback },
  },
}
await plugin.setup(context)
assert.deepEqual(Object.keys(hooks).sort(), ["context", "prompt"])
hooks.prompt({ sessionID: "test" })
const event = { sessionID: "test", system: [] }
hooks.context(event)
assert.match(event.system[0].text, /deepseek\.search/)
assert.match(event.system[0].text, /second-brain/)
hooks.context(event)
assert.equal(event.system.length, 1, "hint is delivered only once per prompt")
console.log("PASS: plugin loads, registers prompt/context hooks, injects once")
