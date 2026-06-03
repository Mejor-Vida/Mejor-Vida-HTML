# Mejor Vida Insurance — Facebook Posting System (v1)

Generate Facebook posts from blog content and publish to your Facebook Page.

## Step-by-step: How to run

### 1. Install dependencies

From your **project root** (where `Mejor-Vida-HTML` lives):

```bash
cd "/Users/mejorvidainsurance/Desktop/mejor-vida-html /Mejor-Vida-HTML/facebook-posting"
pip3 install -r requirements.txt
```

Or if you're already inside the Mejor-Vida-HTML folder:

```bash
cd facebook-posting
pip3 install -r requirements.txt
```

> **Note:** Use `pip3` on macOS (not `pip`). If `pip3` fails, try `python3 -m pip install -r requirements.txt`.

### 2. Configure your Facebook Page credentials

> **Important:** `config/settings.json` holds only placeholders. Put real secrets in
> `facebook-posting/.env` (never committed to git). See the full walkthrough below in
> [TOKEN SETUP](#token-setup--fixing-error-190).

Copy the example env file and fill it in:

```bash
cp .env.example .env
# then edit .env with your values
```

Run the token-exchange script to get a long-lived Page token (one-time setup):

```bash
python3 scripts/get_page_token.py
```

Paste the printed `FACEBOOK_PAGE_ACCESS_TOKEN=…` line into `.env`.

### 3. Test without publishing (dry run)

Generate a caption only — no API call (run from inside `facebook-posting`):

```bash
python3 main.py --dry-run
```

You'll see the generated Facebook post text. Good for testing before you add real credentials.

### 3b. Preview in the browser (before Facebook)

**`FB/post-preview.html`** (inside **`Mejor-Vida-HTML/FB`**) is updated **every time** you run `main.py`—dry-run, preview-only, or full publish. After you change the caption in `main.py`, run:

```bash
python3 main.py --dry-run
```

Then open **`Mejor-Vida-HTML/FB/post-preview.html`** in Chrome or Safari. The hero image loads from your **local repo** when the file exists; otherwise it uses the production image URL.

`FB/post-preview.html` is git-ignored; see **`FB/README.md`** in the repo.

### 4. Publish to Facebook

Once credentials are set:

```bash
python3 main.py
```

This will:
1. Generate a caption from the blog post defined in `main.py`
2. Print the caption
3. Refresh **`FB/post-preview.html`** for local review
4. Publish to your Facebook Page (with hero image)

**First comment via Make.com:** If the follow-up comment (blog link + WhatsApp) is added by a **Make.com** scenario—not the Graph API—run publish with **`--no-first-comment`** so only the main post is created. Use the `first_comment` field in **`FB/post-package.json`** as the text Make posts. Example:

```bash
python3 main.py --from-json FB/post-package-story1-weekly-2026-05-03.json --no-first-comment
```

### 5. Use your own blog post

Edit `main.py` and change the `blog` dict:

```python
blog = {
    "title": "Your blog title",
    "summary": "Your summary...",
    "url": "https://www.mejorvidainsurance.com/blog/your-post.html",
    "image_url": "https://...",  # or None for text-only post
}
```

---

## SSL: `CERTIFICATE_VERIFY_FAILED` on macOS

If `diagnose_token.py` or `get_page_token.py` fails with **SSL: CERTIFICATE_VERIFY_FAILED**,
install dependencies (the repo uses **`certifi`** so HTTPS trusts the same roots as browsers):

```bash
cd facebook-posting
python3 -m pip install -r requirements.txt
```

If it still fails, install Apple’s CA bundle for the **python.org** installer: open  
`/Applications/Python 3.x/Install Certificates.command` (adjust version), then retry.

---

## TOKEN SETUP — Fixing error 190

Meta Graph API error **190** means your access token is invalid or expired.
This happens when you paste a short-lived token (from Graph API Explorer, valid ~1 hour)
and don't exchange it for a long-lived Page token.

### Why a Page token, not a User token?

- **User tokens** expire in 1 hour (short-lived) or ~60 days (long-lived).
- **Page access tokens** derived from a long-lived User token **never expire** as long as
  you don't change your Facebook password or revoke the app.
- The `/photos` and `/feed` endpoints require a **Page token** with `pages_manage_posts`.

### Required Facebook App permissions

Your app must have these permissions granted:

| Permission | Why |
|---|---|
| `pages_manage_posts` | Required to publish posts/photos |
| `pages_read_engagement` | Required for most Page read operations |
| `pages_show_list` | Required to list pages via `/me/accounts` |

> **App Review / Live mode (critical):** Posts created through the Graph API while your app is in
> **Development** mode often **do not appear on the public Page timeline** — only posts made in the
> Facebook/Meta UI (no `application` on the post) show for everyone. Switch the app to **Live**
> in [developers.facebook.com](https://developers.facebook.com) → your app → top toggle. You may need
> App Review for `pages_manage_posts` before Live mode allows that permission. After going Live,
> older API posts may become visible; if not, republish or boost from Business Suite.

### One-time token setup (step by step)

**Step 1 — Add credentials to `.env`**

```bash
# Inside facebook-posting/
cp .env.example .env
```

Edit `.env` and set:
- `FACEBOOK_APP_ID` — from [developers.facebook.com](https://developers.facebook.com) → your app → App ID
- `FACEBOOK_APP_SECRET` — App Dashboard → Settings → Basic → App Secret
- `FACEBOOK_PAGE_ID` — Facebook Page → About → scroll to bottom → Page ID (numeric)

**Step 2 — Get a short-lived User token from Graph API Explorer**

1. Go to <https://developers.facebook.com/tools/explorer/>
2. Select your app from the top-right dropdown
3. Click **Generate Access Token**
4. In the permissions dialog, add:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
5. Click **Generate** → authorize when prompted
6. Copy the **User Token** shown (not a Page token — the exchange script handles that)
7. Paste it into `.env` as `FACEBOOK_SHORT_LIVED_USER_TOKEN=<paste here>`

**Step 3 — Run the exchange script**

```bash
cd facebook-posting
python3 scripts/get_page_token.py
```

The script will:
1. Exchange the short-lived User token for a long-lived one (~60 days)
2. List all Pages you manage
3. Extract the Page token for your `FACEBOOK_PAGE_ID`
4. Print the `FACEBOOK_PAGE_ACCESS_TOKEN=…` line — **paste it into `.env`**

Or run **`python3 scripts/apply_page_token.py`** (same exchange, but writes the token into `facebook-posting/.env` and the repo root `.env.local` without printing the full value).

**Step 4 — Verify before publishing**

```bash
python3 scripts/diagnose_token.py
```

All checks should show ✓. Then:

```bash
python3 main.py --dry-run   # preview caption
python3 main.py             # publish for real
```

### Refreshing an expired token

Page tokens don't expire on their own, but they are invalidated if you:
- Change your Facebook password
- Revoke the app in Facebook Settings → Apps and Websites
- The app is deleted or its permissions are changed

When that happens, just repeat Steps 2–4 above (get a new short-lived User token from
Graph API Explorer, run `get_page_token.py`, paste the new Page token into `.env`).

### Quick curl equivalent (optional manual check)

```bash
# Replace TOKEN, APP_ID, APP_SECRET with your values
curl "https://graph.facebook.com/v21.0/debug_token?input_token=TOKEN&access_token=APP_ID|APP_SECRET"
```

---

## Project structure

```
facebook-posting/
├── main.py              # Entry point
├── .env.example         # Template — copy to .env and fill in secrets
├── .env                 # Your secrets (git-ignored, never commit)
├── .gitignore
├── config/
│   └── settings.json   # Non-secret defaults (page_id placeholder, language)
├── prompts/
│   └── facebook_post_template.md
├── scripts/
│   ├── generate_facebook_post.py   # Caption generator (plug in LLM here)
│   ├── publish_facebook.py         # Meta Graph API publisher
│   ├── get_page_token.py           # One-time token exchange (short → long-lived Page token)
│   ├── diagnose_token.py           # Pre-flight token verification
│   ├── apply_page_token.py         # Run exchange and save token to .env (no echo)
│   ├── preview_html.py             # Build preview.html for browser review
│   └── ssl_context.py              # HTTPS CA bundle (certifi) for urllib
└── requirements.txt
```

## Future extensions

- Plug in OpenAI or other LLM in `generate_facebook_post.py` (replace `_simulate_generation`)
- Connect to your blog system to auto-fetch posts
- Add scheduling (cron, etc.)
