import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import test from "node:test"

test("switch toggles a feature and preserves others", () => {
  const dir = mkdtempSync("/tmp/opencode-switch-")
  const config = join(dir, "routing.json")
  writeFileSync(config, '{"search":true,"headroom":false}')
  const result = spawnSync("node", ["scripts/switch.mjs", "headroom", "on", "--config", config], { encoding: "utf8" })
  assert.equal(result.status, 0)
  const settings = JSON.parse(readFileSync(config, "utf8"))
  assert.equal(settings.search, true)
  assert.equal(settings.headroom, true)
  rmSync(dir, { recursive: true })
})
