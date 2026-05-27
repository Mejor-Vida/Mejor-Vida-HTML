#!/usr/bin/env bash
# Publish May 24 weekly FB post — pyramid infographic + Spanish caption; first comment via Make.com.
set -euo pipefail
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-weekly-2026-05-24.json \
  --local-image img/blog-generated/weekly-insurance-update-2026-05-24/hero-es.png \
  --no-first-comment \
  "$@"
