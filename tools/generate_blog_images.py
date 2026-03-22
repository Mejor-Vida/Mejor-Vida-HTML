#!/usr/bin/env python3
"""
Generate weekly blog images with Hugging Face or Fal.ai.

Uses the Narrative Editorial Image Strategy (tools/blog-image-rules.md):
- All people: Hispanic/Latino. Human-centric, narrative-driven.
- Hero: Hispanic person in dramatic metaphorical setting
- Stories: 1 office shot (--office-story N), rest narrative events with Hispanic people
- All prompts: subject action, dynamic angles, cinematic lighting, editorial 8k
- Retries: 4 attempts per image on timeout/connection error (--retries N)

HOW TO RUN (works reliably):
  Run from a terminal (not from Cursor's sandbox). The script needs full network
  access to reach Fal.ai; sandboxed environments can block this.

  From project root:
    cd "/path/to/Mejor-Vida-HTML"
    python3 tools/generate_blog_images.py --slug weekly-insurance-update-2026-03-22 \\
      --week-label "March 22, 2026" --provider fal \\
      --story "Life insurance growth forecast" --story "Digital tools for agents" ...

  FAL_KEY is loaded from .env.local. Use --office-story 2 to pick which story gets the one office scene.


Requirements:
  pip install requests   # Fal.ai uses REST API (no fal_client needed)
  FAL_KEY in .env.local or environment

Outputs:
  - hero.png
  - story-1.png, story-2.png, ... (one per --story)
Saved to:
  img/blog-generated/<slug>/
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Iterable

# Try loading .env.local from project root
def _load_env():
    root = Path(__file__).resolve().parents[1]
    env_path = root / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                v = v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v


_load_env()

DEFAULT_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"
DEFAULT_NEGATIVE_PROMPT = (
    "text, logo, watermark, signature, blurry, low quality, disfigured, distorted faces, "
    "brand names, trademark symbols"
)


def call_fal_image(
    *,
    prompt: str,
    width: int,
    height: int,
    model: str = "realistic-vision",
    max_retries: int = 3,
) -> bytes:
    """Call Fal.ai via REST API (no fal_client dependency). 60s timeout per attempt; retries on timeout/connection errors."""
    import requests
    key = os.environ.get("FAL_KEY")
    if not key:
        raise RuntimeError("FAL_KEY not set")
    endpoint = (
        "https://fal.run/fal-ai/realistic-vision"
        if model == "realistic-vision"
        else "https://fal.run/fal-ai/flux/dev"
    )
    if model == "realistic-vision":
        payload = {
            "prompt": prompt,
            "image_size": {"width": width, "height": height},
            "num_inference_steps": 35,
            "guidance_scale": 5,
            "format": "png",
        }
    else:
        payload = {
            "prompt": prompt,
            "image_size": {"width": width, "height": height},
            "num_inference_steps": 28,
            "guidance_scale": 3.5,
            "output_format": "png",
        }
    headers = {
        "Authorization": f"Key {key}",
        "Content-Type": "application/json",
    }
    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            resp = requests.post(endpoint, json=payload, headers=headers, timeout=60)
            resp.raise_for_status()
            result = resp.json()
            images = result.get("images", [])
            if not images:
                raise RuntimeError(f"Fal.ai returned no images: {result}")
            img = images[0]
            url = img.get("url") if isinstance(img, dict) else img
            if not url:
                raise RuntimeError(f"Fal.ai image has no url: {img}")
            img_resp = requests.get(url, timeout=30)
            img_resp.raise_for_status()
            return img_resp.content
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            last_error = e
            if attempt < max_retries:
                wait = attempt * 5  # 5s, 10s, 15s backoff
                print(f"  Retry {attempt}/{max_retries} after {wait}s ({type(e).__name__})...", file=sys.stderr)
                time.sleep(wait)
            else:
                raise
        except requests.exceptions.HTTPError as e:
            # Retry on 5xx, fail fast on 4xx
            if e.response is not None and 500 <= (e.response.status_code or 0) < 600:
                last_error = e
                if attempt < max_retries:
                    wait = attempt * 5
                    print(f"  Retry {attempt}/{max_retries} after {wait}s (HTTP {e.response.status_code})...", file=sys.stderr)
                    time.sleep(wait)
                else:
                    raise
            else:
                raise
    if last_error:
        raise last_error
    raise RuntimeError("Unexpected: no result after retries")


def call_hf_image(
    *,
    token: str,
    model: str,
    prompt: str,
    negative_prompt: str,
    width: int,
    height: int,
    timeout_sec: int = 240,
) -> bytes:
    url = f"https://router.huggingface.co/hf-inference/models/{model}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "negative_prompt": negative_prompt,
            "width": width,
            "height": height,
            "num_inference_steps": 30,
            "guidance_scale": 7.5,
        },
        "options": {"wait_for_model": True},
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            content_type = resp.headers.get("Content-Type", "")
            body = resp.read()
            if "application/json" in content_type:
                # Some model/API responses return JSON errors.
                data = json.loads(body.decode("utf-8", errors="replace"))
                raise RuntimeError(f"Hugging Face JSON response: {data}")
            return body
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HF API error {exc.code}: {detail}") from exc


# ---------------------------------------------------------------------------
# Narrative Editorial Image Strategy (see tools/blog-image-rules.md)
# - All people: Hispanic/Latino. Human-centric, narrative-driven.
# - Hero: Hispanic person in dramatic metaphorical setting.
# - Stories: 1 office shot (Hispanic professionals, Golden Hour); rest narrative events.
# - Every prompt: subject action + dynamic angles + cinematic lighting + editorial 8k.
# ---------------------------------------------------------------------------

# Technical modifiers (required for all prompts)
NARRATIVE_MODIFIERS = (
    "Low-angle hero shot, cinematic rim lighting, professional editorial photography, "
    "8k, high-end magazine aesthetic."
)


def _story_to_narrative(story_title: str) -> str:
    """Map story theme to narrative event with Hispanic person in active metaphor."""
    t = story_title.lower()
    if any(w in t for w in ("growth", "forecast", "sales", "grow", "increase")):
        return (
            "A Hispanic professional gardener in a futuristic vertical farm, harvesting thriving plants, "
            "reaching up toward sunlight, symbolizing growth and future."
        )
    if any(w in t for w in ("digital", "portal", "technology", "agent", "tools", "jd power")):
        return (
            "A Hispanic woman confidently navigating a large digital dashboard, fingers tracing data streams, "
            "interacting with holographic displays, clarity and insight metaphor."
        )
    if any(w in t for w in ("final expense", "funeral", "legacy", "death benefit")):
        return (
            "A Hispanic couple walking hand-in-hand through a dignified memorial garden, "
            "soft light through trees, symbolizing legacy, dignity, and family care."
        )
    if any(w in t for w in ("living benefits", "flexibility", "young", "millennial")):
        return (
            "A young Hispanic professional reaching toward a glowing financial horizon, "
            "dynamic movement, symbolizing adaptability and lifetime value."
        )
    if any(w in t for w in ("protection", "insurance", "coverage")):
        return (
            "A Hispanic professional inspecting a high-tech holographic shield, "
            "active security metaphor, symbolizing stability and protection."
        )
    # Default: Hispanic person in active professional moment
    return (
        "A Hispanic professional confidently leading through a glass-walled space, "
        "dynamic movement, wide-angle cinematic side-profile."
    )


def build_hero_prompt(week_label: str, topics: Iterable[str]) -> str:
    """Hero must feature Hispanic person in dramatic, metaphorical setting."""
    return (
        "A Hispanic man in hiking clothes standing on a mountain summit at dawn, looking toward a vast horizon, "
        "wearing outdoor hiking attire, windbreaker, hiking boots, dramatic metaphorical leadership. "
        f"{NARRATIVE_MODIFIERS}"
    )


def build_story_prompt(
    story_title: str,
    story_index: int,
    office_story_index: int,
) -> str:
    """
    Build narrative story prompt. Exactly one story gets 'office' treatment
    (Hispanic professionals, Golden Hour); all others are narrative events with Hispanic people.
    """
    if story_index == office_story_index:
        return (
            "Hispanic professionals in a modern office, Golden Hour light streaming through floor-to-ceiling windows, "
            "natural office glow, collaborative moment, professional editorial photography, 8k, high-end magazine aesthetic."
        )
    narrative = _story_to_narrative(story_title)
    return f"{narrative} {NARRATIVE_MODIFIERS}"


def write_image(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate hero + story images for weekly insurance blog posts."
    )
    parser.add_argument("--slug", required=True, help="Blog slug, e.g. weekly-insurance-update-2026-03-08")
    parser.add_argument("--week-label", required=True, help="Display week label, e.g. March 8, 2026")
    parser.add_argument(
        "--story",
        action="append",
        default=[],
        help="Story title (repeat for each article).",
    )
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"HF model id (default: {DEFAULT_MODEL})")
    parser.add_argument("--provider", choices=["hf", "fal"], default=None,
                        help="Image provider: hf (Hugging Face) or fal (Fal.ai). Auto-detect if not set.")
    parser.add_argument("--fal-model", choices=["realistic-vision", "flux"], default="realistic-vision",
                        help="Fal model: realistic-vision (photorealistic) or flux (default: realistic-vision)")
    parser.add_argument("--hero-width", type=int, default=1536)
    parser.add_argument("--hero-height", type=int, default=864)
    parser.add_argument("--story-width", type=int, default=1280)
    parser.add_argument("--story-height", type=int, default=720)
    parser.add_argument("--delay-ms", type=int, default=1200, help="Delay between generations.")
    parser.add_argument(
        "--office-story",
        type=int,
        default=2,
        help="Which story (1-based) gets the one office/desk scene (Hispanic professionals, Golden Hour). Default: 2.",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=4,
        help="Max retries per image on timeout/connection error. Default: 4.",
    )
    parser.add_argument(
        "--hero-only",
        action="store_true",
        help="Generate only the hero image (skip story images).",
    )
    return parser.parse_args()


def _gen_image(args, prompt: str, width: int, height: int, provider: str) -> bytes:
    if provider == "fal":
        return call_fal_image(
            prompt=prompt,
            width=width,
            height=height,
            model=getattr(args, "fal_model", "realistic-vision"),
            max_retries=getattr(args, "retries", 4),
        )
    return call_hf_image(
        token=os.getenv("HF_TOKEN"),
        model=args.model,
        prompt=prompt,
        negative_prompt=DEFAULT_NEGATIVE_PROMPT,
        width=width,
        height=height,
    )


def main() -> int:
    args = parse_args()

    # Auto-detect provider
    provider = args.provider
    if not provider:
        if os.getenv("FAL_KEY"):
            provider = "fal"
        elif os.getenv("HF_TOKEN"):
            provider = "hf"
        else:
            print("ERROR: Set FAL_KEY or HF_TOKEN, or use --provider fal|hf.", file=sys.stderr)
            return 1

    if provider == "hf" and not os.getenv("HF_TOKEN"):
        print("ERROR: HF_TOKEN required for --provider hf.", file=sys.stderr)
        return 1
    if provider == "fal" and not os.getenv("FAL_KEY"):
        print("ERROR: FAL_KEY required for --provider fal.", file=sys.stderr)
        return 1

    project_root = Path(__file__).resolve().parents[1]
    out_dir = project_root / "img" / "blog-generated" / args.slug
    out_dir.mkdir(parents=True, exist_ok=True)

    stories = args.story or ["Insurance industry weekly overview"]

    print(f"Generating images with provider: {provider}")
    print(f"Output folder: {out_dir}")

    # Hero image
    hero_prompt = build_hero_prompt(args.week_label, stories)
    hero_data = _gen_image(args, hero_prompt, args.hero_width, args.hero_height, provider)
    hero_path = out_dir / "hero.png"
    write_image(hero_path, hero_data)
    print(f"Saved hero: {hero_path}")
    if args.hero_only:
        print("\nDone (hero only).")
        return 0
    time.sleep(max(0, args.delay_ms) / 1000.0)

    # Story images (one office shot, rest narrative events)
    office_idx = max(1, min(args.office_story, len(stories)))
    for idx, title in enumerate(stories, start=1):
        prompt = build_story_prompt(title, idx, office_idx)
        story_data = _gen_image(args, prompt, args.story_width, args.story_height, provider)
        story_path = out_dir / f"story-{idx}.png"
        write_image(story_path, story_data)
        print(f"Saved story {idx}: {story_path}")
        time.sleep(max(0, args.delay_ms) / 1000.0)

    print("\nDone. Suggested blog image paths (for /blog/*.html files):")
    print(f"  ../img/blog-generated/{args.slug}/hero.png")
    for idx, _ in enumerate(stories, start=1):
        print(f"  ../img/blog-generated/{args.slug}/story-{idx}.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
