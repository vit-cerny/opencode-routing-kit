#Requires -Version 5.1
# 1-click installer (Windows). No keys. Backs up existing config.
param([switch]$IncludeREA)
$ErrorActionPreference = 'Stop'
$Cfg = "$env:USERPROFILE\.config\opencode"
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if (Test-Path "$Cfg\opencode.jsonc") { Copy-Item "$Cfg\opencode.jsonc" "$Cfg\opencode.jsonc.bak.$Stamp" }
if (Test-Path "$Cfg\AGENTS.md") { Copy-Item "$Cfg\AGENTS.md" "$Cfg\AGENTS.md.bak.$Stamp" }
Copy-Item "$Here\opencode.jsonc" "$Cfg\opencode.jsonc" -Force
New-Item -ItemType Directory -Force "$Cfg\agents", "$Cfg\skills\jev-routing", "$Cfg\plugins" | Out-Null
Copy-Item "$Here\agents\*.md" "$Cfg\agents\" -Force
Copy-Item "$Here\skills\jev-routing\SKILL.md" "$Cfg\skills\jev-routing\SKILL.md" -Force
New-Item -ItemType Directory -Force "$Cfg\skills\debate" | Out-Null
Copy-Item "$Here\skills\debate\SKILL.md" "$Cfg\skills\debate\SKILL.md" -Force
Copy-Item "$Here\plugins\rtk.ts" "$Cfg\plugins\rtk.ts" -Force
Copy-Item "$Here\plugins\routing.ts" "$Cfg\plugins\routing.ts" -Force
if (-not (Test-Path "$Cfg\routing.json")) { Copy-Item "$Here\routing.json" "$Cfg\routing.json" }
Copy-Item "$Here\ROUTING.md" "$Cfg\ROUTING.md" -Force
node "$Here\scripts\register-routing.mjs" "$Cfg\opencode.jsonc"
if (Get-Command rtk -ErrorAction SilentlyContinue) { rtk init -g --opencode --auto-patch }
else { Write-Host 'rtk binary missing - install rtk, then run: rtk init -g --opencode' }
if ($IncludeREA) { npx -y rea-agents@latest setup }
Write-Host "Done. Restart opencode. Backup suffix: $Stamp"
