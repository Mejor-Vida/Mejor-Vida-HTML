#!/usr/bin/env bash
# ManyChat-style POST tests. Usage:
#   export BASE_URL="https://your-deployment.vercel.app"
#   export MANYCHAT_WEBHOOK_SECRET="your_secret"
#   bash scripts/test-manychat-api.sh

set -euo pipefail
BASE_URL="${BASE_URL:?Set BASE_URL to your Vercel origin (no trailing slash)}"
SECRET="${MANYCHAT_WEBHOOK_SECRET:?Set MANYCHAT_WEBHOOK_SECRET}"

echo "== lead-capture =="
curl -sS -X POST "${BASE_URL}/api/lead-capture" \
  -H "Content-Type: application/json" \
  -H "X-App-Secret: ${SECRET}" \
  -d '{"first_name":"Test","phone":"+10000000000","email":"test@test.com","age":55,"sex":"Male","tobacco":false,"language":"English"}' | jq .

echo "== rag-answer =="
curl -sS -X POST "${BASE_URL}/api/rag-answer" \
  -H "Content-Type: application/json" \
  -H "X-App-Secret: ${SECRET}" \
  -d '{"question":"What is final expense insurance?","language":"English","phone":"+10000000000","flow_stage":"box_9"}' | jq .

echo "== dropoff-capture =="
curl -sS -X POST "${BASE_URL}/api/dropoff-capture" \
  -H "Content-Type: application/json" \
  -H "X-App-Secret: ${SECRET}" \
  -d '{"first_name":"Test","phone":"+10000000001","language":"English","drop_off_stage":"box_9"}' | jq .

echo "Done."
