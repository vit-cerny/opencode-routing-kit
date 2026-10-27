import assert from "node:assert/strict"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { pathToFileURL } from "node:url"
import { FEATURES, readRouting, routingPrompt } from "../plugins/routing.ts"

const source = readFileSync(new URL("../plugins/routing.ts", import.meta.url), "utf8")

test("switches select only relevant routing rules", () => {
  const all = readRouting("missing", {})
  assert.equal(all.headroom, false)
  assert.deepEqual(Object.keys(all), FEATURES)
  assert.match(routingPrompt(all, true), /deepseek\.search/)
  assert.match(routingPrompt(all), /graphify-out\/graph\.json/)
  assert.match(routingPrompt(all), /graphify query/)
  assert.equal(routingPrompt({ ...all, core: false }, true), "")
  assert.doesNotMatch(routingPrompt({ ...all, search: false, decisions: false }), /deepseek|laya/)
})

test("project switches override global settings", () => {
  const directory = mkdtempSync(join(tmpdir(), "opencode-routing-"))
  const project = join(directory, ".opencode", "routing.json")
  mkdirSync(join(directory, ".opencode"))
  writeFileSync(project, '{"search":false,"headroom":true}')
  const settings = readRouting(directory, {})
  assert.equal(settings.search, false)
  assert.equal(settings.headroom, true)
  assert.equal(settings.brain, true)
})

test("Headroom is dynamically loaded and disabled by default", () => {
  assert.match(source, /if \(!enabled\) return/)
  assert.match(source, /import\("headroom-opencode"\)/)
  assert.doesNotMatch(source, /from "headroom-opencode"/)
})

test("delivered files contain no hard-coded credentials", () => {
  for (const file of ["plugins/routing.ts", "routing.json", "opencode.jsonc", "ROUTING.md"]) {
    const text = readFileSync(file, "utf8")
    assert.doesNotMatch(text, /sk-[A-Za-z0-9]{16,}|Bearer [A-Za-z0-9._-]{30,}/)
  }
})

test("installed global router matches delivered router", () => {
  const home = process.env.USERPROFILE || process.env.HOME
  if (!home) return
  const installed = join(home, ".config", "opencode", "plugins", "routing.ts")
  if (!existsSync(installed)) return
  assert.equal(readFileSync(installed, "utf8"), source)
})
