#!/usr/bin/env bash
# deploy-edgeclaw.sh — One-click EdgeClaw deployment
#
# Usage:
#   ./scripts/deploy-edgeclaw.sh            # build + start
#   ./scripts/deploy-edgeclaw.sh --no-build # skip build (already built)
#
# First run auto-generates ~/.edgeclaw/openclaw.json with full config
# skeleton. Fill in API keys via the config file or ClawXRouter Dashboard.
#
# Environment variables (all optional):
#   OPENCLAW_STATE_DIR   State directory, default: ~/.edgeclaw
#   EDGECLAW_API_KEY     Pre-fill API keys in generated config
#   EDGECLAW_BASE_URL    Override provider base URL
#   EDGECLAW_PROXY_URL   Override proxy URL for models needing fix-proxy

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EDGECLAW_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# EdgeClaw defaults to ~/.edgeclaw via paths.ts; only export if user overrides.
if [[ -n "${OPENCLAW_STATE_DIR:-}" ]]; then
  export OPENCLAW_STATE_DIR
fi

DO_BUILD=true
for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=false ;;
  esac
done

C='\033[36m' G='\033[32m' Y='\033[33m' B='\033[1m' D='\033[2m' N='\033[0m'
info()  { echo -e "${C}[EdgeClaw]${N} $*"; }
ok()    { echo -e "${G}[EdgeClaw]${N} $*"; }

# ── Build ──
if $DO_BUILD; then
  info "pnpm install..."
  (cd "$EDGECLAW_ROOT" && pnpm install --frozen-lockfile 2>/dev/null || pnpm install)
  info "pnpm build..."
  (cd "$EDGECLAW_ROOT" && pnpm build)
  ok "Build complete"
fi

# ── State dir (for display only; paths.ts handles the actual default) ──
STATE_DISPLAY="${OPENCLAW_STATE_DIR:-$HOME/.edgeclaw}"

# ── Start ──
echo ""
echo -e "${C}╔══════════════════════════════════════════════════════════╗${N}"
echo -e "${C}║${N}  ${G}${B}EdgeClaw${N} starting...                                  ${C}║${N}"
echo -e "${C}║${N}  ${Y}Config${N}  → ${B}$STATE_DISPLAY/openclaw.json${N}"
echo -e "${C}║${N}  ${Y}Gateway${N} → ${B}http://127.0.0.1:18790${N}"
echo -e "${C}║${N}  ${D}ClawXRouter (token-saver) + ClawXMemory bundled${N}         ${C}║${N}"
echo -e "${C}╚══════════════════════════════════════════════════════════╝${N}"
echo ""

if [[ ! -f "$STATE_DISPLAY/openclaw.json" ]]; then
  info "First run — config will be auto-generated."
  info "Fill in API keys in ${B}$STATE_DISPLAY/openclaw.json${N} or via Dashboard."
fi

export EDGECLAW_API_KEY="${EDGECLAW_API_KEY:-}"
export EDGECLAW_BASE_URL="${EDGECLAW_BASE_URL:-}"
export EDGECLAW_PROXY_URL="${EDGECLAW_PROXY_URL:-}"
exec node "$EDGECLAW_ROOT/openclaw.mjs" gateway run
