#!/usr/bin/env python3
"""
Create the first image for March 8 blog post and Facebook post.

Uses fal-ai/flux-kontext-lora: background image + both Julie LoRAs (cartoon + face) + prompt to generate
Julie_mv in the scene (back to camera, fire hose, water) — no manual compositing.

Output: img/blog-generated/weekly-insurance-update-2026-03-08/clip1_firefighter.png

Requires: FAL_KEY, Pillow (pip install Pillow)
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = PROJECT_ROOT / "img"
OUTPUT_DIR = IMG_DIR / "blog-generated" / "weekly-insurance-update-2026-03-08"
BACKGROUND_PATH = OUTPUT_DIR / "fire-background.png"
HOSE_REFERENCE_PATH = OUTPUT_DIR / "hose-reference.png"  # ChatGPT Image Mar 18, 2026
LOGO_PATH = IMG_DIR / "logo-spanish2.png"
CURSOR_IMAGES_DIR = Path.home() / "Desktop" / "Cursor Images"

# Julie_mv LoRAs — from fal.ai playground (flux-lora avatar config)
JULIE_LORA_1_URL = "https://v3b.fal.media/files/b/0a925536/RHegJvtMgrEO-MAGflVv2_pytorch_lora_weights.safetensors"
JULIE_LORA_2_URL = "https://v3b.fal.media/files/b/0a91d18b/aGMqlhgegjqfypTEXMGpc_lora.safetensors"
JULIE_LORA_1_SCALE = 0.65
JULIE_LORA_2_SCALE = 0.7
JULIE_SEED = 5508769720964102000  # from julie-avatar-reference.json


def _copy_to_cursor_images(path: Path) -> None:
    """Copy image to Desktop/Cursor Images."""
    import shutil
    CURSOR_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    copy_path = CURSOR_IMAGES_DIR / path.name
    shutil.copy2(path, copy_path)
    print(f"   Copy: {copy_path}")


# Load .env.local
_env = PROJECT_ROOT / ".env.local"
if _env.exists():
    for line in _env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def generate_with_kontext_lora() -> Path:
    """Generate Julie_mv in scene via fal-ai/flux-kontext-lora: background + both LoRAs + prompt."""
    if not os.environ.get("FAL_KEY"):
        raise RuntimeError("FAL_KEY not set. Add to .env.local")

    try:
        import fal_client
        import requests
    except ImportError as e:
        raise RuntimeError(f"Install: pip install fal-client requests. {e}") from e

    print("🎨 Generating with flux-kontext-lora (background + both Julie LoRAs + prompt)...")
    # Use fire background; if hose reference exists, we describe it in the prompt
    bg_url = fal_client.upload_file(str(BACKGROUND_PATH))

    # Both LoRAs from fal.ai playground (flux-lora avatar config)
    loras = [
        {"path": JULIE_LORA_1_URL, "scale": JULIE_LORA_1_SCALE},
        {"path": JULIE_LORA_2_URL, "scale": JULIE_LORA_2_SCALE},
    ]
    print(f"   LoRA 1: scale={JULIE_LORA_1_SCALE}")
    print(f"   LoRA 2: scale={JULIE_LORA_2_SCALE}")

    # Prompt: Julie_mv correct (2 hands), hose connected to nozzle, straight to edge
    prompt = (
        "julie_mv, woman, female character. She appears VERY far from the camera, tiny and distant. "
        "Her feet are positioned right next to the flames in the BACKGROUND. "
        "NO fire in the foreground. Long stretch of clear asphalt road between camera and her. "
        "Back to camera, facing the wildfire. "
        "julie_mv holds the hose nozzle with BOTH hands down at her waist. Nozzle held low, at waist level. "
        "A stream of water sprays out of the nozzle toward the fire. Powerful water stream from the hose. "
        "ONE single hose. The hose connects to the nozzle and runs in one straight line to the edge of the image. "
        "No coils. No loops. No tangles. One straight hose from nozzle to picture edge. "
        "Heavy-duty black water nozzle with pistol grip, large silver coupling. Bright yellow ribbed hose. "
        "julie_mv body: blocky, wide rectangular upper-torso, very broad shoulders, wide straight waist, "
        "top-heavy, thick frame tapering to very thin skinny legs. Woman in navy blue business suit. "
        "Style: 3D Pixar-style, clean cartoon, smooth matte surfaces, simple features, no realism. "
        "Cinematic lighting. Extreme wide shot: camera far back, long empty road, julie_mv tiny at background fire."
    )

    result = fal_client.subscribe(
        "fal-ai/flux-kontext-lora",
        arguments={
            "image_url": bg_url,
            "prompt": prompt,
            "loras": loras,
            "seed": JULIE_SEED,
            "num_inference_steps": 30,
            "guidance_scale": 2,
            "resolution_mode": "auto",  # often faster than match_input
            "acceleration": "high",
        },
        with_logs=True,
    )

    images = result.get("images", result.get("image", []))
    if isinstance(images, dict):
        images = [images]
    url = images[0].get("url") if isinstance(images[0], dict) else images[0]

    out_path = OUTPUT_DIR / "clip1_firefighter_base.png"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    r = requests.get(url, timeout=60)
    if r.status_code != 200:
        raise RuntimeError(f"Failed to download: {r.status_code}")
    out_path.write_bytes(r.content)
    print(f"   Saved: {out_path}")
    _copy_to_cursor_images(out_path)
    return out_path


def add_title_overlay(
    image_path: Path,
    logo_path: Path,
    output_path: Path,
    date_str: str = "March 8, 2026",
) -> None:
    """Add title overlay (Weekly Insurance Blog, date, Mejor Vida Seguros, logo) to image."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        raise RuntimeError("Install: pip install Pillow") from None

    bg = Image.open(image_path).convert("RGBA")
    w, h = bg.size

    # Title bar at BOTTOM so Julie's head is never covered (head stays in clear upper area)
    bar_h = int(h * 0.24)
    overlay = Image.new("RGBA", (w, bar_h), (0, 0, 0, 180))
    bg.paste(overlay, (0, h - bar_h), overlay)

    draw = ImageDraw.Draw(bg)

    # Fancier fonts
    font_paths = [
        "/System/Library/Fonts/Supplemental/Baskerville.ttc",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    font_title = font_sub = None
    for fp in font_paths:
        try:
            font_title = ImageFont.truetype(fp, max(36, bar_h // 3))
            font_sub = ImageFont.truetype(fp, max(24, bar_h // 5))
            break
        except OSError:
            continue
    if font_title is None:
        font_title = font_sub = ImageFont.load_default()

    # Title at bottom: "Weekly Insurance Blog", date, "Mejor Vida Seguros" (centered in bar)
    bar_top = h - bar_h
    draw.text((w // 2, bar_top + bar_h // 4), "Weekly Insurance Blog", fill="white", font=font_title, anchor="mm")
    draw.text((w // 2, bar_top + bar_h // 2), date_str, fill="white", font=font_sub, anchor="mm")
    draw.text((w // 2, bar_top + bar_h * 3 // 4), "Mejor Vida Seguros", fill="white", font=font_sub, anchor="mm")

    # Mejor Vida Insurance logo: LARGER, prominent (bottom-right, overlaps bar)
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        logo_h = max(180, int(h * 0.22))  # ~22% of image height, min 180px
        logo.thumbnail((700, logo_h), Image.Resampling.LANCZOS)
        lw, lh = logo.size
        bg.paste(logo, (w - lw - 40, h - lh - 40), logo)

    bg.convert("RGB").save(output_path, "PNG", quality=95)
    print(f"✅ Saved: {output_path}")
    _copy_to_cursor_images(output_path)


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(
        description="Create March 8 blog/Facebook image via flux-kontext-lora (background + LoRA + prompt)"
    )
    parser.add_argument("--base", type=Path, help="Path to base image (skip kontext generation)")
    parser.add_argument("--skip-generate", action="store_true", help="Use existing clip1_firefighter_base.png if present")
    args = parser.parse_args()

    if not BACKGROUND_PATH.exists():
        print(f"ERROR: Background not found: {BACKGROUND_PATH}", file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    base_path = args.base or (OUTPUT_DIR / "clip1_firefighter_base.png")

    if args.base:
        base_path = args.base.resolve()
        if not base_path.exists():
            print(f"ERROR: Base image not found: {base_path}", file=sys.stderr)
            return 1
        print(f"   Using: {base_path}")
    elif base_path.exists() and args.skip_generate:
        print(f"   Using existing: {base_path}")
    else:
        try:
            base_path = generate_with_kontext_lora()
        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            return 1

    output_path = OUTPUT_DIR / "clip1_firefighter.png"
    add_title_overlay(base_path, LOGO_PATH, output_path, date_str="March 8, 2026")
    return 0


if __name__ == "__main__":
    sys.exit(main())
