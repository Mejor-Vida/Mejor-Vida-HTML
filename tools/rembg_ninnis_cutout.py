#!/usr/bin/env python3
"""Regenerate Ninnis cutout with human-specific model + alpha matting + white-fringe fix."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
from rembg import remove, new_session


def decontaminate_white_background(rgba: Image.Image, bg_rgb: tuple[float, float, float] = (255.0, 255.0, 255.0)) -> Image.Image:
    """
    Undo linear blend with an assumed light background on edge pixels.

    If composite was C = a*F + (1-a)*bg with bg ~ white, recover F = (C - (1-a)*bg) / a.
    Removes the milky white halo common around hair after segmentation.
    """
    arr = np.asarray(rgba).astype(np.float32)
    rgb = arr[..., :3].copy()
    alpha_ch = arr[..., 3]
    a = alpha_ch[..., np.newaxis] / 255.0
    bg = np.array(bg_rgb, dtype=np.float32).reshape(1, 1, 3)

    eps = 0.08  # avoid blow-ups in very transparent pixels; keeps soft edges stable
    aa = np.maximum(a, eps)
    recovered = (rgb - (1.0 - a) * bg) / aa
    recovered = np.clip(recovered, 0, 255)

    mask = alpha_ch > 3
    arr[..., :3] = np.where(mask[..., np.newaxis], recovered, arr[..., :3])
    return Image.fromarray(arr.astype(np.uint8))


def soften_residual_glow(rgba: Image.Image, *, strength: float = 0.2) -> Image.Image:
    """Second pass: slightly darken still-bright semi-transparent edge pixels (hair)."""
    arr = np.asarray(rgba).astype(np.float32)
    rgb = arr[..., :3]
    a = arr[..., 3] / 255.0
    y = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    edge = (arr[..., 3] > 8) & (arr[..., 3] < 250) & (y > 170)
    t = np.clip((y - 160) / 95.0, 0, 1.0)[..., np.newaxis]
    spill = t * strength * (1.0 - a[..., np.newaxis] * 0.3)
    rgb_out = rgb * (1.0 - spill)
    arr[..., :3] = np.where(edge[..., np.newaxis], np.clip(rgb_out, 0, 255), rgb)
    return Image.fromarray(arr.astype(np.uint8))


def main() -> int:
    repo = Path(__file__).resolve().parents[1]
    desktop_ninnis = repo.parent / "Ninnis"
    src = desktop_ninnis / "PHOTO-2026-05-10-15-17-00 11.jpg"
    if not src.is_file():
        print("Source not found:", src, file=sys.stderr)
        return 1

    img = ImageOps.exif_transpose(Image.open(src).convert("RGB"))
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

    out = decontaminate_white_background(out)
    out = soften_residual_glow(out, strength=0.2)

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
