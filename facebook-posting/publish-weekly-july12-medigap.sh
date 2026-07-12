#!/usr/bin/env bash
# Publish July 12 weekly FB post — Medigap premium surge hero graphic + Spanish caption; first comment via Graph API.
set -euo pipefail
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-weekly-2026-07-12-medigap.json \
  --local-image img/opt/blog-generated/weekly-insurance-update-2026-07-12/hero-es.png \
  "$@"
