#!/usr/bin/env bash
# Publish Story 4 (final expense) FB post — main photo + caption only.
# First comment (link + WhatsApp) is done by Make.com from FB/post-package.json → first_comment.
# Graph: FACEBOOK_PAGE_ACCESS_TOKEN + FACEBOOK_PAGE_ID in .env.local (or config/settings.json).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$(dirname "$0")"
exec python3 main.py \
  --from-json FB/post-package-story4-weekly-2026-05-10.json \
  --local-image img/blog-generated/weekly-insurance-update-2026-05-10/fb-post-hero.png \
  --no-first-comment \
  "$@"
