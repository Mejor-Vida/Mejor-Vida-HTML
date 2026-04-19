#!/bin/bash
# Run this from the Mejor-Vida-HTML directory after copying the new ElevenLabs key to clipboard.
# Usage: bash update_elevenlabs_key.sh

KEY=$(pbpaste)
if [[ $KEY != sk_* ]]; then
  echo "❌ Clipboard doesn't look like an ElevenLabs key (expected sk_...). Copy the key first, then re-run."
  exit 1
fi
export KEY
python3 - <<'PYEOF'
import re, os
key = os.environ['KEY']
path = '.env.local'
content = open(path).read()
updated = re.sub(r'(?m)^ELEVENLABS_API_KEY=.*', f'ELEVENLABS_API_KEY={key}', content)
open(path, 'w').write(updated)
print('✅ ELEVENLABS_API_KEY updated in .env.local')
PYEOF
rm -- "$0"
echo "🗑️  Script deleted."
