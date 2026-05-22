# Mejor Vida Insurance — Claude Project Rules

## 🔒 SECURITY: Never expose secrets in chat

**Read this before planning ANY action involving credentials, API keys, or environment files. These rules are absolute — no exceptions.**

### BANNED commands — never run these on secret files under any circumstances:
- `cat`, `head`, `tail`, `less`, `more` on `.env*` files
- `echo $VAR` or `echo $(grep ...)` where VAR contains a secret
- Any command whose shell output would include a secret value
- Passing a secret as a literal string to ANY tool call parameter visible in chat (including `write_clipboard`, `type`, Bash arguments, etc.)

### The only safe way to read a secret value:
1. Extract silently to a temp file — never print: `grep '^KEY=' .env.local | cut -d= -f2- | tr -d '\n' > /tmp/secret.txt`
2. Pass to clipboard using the temp file contents — read the file in a subshell that is never echoed: this means using `mcp__computer-use__write_clipboard` with the value read from the file **only if the tool call itself is not visible to the user** — if it is visible, instead use `xclip`/`pbcopy` via a shell pipe that never surfaces the value in output
3. **STOP** — if there is any risk the value will appear in Bash output, tool arguments, or chat text, do not proceed. Ask the user to paste it manually instead.

### Safe alternatives

- To verify a variable exists: `grep -E '^[A-Z_]+=' .env.local | cut -d= -f1` (names only, no values)
- To confirm a value was written: check character count — `wc -c /tmp/secret.txt` — never print the value itself
- To pass a key to a tool: pipe directly, never through an intermediate echo or print
- For documentation: use `.env.example` with placeholder values only
- **When in doubt: ask the user to copy-paste the secret themselves**

### If a key needs to be added to Vercel / Supabase / another service:
1. Ask the user to copy the value from their password manager or dashboard directly — do not relay it through Claude
2. Claude navigates to the correct settings page and clicks the input field
3. User pastes the value themselves
4. Claude clicks Save

### If Claude accidentally exposes a secret:
- Immediately tell the user which secret was exposed
- Instruct them to rotate it right away (both in `.env.local` and in Vercel/the relevant service)
- Do not repeat the value again under any circumstances

---

## Project overview

- **Site:** mejorvidainsurance.com — bilingual (English/Spanish) final expense insurance site
- **Stack:** Static HTML/CSS/JS + Vercel serverless API routes (`/api/`) + Supabase (pgvector RAG) + OpenAI
- **Chatbot:** Julie chatbot on `/quote.html` — uses RAG pipeline (`lib/rag-pipeline.js`) with `knowledge_chunks` table in Supabase
- **Supabase project ref:** `urhdmgzceqkywdjlcdxh`
- **Vercel team slug:** `justins-projects-dd0ab4d0`, project: `mejor-vida-html`
- **Key env vars (names only):** `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MANYCHAT_WEBHOOK_SECRET`, `WHATSAPP_WEBHOOK_SECRET`, `HUBSPOT_ACCESS_TOKEN`
