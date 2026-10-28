import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import test from "node:test"
import { rewriteCommand } from "../plugins/rtk.ts"

const available = spawnSync("rtk", ["--version"], { encoding: "utf8", windowsHide: true }).status === 0

test("RTK rewrites supported commands", { skip: !available }, () => {
  assert.equal(rewriteCommand("git status"), "rtk git status")
  assert.equal(rewriteCommand("npm test"), null)
})

test("RTK leaves an already rewritten command alone", { skip: !available }, () => {
  assert.equal(rewriteCommand("rtk git status"), null)
})
