# Facebook post preview (local)

**`post-preview.html`** lives here. It is **regenerated automatically** every time you run `main.py` from `facebook-posting/`—including:

- `python3 main.py --dry-run`
- `python3 main.py --preview`
- `python3 main.py` (publish)

After you edit the caption in `main.py`, run any of the above once; then open **`post-preview.html`** in your browser (inside **`Mejor-Vida-HTML/FB`**, not a different `FB` folder on your Desktop).

The preview shows a **dated banner** (from `weekly-insurance-update-YYYY-MM-DD` in the blog URL) and also writes **`post-preview-YYYY-MM-DD.html`** with the same content so you can keep older weeks side by side.

These files are generated and git-ignored so they are not committed.
