#!/usr/bin/env bash
# Publish June 28 weekly FB post — DOJ healthcare fraud takedown (story-4) + Spanish caption; first comment via Graph API (immediate).
set -euo pipefail
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-weekly-2026-06-28.json \
  --local-image img/blog-generated/weekly-insurance-update-2026-06-28/story-4.png \
  "$@"
