# Facebook post preview (local)

**Custom post graphics** (when not using a blog hero) can live in **`assets/`** (for example `FB/assets/iowa-senior-safeguard-fb-2026-04.png`). A copy for local preview resolution may also sit under **`img/facebook/`** with the same filename referenced by `image_url` in `post-package.json`.

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
