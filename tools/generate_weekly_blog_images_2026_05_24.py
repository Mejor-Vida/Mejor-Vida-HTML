#!/usr/bin/env python3
"""Generate hero + story images for weekly-insurance-update-2026-05-24 (May 24, 2026)."""
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

SLUG = "weekly-insurance-update-2026-05-24"
OUT = ROOT / "img" / "blog-generated" / SLUG

HERO_PROMPT = (
    "A Hispanic insurance agent in professional attire standing before a curved wall of glowing displays: "
    "weather satellite maps, rising financial charts, a dignified senior family silhouette, and a calendar page, "
    "symbolizing data-driven pricing, capital, final expense protection, and enrollment deadlines. "
    f"{CINEMATIC_EDITORIAL}"
)

STORIES: list[tuple[str, str]] = [
    (
        "story-1.png",
        "A Hispanic woman analyst in a modern tech center, hand gesturing toward a large holographic Earth with "
        "satellite weather layers and AI forecast streams swirling, InsurTech and real-time underwriting data metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-2.png",
        "A Hispanic financial executive walking across a glass skybridge, looking at glowing transparent pillars "
        "labeled with flowing capital streams between insurers, life reinsurance and billion-dollar capacity metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-3.png",
        "A Hispanic senior man and exactly one Hispanic woman—his wife or adult daughter—walking hand in hand on a "
        "gravel path through a dignified memorial garden with soft morning light, only two people visible, "
        "final expense whole life and family protection metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-4.png",
        "Hispanic insurance agents in a modern office during Golden Hour, one pointing at a wall calendar with a "
        "highlighted November enrollment window and health insurance forms on the desk, CMS ACA marketplace rules metaphor. "
        "Natural office glow, collaborative moment, professional editorial photography, 8k, high-end magazine aesthetic.",
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
    print(f"Saved {hero_path}, hero-en.png, hero-es.png")
    time.sleep(1.2)

    for filename, prompt in STORIES:
        print(f"Generating {filename}...")
        data = call_fal_image(
            prompt=prompt,
            width=STORY_SIZE[0],
            height=STORY_SIZE[1],
            model="realistic-vision",
            max_retries=4,
        )
        path = OUT / filename
        write_image(path, data)
        print(f"Saved {path}")
        time.sleep(1.2)

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
