#!/usr/bin/env bash
# Publish June 21 weekly FB post — unclaimed life insurance / Death Master File (hero-es) + Spanish caption; first comment via Make.com.
set -euo pipefail
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-weekly-2026-06-21.json \
  --local-image img/blog-generated/weekly-insurance-update-2026-06-21/hero-es.png \
  "$@"
