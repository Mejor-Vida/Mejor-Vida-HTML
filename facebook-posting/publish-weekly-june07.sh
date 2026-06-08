#!/usr/bin/env bash
# Publish June 7 weekly FB post — lost life insurance / NAIC locator (hero-es) + Spanish caption; first comment via Make.com.
set -euo pipefail
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-weekly-2026-06-07.json \
  --local-image img/blog-generated/weekly-insurance-update-2026-06-07/hero-es.png \
  "$@"
