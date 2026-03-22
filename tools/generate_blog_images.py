#!/usr/bin/env python3
"""
Generate weekly blog images with Hugging Face or Fal.ai.

Usage:
  HF_TOKEN=xxx python generate_blog_images.py --slug ... --provider hf
  FAL_KEY=xxx  python generate_blog_images.py --slug ... --provider fal

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
) -> bytes:
    import requests
    endpoint = "fal-ai/realistic-vision" if model == "realistic-vision" else "fal-ai/flux/dev"
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
    result = __import__("fal_client").subscribe(endpoint, arguments=payload)
    images = result.get("images", [])
    if not images:
        raise RuntimeError("Fal.ai returned no images")
    url = images[0].get("url") if isinstance(images[0], dict) else images[0]
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    return resp.content


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


# Realistic stock-photo style suffix for blog images
REALISTIC_SUFFIX = (
    "Professional stock photograph, photorealistic, editorial style, natural lighting, "
    "high resolution, 8k, clean composition, authentic, no text or logos."
)

def build_hero_prompt(week_label: str, topics: Iterable[str]) -> str:
    return (
        "Professional photograph of a Hispanic family—father, mother, and two children—with their "
        "Hispanic female insurance agent in a bright modern office, discussing life insurance. "
        "Warm trustworthy atmosphere, natural window light, not all looking at papers. "
        f"{REALISTIC_SUFFIX}"
    )


def build_story_prompt(story_title: str) -> str:
    return f"{story_title} {REALISTIC_SUFFIX}"


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
    return parser.parse_args()


def _gen_image(args, prompt: str, width: int, height: int, provider: str) -> bytes:
    if provider == "fal":
        return call_fal_image(prompt=prompt, width=width, height=height, model=getattr(args, "fal_model", "realistic-vision"))
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
    time.sleep(max(0, args.delay_ms) / 1000.0)

    # Story images
    for idx, title in enumerate(stories, start=1):
        prompt = build_story_prompt(title)
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
