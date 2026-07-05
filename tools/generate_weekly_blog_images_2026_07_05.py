#!/usr/bin/env python3
"""Generate hero + story images for weekly-insurance-update-2026-07-05 (July 5, 2026)."""
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

SLUG = "weekly-insurance-update-2026-07-05"
OUT = ROOT / "img" / "blog-generated" / SLUG

HERO_PROMPT = (
    "A Hispanic insurance executive at a dramatic crossroads of regulatory documents, "
    "holding a PHL Variable liquidation timeline in one hand and a life insurance policy folder in the other, "
    "symbolizing carrier solvency, advisor compensation reform, GLP-1 underwriting, and IUL product innovation. "
    f"{CINEMATIC_EDITORIAL}"
)

STORIES: list[tuple[str, str]] = [
    (
        "story-1.png",
        "A Hispanic insurance regulator and policyholder reviewing a Connecticut liquidation timeline chart "
        "beside NOLHGA guaranty association documents, PHL Variable Insurance receivership metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-2.png",
        "Hispanic financial advisor in a modern office reviewing LLC and S-corp compensation documents "
        "after a unanimous House committee vote, Clarity for Compensation Act metaphor. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-3.png",
        "A Hispanic underwriter at a desk with GLP-1 medication bottles, BMI calculator, and life insurance "
        "application forms, weight add-back underwriting metaphor for Ozempic effect. "
        f"{NARRATIVE_MODIFIERS}",
    ),
    (
        "story-4.png",
        "A Hispanic agent presenting Corebridge Max Accumulator IUL illustrations with Nasdaq-100 and S&P 500 "
        "index charts on a laptop screen, indexed universal life product enhancement metaphor. "
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
