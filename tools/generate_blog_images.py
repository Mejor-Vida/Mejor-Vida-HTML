#!/usr/bin/env python3
"""
Generate weekly blog images with Hugging Face Inference API.

Outputs:
  - Hero image
  - One image per story
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


DEFAULT_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"
DEFAULT_NEGATIVE_PROMPT = (
    "text, logo, watermark, signature, blurry, low quality, disfigured, distorted faces, "
    "brand names, trademark symbols"
)


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


def build_hero_prompt(week_label: str, topics: Iterable[str]) -> str:
    topic_text = ", ".join(topics[:4])
    return (
        f"Editorial hero image for a Spanish-language insurance weekly digest ({week_label}). "
        f"Topics: {topic_text}. Professional, trustworthy, optimistic, modern. "
        "Hispanic family-friendly visual tone, clean composition, natural lighting, no text in image."
    )


def build_story_prompt(story_title: str) -> str:
    return (
        f"Editorial news illustration for insurance article: {story_title}. "
        "Photorealistic style, professional, U.S. insurance context, clean composition, "
        "no text or logos in image."
    )


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
    parser.add_argument("--hero-width", type=int, default=1536)
    parser.add_argument("--hero-height", type=int, default=864)
    parser.add_argument("--story-width", type=int, default=1280)
    parser.add_argument("--story-height", type=int, default=720)
    parser.add_argument("--delay-ms", type=int, default=1200, help="Delay between generations.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    token = os.getenv("HF_TOKEN")
    if not token:
        print("ERROR: Missing HF_TOKEN environment variable.", file=sys.stderr)
        return 1

    project_root = Path(__file__).resolve().parents[1]
    out_dir = project_root / "img" / "blog-generated" / args.slug
    out_dir.mkdir(parents=True, exist_ok=True)

    stories = args.story or ["Insurance industry weekly overview"]

    print(f"Generating images with model: {args.model}")
    print(f"Output folder: {out_dir}")

    # Hero image
    hero_prompt = build_hero_prompt(args.week_label, stories)
    hero_data = call_hf_image(
        token=token,
        model=args.model,
        prompt=hero_prompt,
        negative_prompt=DEFAULT_NEGATIVE_PROMPT,
        width=args.hero_width,
        height=args.hero_height,
    )
    hero_path = out_dir / "hero.png"
    write_image(hero_path, hero_data)
    print(f"Saved hero: {hero_path}")
    time.sleep(max(0, args.delay_ms) / 1000.0)

    # Story images
    for idx, title in enumerate(stories, start=1):
        prompt = build_story_prompt(title)
        story_data = call_hf_image(
            token=token,
            model=args.model,
            prompt=prompt,
            negative_prompt=DEFAULT_NEGATIVE_PROMPT,
            width=args.story_width,
            height=args.story_height,
        )
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
