#!/usr/bin/env bash
# Harvests the Nebraska fully underwritten grid for the remaining licensed
# states. Runs one class at a time so a mid-run failure only costs that class,
# and the shared harvest JSON now keys on state so nothing overwrites Nebraska.
set -u

cd "$(dirname "$0")/.." || exit 1

STATES="${STATES:-KS CO NV}"
H="node scripts/harvest-integrity-term-quotes.mjs"

CLASS_LOG=$(mktemp -t mvi-harvest-class)
trap 'rm -f "$CLASS_LOG"' EXIT

run() {
  local label="$1"
  shift
  echo ""
  echo "===== $label ====="
  date "+start %H:%M:%S"
  # Stream rather than buffer: a piped tail hides all progress until the class
  # finishes, which makes a stall indistinguishable from slow work.
  # shellcheck disable=SC2086
  $H "$@" --max 4000 > "$CLASS_LOG" 2>&1
  grep -E '^\s*\[[0-9]+\]|^Wrote|MISMATCH|skipping|logged out' "$CLASS_LOG"
  date "+end   %H:%M:%S"

  # A dropped Integrity login fails every remaining cell identically. Stop the
  # whole run so it does not spend hours reporting empty sessions as success.
  if grep -qi 'logged out' "$CLASS_LOG"; then
    echo ""
    echo "HARVEST-ABORTED-LOGGED-OUT after: $label"
    exit 2
  fi
}

for ST in $STATES; do
  echo ""
  echo "##################### STATE $ST #####################"

  run "$ST PP non-tobacco" --state "$ST" --health PP --tobacco false \
    --ages 20,25,30,35,40,45,50,55,60,65,70,75 --terms 10,20,30 \
    --faces 100000,250000,500000,750000,1000000,2000000,3000000

  run "$ST P non-tobacco" --state "$ST" --health P --tobacco false \
    --ages 25,30,35,40,45,50,55,60,65 --terms 10,20,30 \
    --faces 100000,250000,500000,1000000

  run "$ST S non-tobacco" --state "$ST" --health S --tobacco false \
    --ages 25,30,35,40,45,50,55,60,65,70,75 --terms 10,20,30 \
    --faces 100000,250000,500000,1000000

  run "$ST PP tobacco" --state "$ST" --health PP --tobacco true \
    --ages 25,30,35,40,45,50,55,60,65 --terms 10,20,30 \
    --faces 100000,250000,500000,1000000

  run "$ST S tobacco" --state "$ST" --health S --tobacco true \
    --ages 25,30,35,40,45,50,55,60,65 --terms 10,20,30 \
    --faces 100000,250000,500000,1000000

  echo "##################### $ST DONE #####################"
done

echo ""
echo "ALL-STATES-COMPLETE"
