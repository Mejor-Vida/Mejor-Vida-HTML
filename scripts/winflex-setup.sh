#!/bin/bash
# One-time WinFlex harvest setup. Run from anywhere:
#   bash "/Users/mejorvidainsurance/Desktop/mejor-vida-html /Mejor-Vida-HTML/scripts/winflex-setup.sh"
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm install
npx playwright install chromium
echo ""
echo "Setup complete. Next commands (run one at a time):"
echo "  npm run harvest:winflex -- login"
echo "  npm run harvest:winflex -- run --pilot"
echo "  npm run harvest:winflex -- merge"
