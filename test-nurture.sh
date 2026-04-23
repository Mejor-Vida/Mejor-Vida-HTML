#!/bin/bash
SECRET=$(grep '^CRON_SECRET=' .env.local | cut -d= -f2- | tr -d '\n')
echo "→ Enrolling..."
curl -s "https://www.mejorvidainsurance.com/api/nurture-enroll-cron" \
  -H "Authorization: Bearer $SECRET" | jq .
echo ""
echo "→ Sending..."
curl -s "https://www.mejorvidainsurance.com/api/nurture-cron" \
  -H "Authorization: Bearer $SECRET" | jq .
