#!/usr/bin/env python3
"""Generate hero + story images for weekly-insurance-update-2026-07-12 (July 12, 2026)."""
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

SLUG = "weekly-insurance-update-2026-07-12"
OUT = ROOT / "img" / "blog-generated" / SLUG

HERO_PROMPT = (
    "A Hispanic insurance professional at a desk reviewing three folders labeled long-term care "
    "reinsurance, Medicare Supplement premiums, and life settlements, with charts and policy "
    "documents, symbolizing Unum LTC deal, Medigap rate surge, and NAIFA settlement guidance. "
    f"{CINEMATIC_EDITORIAL}"
)

STORIES: list[tuple[str, str]] = [
    (
        "story-1.png",
        "Hispanic insurance executive signing a large reinsurance contract folder labeled long-term care "
        "beside balance-sheet charts transferring legacy LTC reserves, Unum Fortitude Re metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-2.png",
        "Hispanic senior couple reviewing a Medicare Supplement renewal letter with a steep premium "
        "increase percentage highlighted, Medigap Plan G rate surge metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-3.png",
        "Hispanic insurance agent counseling a senior client about selling a life insurance policy, "
        "death benefit certificate and caution documents on the table, NAIFA life settlement advisory metaphor. "
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

    for filename, prompt in STORIES:
        time.sleep(1.5)
        print(f"Generating {filename}...")
        img = call_fal_image(
            prompt=prompt,
            width=STORY_SIZE[0],
            height=STORY_SIZE[1],
            model="realistic-vision",
            max_retries=4,
        )
        path = OUT / filename
        write_image(path, img)
        print(f"  {filename} -> {path}")

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
