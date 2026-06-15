#!/usr/bin/env bash
# Publish June 14 weekly FB post — Story 4 carrier ratings / private credit (story-4 image) + Spanish caption; first comment via Make.com.
set -euo pipefail
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-story4-weekly-2026-06-14.json \
  --local-image img/opt/blog-generated/weekly-insurance-update-2026-06-14/story-4.png \
  "$@"
