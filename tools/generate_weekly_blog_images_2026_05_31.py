#!/usr/bin/env python3
"""Generate hero + story images for weekly-insurance-update-2026-05-31 (May 31, 2026)."""
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

SLUG = "weekly-insurance-update-2026-05-31"
OUT = ROOT / "img" / "blog-generated" / SLUG

HERO_PROMPT = (
    "A Hispanic estate planning attorney and insurance agent reviewing trust documents beside a glowing "
    "digital dashboard showing AI underwriting timelines and a family protection shield icon, "
    "symbolizing tax policy on insurance trusts, AI-driven underwriting, and protection-first planning. "
    f"{CINEMATIC_EDITORIAL}"
)

STORIES: list[tuple[str, str]] = [
    (
        "story-1.png",
        "A Hispanic financial advisor at a mahogany desk with estate planning binders labeled ILIT and trust, "
        "U.S. Capitol dome visible through window blur, legislative tax crackdown on life insurance trusts metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-2.png",
        "A Hispanic insurance underwriter in a modern office, multiple transparent screens showing electronic health "
        "records, prescription data streams, and an AI decision timeline compressing weeks into hours, "
        "AI life insurance underwriting metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-3.png",
        "A Hispanic mass-affluent couple in their 50s at a kitchen table with a financial advisor pointing to "
        "life insurance policy documents beside retirement statements, protection-first planning versus annuities metaphor. "
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
