#!/usr/bin/env python3
"""
Rebuild Julie's dad cutout from ninnis/julies-dad-source-portrait.png.

Uses **isnet-general-use** with **alpha_matting disabled**. On this source photo,
u2net_human_seg + alpha matting mis-classifies the overexposed side of the face
as background and chews holes in the head. ISNet without matting is softer on
edges (possible light fringe) but avoids that damage.

For print/hero use, manual touch-up in Photopea/Photoshop may still be worthwhile.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps
from rembg import remove, new_session


def main() -> int:
    repo = Path(__file__).resolve().parents[1]
    src = repo / "ninnis" / "julies-dad-source-portrait.png"
    if not src.is_file():
        print("Source not found:", src, file=sys.stderr)
        return 1

    img = ImageOps.exif_transpose(Image.open(src).convert("RGB"))
    session = new_session("isnet-general-use")
    out = remove(
        img,
        session=session,
        alpha_matting=False,
        post_process_mask=True,
    )

    dest_dirs = [
        repo / "ninnis",
        repo.parent / "Ninnis",
        Path.home() / "Desktop" / "Ninnis",
    ]

    out_name = "julies-dad-no-background.png"
    preview_name = "julies-dad-preview-gray-bg.jpg"

    gray = Image.new("RGBA", out.size, (180, 180, 190, 255))
    flat = Image.alpha_composite(gray, out).convert("RGB")

    for d in dest_dirs:
        d.mkdir(parents=True, exist_ok=True)
        png_path = d / out_name
        out.save(png_path, "PNG")
        print("Wrote:", png_path)
        jpg_path = d / preview_name
        flat.save(jpg_path, "JPEG", quality=92)
        print("Wrote:", jpg_path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
