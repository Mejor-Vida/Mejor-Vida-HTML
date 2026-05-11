#!/usr/bin/env python3
"""Regenerate Ninnis cutout with human-specific model + alpha matting."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps
from rembg import remove, new_session


def main() -> int:
    repo = Path(__file__).resolve().parents[1]
    # Repo is .../Mejor-Vida-HTML; sibling folder .../Ninnis holds the PHOTO imports
    desktop_ninnis = repo.parent / "Ninnis"
    src = desktop_ninnis / "PHOTO-2026-05-10-15-17-00 11.jpg"
    if not src.is_file():
        print("Source not found:", src, file=sys.stderr)
        return 1

    img = ImageOps.exif_transpose(Image.open(src).convert("RGB"))
    # Human segmentation + trimap matting = cleaner edges than default u2net on portraits
    session = new_session("u2net_human_seg")
    out = remove(
        img,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=15,
        alpha_matting_erode_size=8,
        post_process_mask=True,
    )

    out_repo = repo / "ninnis" / "photo-no-background.png"
    out_desktop = desktop_ninnis / "photo-no-background.png"
    out_repo.parent.mkdir(parents=True, exist_ok=True)
    out.save(out_repo, "PNG")
    out.save(out_desktop, "PNG")
    print("Wrote:", out_repo)
    print("Wrote:", out_desktop)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
