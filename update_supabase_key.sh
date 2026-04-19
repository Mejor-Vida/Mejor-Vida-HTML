#!/bin/bash
# Run this from the Mejor-Vida-HTML directory after the service_role JWT is in your clipboard.
# Usage: bash update_supabase_key.sh

KEY=$(pbpaste)
if [[ ${#KEY} -lt 100 ]]; then
  echo "❌ Clipboard doesn't look like a JWT (too short). Copy the service_role key first, then re-run."
  exit 1
fi
if [[ "$KEY" != eyJ* ]]; then
  echo "❌ Clipboard doesn't look like a JWT (should start with eyJ). Copy the service_role key first, then re-run."
  exit 1
fi
export KEY
python3 - <<'PYEOF'
import re, os
key = os.environ['KEY']
path = '.env.local'
content = open(path).read()
updated = re.sub(r'(?m)^SUPABASE_SERVICE_ROLE_KEY=.*', f'SUPABASE_SERVICE_ROLE_KEY={key}', content)
open(path, 'w').write(updated)
print('✅ SUPABASE_SERVICE_ROLE_KEY updated in .env.local')
PYEOF
rm -- "$0"
echo "🗑️  Script deleted."
