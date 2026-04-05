#!/usr/bin/env python3
"""
Generate hero + story images for blog/weekly-insurance-update-2026-04-05.html
using fal-ai FLUX Schnell (text-to-image).

Requires: pip install fal-client requests
Env: FAL_KEY in .env.local or environment.

Output:
  img/blog-generated/weekly-insurance-update-2026-04-05/hero.png
  story-1.png … story-3.png
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = PROJECT_ROOT / "img" / "blog-generated" / "weekly-insurance-update-2026-04-05"

# Load .env.local
_env = PROJECT_ROOT / ".env.local"
if _env.exists():
    for line in _env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


ASSETS: list[tuple[str, str]] = [
    (
        "hero.png",
        "Editorial photograph, peaceful golden sunrise over calm open water and a soft empty horizon, "
        "sense of clarity guidance and new beginnings, wide cinematic composition, natural light, "
        "no buildings, no skyscrapers, no city skyline, no office towers, no urban architecture, "
        "no people, no text, no logos, no watermark, photorealistic serene mood",
    ),
    (
        "story-1.png",
        "Concept art, artificial intelligence governance in insurance regulation, abstract neural network "
        "nodes and lines connecting to a subtle classical government building silhouette, deep navy blue "
        "and gold accents, professional tech-policy illustration style, no text, no logos, no watermark",
    ),
    (
        "story-2.png",
        "Modern life insurance customer experience, smartphone showing a clean payment or billing app UI "
        "blurred generic interface, soft hands holding phone, desk with subtle policy folder out of focus, "
        "bright natural office light, photorealistic lifestyle photography, no readable text, no logos",
    ),
    (
        "story-3.png",
        "Professional financial planning scene, tablet device on desk showing abstract conservative growth "
        "curves and charts no legible numbers, retirement and annuity planning mood, trustworthy advisor "
        "office, soft daylight, photorealistic, no readable text, no logos, no watermark",
    ),
]


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate weekly blog images via fal FLUX Schnell.")
    parser.add_argument(
        "--hero-only",
        action="store_true",
        help="Regenerate only hero.png (e.g. after changing the hero prompt).",
    )
    args = parser.parse_args()

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY not set. Add to .env.local", file=sys.stderr)
        return 1
    try:
        import fal_client
        import requests
    except ImportError as e:
        print("ERROR: pip install fal-client requests", e, file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    to_run = ASSETS
    if args.hero_only:
        to_run = [a for a in ASSETS if a[0] == "hero.png"]
        if not to_run:
            print("ERROR: hero.png not in ASSETS", file=sys.stderr)
            return 1

    for filename, prompt in to_run:
        print(f"Generating {filename} …")
        result = fal_client.subscribe(
            "fal-ai/flux/schnell",
            arguments={
                "prompt": prompt,
                "image_size": "landscape_4_3",
                "num_inference_steps": 4,
                "num_images": 1,
                "enable_safety_checker": True,
            },
            with_logs=False,
        )
        images = result.get("images") or result.get("image") or []
        if isinstance(images, dict):
            images = [images]
        if not images:
            print(f"ERROR: No images in response for {filename}: {result}", file=sys.stderr)
            return 1
        first = images[0]
        url = first.get("url") if isinstance(first, dict) else first
        r = requests.get(url, timeout=120)
        if r.status_code != 200:
            print(f"ERROR: Download failed {r.status_code}", file=sys.stderr)
            return 1
        out = OUTPUT_DIR / filename
        out.write_bytes(r.content)
        print(f"  Saved {out} ({len(r.content) // 1024} KB)")

    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
