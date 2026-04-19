#!/bin/bash
# Run this from the Mejor-Vida-HTML directory after copying the new ManyChat webhook secret to clipboard.
# Usage: bash update_manychat_key.sh

KEY=$(pbpaste)
if [[ ${#KEY} -lt 20 ]]; then
  echo "❌ Clipboard doesn't look like a webhook secret (too short). Copy the key first, then re-run."
  exit 1
fi
export KEY
python3 - <<'PYEOF'
import re, os
key = os.environ['KEY']
path = '.env.local'
content = open(path).read()
updated = re.sub(r'(?m)^MANYCHAT_WEBHOOK_SECRET=.*', f'MANYCHAT_WEBHOOK_SECRET={key}', content)
open(path, 'w').write(updated)
print('✅ MANYCHAT_WEBHOOK_SECRET updated in .env.local')
PYEOF
rm -- "$0"
echo "🗑️  Script deleted."
