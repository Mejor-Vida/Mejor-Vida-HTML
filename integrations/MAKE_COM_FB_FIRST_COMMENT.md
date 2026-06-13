# Make.com — Facebook first comment

## Two scenarios — only one should be ON

| Scenario | Status | Role |
|----------|--------|------|
| **Cursor FB Custom Comment** | **Active** | Receives webhook from `facebook-posting/main.py`; posts custom `first_comment` after **5 min** (300s — Make sleep max) |
| **Facebook Auto-Comment on New Posts** | **Inactive** | Legacy: hardcoded Spanish comment on every new Page post — **leave off** or you get duplicate comments |

Webhook URL (Cursor scenario): `https://hook.us2.make.com/ytukuvzqkvjjz33ief8hi17ruo2df3vi`

After `facebook-posting/main.py` publishes to Facebook, it POSTs JSON so Make waits **5 minutes**, then posts **one** follow-up comment.

---

## Webhook body (from publish script)

```json
{
  "post_id": "964179840112349_122136371223248915",
  "id": "964179840112349_122136371223248915",
  "comment": "¡Gracias por tu interés! …",
  "message": "¡Gracias por tu interés! …"
}
```

| Field | Use in Make |
|--------|-------------|
| `id` or `post_id` | Facebook Pages → **Create a Comment** → **id** (required — the post to comment on) |
| `message` or `comment` | Facebook Pages → **Create a Comment** → **message** (comment text) |

---

## Error: `Missing value of required parameter 'id'`

**Symptom:** Facebook Pages – Create a Comment fails with `BundleValidationError`; module mapped to `{{1.id}}` but value is empty.

**Root causes (most common first):**

1. **Stale queue after scenario edit** — Make retried an old webhook run with an empty bundle after you changed mappings or restarted the scenario. Clear incomplete executions in Make before turning the scenario back on.
2. **Webhook structure lost** — Webhooks module shows **“No data detected”**; bundle `1` is empty at runtime even though HTTP included JSON.
3. **Scenario auto-deactivated** — After 3 errors (`maxErrors: 3`), Make sets the scenario **inactive** (`isActive: false`, `isinvalid: true`). Webhooks still queue but fail until you fix mappings and **Start** again.

**Fix applied 2026-06-08:**

- Facebook **id** → `{{ifempty(1.id; 1.post_id)}}`
- Facebook **message** → `{{ifempty(1.message; 1.comment)}}`
- Single **300s** sleep (5 min — maximum Make allows per Sleep module)
- Bad webhook queue **deleted** (2 broken payloads with missing `post_id`)
- Scenario **active** (`isActive: true`, `isinvalid: false`, `dlqCount: 0`)

### Fix (in Make.com)

1. **Clear the queue** — Scenario → queue / incomplete executions → delete stale runs (empty payloads retry forever).
2. **Re-detect webhook structure**
   - Open **Webhooks** (module 1) → **Edit**
   - Click **Redetermine data structure** / **Detect new values**
   - In another terminal, fire a real sample payload:
     ```bash
     cd facebook-posting
     python3 scripts/test_make_first_comment_webhook.py --send
     ```
   - Make should capture: `id`, `post_id`, `message`, `comment`
   - **Save** the webhook module
3. **Remap Facebook module**
   - **id** → `{{ifempty(1.id; 1.post_id)}}`
   - **message** → `{{ifempty(1.message; 1.comment)}}`
4. **Save scenario** → click **Start** / turn **ON** → run one test with `--send` and confirm history shows **Success** after the sleep.

### If bundle is still empty

- Confirm the webhook URL in `facebook-posting/config/settings.json` matches module 1 (not an old hook URL).
- Confirm publish script sends `Content-Type: application/json` (it does).
- Do **not** map from a Router or Sleep module — always map from **module 1 Webhooks** (`{{1.*}}`).

---

## Correct scenario shape (one comment only)

```
[1] Webhooks – Custom webhook
      ↓
[2] Tools – Sleep 300 seconds (5 min — Make maximum)
      ↓
[3] Facebook Pages – Create a Comment
      id      → {{ifempty(1.id; 1.post_id)}}
      message → {{ifempty(1.message; 1.comment)}}
```

**Scenario ID (Make):** `5319915` — **Cursor FB Custom Comment**

### Do not

- Hardcode comment text in the Facebook module.
- Add a second “Create comment” module.
- Leave **id** unmapped — Make will deactivate the scenario after errors.

---

## Test webhook without publishing to Facebook

```bash
cd facebook-posting
python3 scripts/test_make_first_comment_webhook.py --dry-run   # print payload only
python3 scripts/test_make_first_comment_webhook.py --send        # POST to Make for structure detect
```

Use `--post-id YOUR_REAL_POST_ID` only when you intend Make to comment on that post after the sleep.

---

## Publish from repo

```bash
cd facebook-posting
./publish-weekly-june07.sh   # or main.py --from-json FB/post-package-….json
```

Copy for `first_comment` lives in `FB/post-package-weekly-YYYY-MM-DD.json` → field `first_comment` (~8 lines).
