#!/usr/bin/env bash
# Publish May 31 weekly FB post — ILIT castle image (hero-es) + Spanish caption; first comment via Make.com.
set -euo pipefail
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-weekly-2026-05-31.json \
  --local-image img/blog-generated/weekly-insurance-update-2026-05-31/hero-es.png \
  --no-first-comment \
  "$@"
