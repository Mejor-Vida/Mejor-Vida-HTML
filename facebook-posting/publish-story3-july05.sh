#!/usr/bin/env bash
# Publish July 5 weekly FB post — Story 3 GLP-1 underwriting (story-3 image) + Spanish caption; first comment via Graph API.
set -euo pipefail
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-story3-weekly-2026-07-05.json \
  --local-image img/opt/blog-generated/weekly-insurance-update-2026-07-05/story-3.png \
  "$@"
