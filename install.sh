#!/bin/sh
# 1-click installer (macOS/Linux). No keys. Backs up existing config.
set -eu
CFG="$HOME/.config/opencode"
HERE="$(dirname "$0")"
STAMP="$(date +%Y%m%d-%H%M%S)"
[ -f "$CFG/opencode.jsonc" ] && cp "$CFG/opencode.jsonc" "$CFG/opencode.jsonc.bak.$STAMP"
mkdir -p "$CFG/agents" "$CFG/skills/jev-routing" "$CFG/plugins"
sed 's/{ "routing": false }/{}/' "$HERE/opencode.jsonc" > "$CFG/opencode.jsonc"
cp "$HERE/agents/"*.md "$CFG/agents/"
cp "$HERE/skills/jev-routing/SKILL.md" "$CFG/skills/jev-routing/SKILL.md"
cp "$HERE/plugins/rtk.ts" "$CFG/plugins/rtk.ts"
cp "$HERE/plugins/routing.ts" "$CFG/plugins/routing.ts"
[ -f "$CFG/routing.json" ] || cp "$HERE/routing.json" "$CFG/routing.json"
cp "$HERE/ROUTING.md" "$CFG/ROUTING.md"
node "$HERE/scripts/register-routing.mjs" "$CFG/opencode.jsonc"
if command -v rtk >/dev/null 2>&1; then rtk init -g --opencode --auto-patch; else echo 'rtk missing - install rtk, then: rtk init -g --opencode'; fi
if [ "${1:-}" = "--include-rea" ]; then npx -y rea-agents@latest setup; fi
echo "Done. Restart opencode. Backup suffix: $STAMP"
