#!/usr/bin/env python3
"""Write FB/review-facebook-post.html from FB/post-package.json (local preview, file:// safe)."""
from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    fb_posting = root / "facebook-posting"
    sys.path.insert(0, str(fb_posting))

    from scripts.facebook_post_package import FacebookPostPackage
    from scripts.preview_html import infer_content_date_iso, write_preview_package

    pkg_path = root / "FB" / "post-package.json"
    if not pkg_path.is_file():
        print("Missing FB/post-package.json", file=sys.stderr)
        return 1
    data = json.loads(pkg_path.read_text(encoding="utf-8"))

    package = FacebookPostPackage(
        main_caption=data.get("main_caption", "").strip(),
        alternate_caption=(data.get("alternate_caption") or "").strip(),
        first_comment=data.get("first_comment", "").strip(),
        image_prompt=(data.get("image_prompt") or "").strip(),
        manychat_keywords=tuple(str(x) for x in (data.get("manychat_keywords") or ["INFO", "REVISAR"])),
        pinned_comment=(data.get("pinned_comment") or "").strip() or None,
    )
    blog_url = data.get("blog_url", "").strip()
    image_url = data.get("image_url")
    content_date = (data.get("post_date_iso") or "").strip() or infer_content_date_iso(blog_url)

    out = root / "FB" / "review-facebook-post.html"
    write_preview_package(
        package,
        image_url=image_url,
        blog_url=blog_url,
        out_path=out,
        content_date_iso=content_date,
    )
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
