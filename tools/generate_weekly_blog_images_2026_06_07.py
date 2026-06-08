#!/usr/bin/env python3
"""Generate hero + story images for weekly-insurance-update-2026-06-07 (June 7, 2026)."""
from __future__ import annotations

import shutil
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from generate_blog_images import (  # noqa: E402
    CINEMATIC_EDITORIAL,
    NARRATIVE_MODIFIERS,
    call_fal_image,
    write_image,
    _load_env,
)

_load_env()

SLUG = "weekly-insurance-update-2026-06-07"
OUT = ROOT / "img" / "blog-generated" / SLUG

HERO_PROMPT = (
    "A Hispanic insurance executive standing at a dramatic crossroads of glowing U.S. state map outlines, "
    "holding a structured settlement annuity document in one hand and a family protection shield in the other, "
    "symbolizing reinsurance M&A, state paid-leave regulation, lost-policy recovery, and legislative reform. "
    f"{CINEMATIC_EDITORIAL}"
)

STORIES: list[tuple[str, str]] = [
    (
        "story-1.png",
        "A Hispanic settlement planner and reinsurance analyst reviewing a long-duration liability timeline chart "
        "beside a courthouse settlement document, structured settlement annuity acquisition metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-2.png",
        "Hispanic professionals in a modern office, Golden Hour light through floor-to-ceiling windows, "
        "employer reviewing paid family leave and group life insurance benefit packages on a laptop, "
        "Maryland FAMLI private plan metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-3.png",
        "A Hispanic family at a kitchen table using a laptop showing a life insurance policy search portal, "
        "old policy folders and a death certificate envelope nearby, lost life insurance benefits recovery metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-4.png",
        "A Hispanic compliance officer walking past the Louisiana state capitol steps carrying binders labeled BOLI "
        "and surety bonds, clock and legal gavel imagery in background blur, state insurance legislation metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
]

HERO_SIZE = (1536, 864)
STORY_SIZE = (1280, 720)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"Output: {OUT}")

    print("Generating hero...")
    hero_bytes = call_fal_image(
        prompt=HERO_PROMPT,
        width=HERO_SIZE[0],
        height=HERO_SIZE[1],
        model="realistic-vision",
        max_retries=4,
    )
    hero_path = OUT / "hero.png"
    write_image(hero_path, hero_bytes)
    shutil.copy2(hero_path, OUT / "hero-en.png")
    shutil.copy2(hero_path, OUT / "hero-es.png")
    print(f"  hero -> {hero_path}")

    for fname, prompt in STORIES:
        print(f"Generating {fname}...")
        time.sleep(1)
        data = call_fal_image(
            prompt=prompt,
            width=STORY_SIZE[0],
            height=STORY_SIZE[1],
            model="realistic-vision",
            max_retries=4,
        )
        out = OUT / fname
        write_image(out, data)
        print(f"  -> {out}")

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
