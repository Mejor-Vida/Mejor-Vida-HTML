#!/usr/bin/env python3
"""
Cartoonify a REAL photo of Julie. Preserves her actual appearance (age, body type).

No Flux—use a real photo so Julie stays Julie: 40, heavier set, belly.
Style transfer applies cartoon look without changing who she is.

Usage:
  python cartoonify_julie_photo.py [path/to/julie_photo.jpg]
  python cartoonify_julie_photo.py   # uses default: julie-photos-lora or julie_wave

Output: Desktop/lora-generated/julie_cartoon_from_photo.png

Requires: FAL_KEY
"""
import argparse
import os
import sys

output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
PHOTOS_FOLDER = os.path.join(output_folder, "julie-photos-lora")
JULIE_WAVE = os.path.join(output_folder, "julie_wave.jpg")


def find_default_photo():
    """Pick a real Julie photo: prefer full-body from training set."""
    if os.path.isdir(PHOTOS_FOLDER):
        for f in sorted(os.listdir(PHOTOS_FOLDER)):
            if f.lower().endswith((".jpg", ".jpeg", ".png")):
                return os.path.join(PHOTOS_FOLDER, f)
    if os.path.isfile(JULIE_WAVE):
        return JULIE_WAVE
    return None


def main():
    parser = argparse.ArgumentParser(description="Cartoonify a real photo of Julie (preserves age, body)")
    parser.add_argument("source", nargs="?", help="Path to Julie photo (default: from julie-photos-lora)")
    parser.add_argument("--style", default="cartoon_3d", choices=[
        "cartoon_3d", "cartoon_animation", "hand_drawn_animation", "animated_series"
    ], help="Cartoon style")
    parser.add_argument("-o", "--output", default="julie_cartoon_from_photo.png", help="Output filename")
    args = parser.parse_args()

    source = args.source or find_default_photo()
    if not source or not os.path.isfile(source):
        print("ERROR: No Julie photo found.", file=sys.stderr)
        print("  Pass a path: python cartoonify_julie_photo.py /path/to/julie.jpg", file=sys.stderr)
        print("  Or add photos to:", PHOTOS_FOLDER, file=sys.stderr)
        return 1

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY not set.", file=sys.stderr)
        return 1

    try:
        import fal_client
        import requests
    except ImportError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    os.makedirs(output_folder, exist_ok=True)

    print(f"Using real photo: {source}")
    print("  (Julie: 40, heavier set—this preserves her actual appearance)")
    print(f"Applying {args.style} style transfer...")

    photo_url = fal_client.upload_file(source)
    result = fal_client.subscribe(
        "fal-ai/image-apps-v2/style-transfer",
        arguments={
            "image_url": photo_url,
            "target_style": args.style,
        },
    )

    images = result.get("images", [])
    if not images:
        print("ERROR: Style transfer failed.", file=sys.stderr)
        return 1

    url = images[0].get("url") if isinstance(images[0], dict) else images[0]
    out_path = os.path.join(output_folder, args.output)
    resp = requests.get(url)
    if resp.status_code == 200:
        with open(out_path, "wb") as f:
            f.write(resp.content)
        print(f"✅ Saved: {out_path}")
        return 0

    print("ERROR: Failed to download.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
