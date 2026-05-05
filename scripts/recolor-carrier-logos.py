#!/usr/bin/env python3
"""
Strip solid plate from white-on-navy carrier PNGs; paint marks as #003b6f.
Detects plate color from navy-dominant pixels (not transparent letterboxing).
"""
from pathlib import Path

import numpy as np
from PIL import Image

NAVY = np.array([0, 59, 111], dtype=np.float32)


def estimate_plate_rgb(rgb: np.ndarray) -> np.ndarray:
    """Median color of pixels that look like the blue plate (not ink, not black bars)."""
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    navyish = (b > 45) & (b > r + 8) & (b > g * 0.85)
    if np.count_nonzero(navyish) > 100:
        return np.median(rgb[navyish], axis=0)
    edge = np.vstack([rgb[0, :, :], rgb[-1, :, :], rgb[:, 0, :], rgb[:, -1, :]])
    return np.median(edge, axis=0)


def process(path_in: Path, path_out: Path, fuzz: float = 52.0) -> None:
    im = Image.open(path_in).convert("RGBA")
    arr = np.asarray(im, dtype=np.float32)
    rgb = arr[:, :, :3]

    bg = estimate_plate_rgb(rgb)
    dist = np.linalg.norm(rgb - bg.reshape(1, 1, 3), axis=2)
    is_plate = dist < fuzz

    lum = rgb.mean(axis=2)
    is_ink = (~is_plate) & (lum > 72.0)

    out = np.zeros_like(arr)
    ink_strength = np.clip((lum - 72.0) / (255.0 - 72.0), 0.0, 1.0)
    for c in range(3):
        out[:, :, c] = np.where(
            is_ink, NAVY[c] * np.maximum(ink_strength, 0.35), 0.0
        )

    orig_a = arr[:, :, 3]
    out[:, :, 3] = np.where(
        is_ink,
        np.clip(orig_a * (0.35 + 0.65 * ink_strength), 0, 255),
        0.0,
    )

    out = np.clip(np.round(out), 0, 255).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(path_out, optimize=True)
    print(f"Wrote {path_out} plate RGB ({bg[0]:.0f},{bg[1]:.0f},{bg[2]:.0f})")


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent / "img" / "carriers"
    for name in ("mutual-of-omaha-logo.png", "american-amicable-logo.png"):
        process(root / name, root / name)
