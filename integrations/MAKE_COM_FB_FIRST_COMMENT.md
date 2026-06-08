# Make.com — Facebook first comment

## Two scenarios — only one should be ON

| Scenario | Status | Role |
|----------|--------|------|
| **Cursor FB Custom Comment** | **Active** | Receives webhook from `facebook-posting/main.py`; posts custom `first_comment` after ~10 min |
| **Facebook Auto-Comment on New Posts** | **Inactive** | Legacy: hardcoded Spanish comment on every new Page post — **leave off** or you get duplicate comments |

Webhook URL (Cursor scenario): `https://hook.us2.make.com/ytukuvzqkvjjz33ief8hi17ruo2df3vi`

**June 7 duplicate comments:** Auto-Comment posted the static first comment (~10:49 PM); Cursor webhook posted the long custom comment. Auto-Comment was disabled; only the webhook path runs now.

After `facebook-posting/main.py` publishes to Facebook, it POSTs JSON so Make waits ~10 minutes, then posts **one** follow-up comment.

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

**Error you saw:** `Missing value of required parameter 'id'` — the Facebook module’s **id** field was empty. Map **`{{1.id}}`** or **`{{1.post_id}}`** from the webhook module (step 1).

---

## Correct scenario shape (one comment only)

```
[1] Webhooks – Custom webhook
      ↓
[2] Tools – Sleep 600 seconds (10 min)   ← one sleep is enough; remove duplicate 300+300 if redundant
      ↓
[3] Facebook Pages – Create a Comment
      id      → {{1.id}}      (or {{1.post_id}})
      message → {{1.message}}  (or {{1.comment}})
```

### Do not

- Hardcode “¡Gracias por tu interés!…” in the Facebook module — use **`{{1.message}}`** only.
- Add a **second** Facebook “Create comment” module (causes two comments on the post).
- Leave **id** unmapped — scenario will fail and Make will **deactivate** the scenario.

### After fixing

1. Save the scenario.
2. Turn the scenario **ON** again (Make turns it off after errors).
3. Optional test: run webhook manually with sample JSON (use a real recent `post_id` from a test post).

---

## History log (June 7, 2026)

| Time | Result | Likely cause |
|------|--------|----------------|
| 10:43–10:49 PM | Success (Auto-Comment) | **Facebook Auto-Comment on New Posts** — static hardcoded comment |
| 11:14 PM | Error (Cursor webhook) | **Cursor FB Custom Comment** — module **id** empty before mapping fix |
| 11:24 PM | Deactivated | Make auto-stopped Cursor scenario after error |

**Current (fixed):** Auto-Comment **inactive**; Cursor scenario **active** with `id` → `{{1.id}}`, `message` → `{{1.message}}`.

---

## Publish from repo

```bash
cd facebook-posting
./publish-weekly-june07.sh   # or main.py --from-json FB/post-package-….json
```

Copy for `first_comment` lives in `FB/post-package-weekly-YYYY-MM-DD.json` → field `first_comment` (~8 lines, website + post-specific highlight).
