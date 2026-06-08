#!/usr/bin/env bash
# Publish annuities FB post — Spanish hero + caption; first comment via Make.com.
set -euo pipefail
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-annuities-weekly-2026-05-17.json \
  --local-image img/blog-generated/weekly-insurance-update-2026-05-17/hero-es.png \
  "$@"
