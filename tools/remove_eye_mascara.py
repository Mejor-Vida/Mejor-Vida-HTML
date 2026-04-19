#!/usr/bin/env python3
"""
Remove dark mascara/eyeliner artifacts around eyes in Julie cartoon.

Lightens dark pixels in the eye region to soften or remove mascara-like artifacts.
Uses PIL - no API needed.
"""
import argparse
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_INPUT = os.path.join(_project_root, "img", "julie_final_cartoon.png")
DEFAULT_OUTPUT = os.path.join(_project_root, "img", "julie_final_cartoon.png")


def lighten_eye_region(img, center_y_frac=0.42, height_frac=0.2, width_frac=0.55, strength=0.55):
    """Lighten dark mascara-like pixels in the eye region."""
    from PIL import Image
    import numpy as np

    arr = np.array(img)
    h, w = arr.shape[:2]
    cy = int(h * center_y_frac)
    band_h = int(h * height_frac)
    band_w = int(w * width_frac)
    cx = w // 2
    y1 = max(0, cy - band_h // 2)
    y2 = min(h, cy + band_h // 2)
    x1 = max(0, cx - band_w // 2)
    x2 = min(w, cx + band_w // 2)

    region = arr[y1:y2, x1:x2].astype(float)
    lum = np.mean(region[:, :, :3], axis=2)
    # Lighten dark pixels (mascara/eyeliner) - below ~130
    dark_mask = lum < 130
    # Soften: pull dark pixels toward skin tone (~200)
    target = 195
    for c in range(3):
        channel = region[:, :, c]
        blend = channel * (1 - strength) + target * strength
        region[:, :, c] = np.where(dark_mask, blend, channel)
    arr[y1:y2, x1:x2] = np.clip(region, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def main():
    parser = argparse.ArgumentParser(description="Remove mascara-like dark areas around eyes")
    parser.add_argument("--input", default=DEFAULT_INPUT, help="Input image")
    parser.add_argument("-o", "--output", default=DEFAULT_OUTPUT, help="Output image")
    parser.add_argument("--strength", type=float, default=0.5, help="Lighten strength 0-1 (default 0.5)")
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"ERROR: Not found: {args.input}", file=sys.stderr)
        return 1

    try:
        from PIL import Image
    except ImportError:
        print("ERROR: pip install Pillow", file=sys.stderr)
        return 1

    img = Image.open(args.input).convert("RGB")
    out = lighten_eye_region(img, strength=args.strength)
    out.save(args.output)
    print(f"✅ Saved: {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
