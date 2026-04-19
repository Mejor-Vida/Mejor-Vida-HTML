#!/bin/bash
# Run once from the Mejor-Vida-HTML folder in Cursor terminal.
# Reads OPENAI_API_KEY from clipboard, writes to .env.local, then deletes itself.
KEY=$(pbpaste)
if [[ $KEY != sk-proj-* ]]; then
  echo "❌ Clipboard doesn't look like an OpenAI key. Copy the key first, then re-run."
  exit 1
fi
export KEY
python3 - <<'PYEOF'
import re, os
key = os.environ['KEY']
path = '.env.local'
content = open(path).read()
updated = re.sub(r'(?m)^OPENAI_API_KEY=.*$', f'OPENAI_API_KEY={key}', content)
open(path, 'w').write(updated)
print('✅ OPENAI_API_KEY updated in .env.local')
PYEOF
rm -- "$0"
echo "🗑️  Script deleted."
