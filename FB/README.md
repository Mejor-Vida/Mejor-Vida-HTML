# Facebook post preview (local)

**Custom post graphics** (when not using a blog hero) can live in **`assets/`** (for example `FB/assets/iowa-senior-safeguard-fb-2026-04.png`). A copy for local preview resolution may also sit under **`img/facebook/`** with the same filename referenced by `image_url` in `post-package.json`.

**One-off packages:** `post-package-story1-weekly-2026-05-03.json` — Story 1 (May 3 weekly) + creative `story1-carriers-not-same-fb-2026-05.png` in `img/facebook/` and `FB/assets/`. **`post-package-story4-weekly-2026-05-10.json`** — Story 4 / final expense (May 10) + `fb-post-hero.png`; run `facebook-posting/publish-story4-may10.sh` (uses `--no-first-comment`; Make posts `first_comment`).

**First comment (link + WhatsApp):** Mejor Vida publishes that follow-up via **Make.com**, not the Graph API. When you run `facebook-posting/main.py` for the live post, use **`--no-first-comment`** so the main post (and optional image) go up only; Make then adds the first comment using the `first_comment` text from `post-package.json` (or your scenario mapping). The JSON field stays the single source of truth for copy.

**Local review (double-click in Finder):** open **`review-facebook-post.html`** in this folder. It mirrors `post-package.json`. After you change the JSON or run `facebook-posting/main.py`, regenerate the review file with:

`python3 tools/sync_fb_review_html.py`

**Iowa card image (Spanish PNG):** regenerate with `python3 tools/render_iowa_fb_card_es.py` (writes `img/facebook/` and `FB/assets/`). Requires Pillow (`pip install Pillow`).

**`post-preview.html`** lives here. It is **regenerated automatically** every time you run `main.py` from `facebook-posting/`—including:

- `python3 main.py --dry-run`
- `python3 main.py --preview`
- `python3 main.py` (publish)

After you edit the caption in `main.py`, run any of the above once; then open **`post-preview.html`** in your browser (inside **`Mejor-Vida-HTML/FB`**, not a different `FB` folder on your Desktop).

The preview shows a **dated banner** (from `weekly-insurance-update-YYYY-MM-DD` in the blog URL) and also writes **`post-preview-YYYY-MM-DD.html`** with the same content so you can keep older weeks side by side.

These files are generated and git-ignored so they are not committed.
