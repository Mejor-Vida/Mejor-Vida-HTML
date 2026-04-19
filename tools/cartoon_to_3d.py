#!/usr/bin/env python3
"""
Convert 2D cartoon to Pixar-style 3D render.

Uses target_style="cartoon_3d" preset (Pixar-like 3D animation) instead of
reference-based transfer—preserves quality and composition.

Requires: FAL_KEY
Output: img/julie_lora_3d.png, Desktop/lora-generated/
"""
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_IMG = os.path.join(_project_root, "img", "julie_lora_cartoon.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
OUTPUT_NAME = "julie_lora_3d.png"


def main():
    if not os.path.isfile(INPUT_IMG):
        print(f"ERROR: Input not found: {INPUT_IMG}", file=sys.stderr)
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

    print("Converting 2D cartoon → Pixar-style 3D")
    print(f"  Input: {os.path.basename(INPUT_IMG)}")
    print("  Style: cartoon_3d (Pixar preset)")
    image_url = fal_client.upload_file(INPUT_IMG)

    result = fal_client.subscribe(
        "fal-ai/image-apps-v2/style-transfer",
        arguments={
            "image_url": image_url,
            "target_style": "cartoon_3d",  # Pixar-style 3D, preserves quality
        },
    )

    images = result.get("images", [])
    if not images:
        print("ERROR: Style transfer failed.", file=sys.stderr)
        return 1

    url = images[0].get("url") if isinstance(images[0], dict) else images[0]
    os.makedirs(output_folder, exist_ok=True)
    out_path = os.path.join(output_folder, OUTPUT_NAME)
    img_path = os.path.join(_project_root, "img", OUTPUT_NAME)
    resp = requests.get(url)
    if resp.status_code == 200:
        with open(out_path, "wb") as f:
            f.write(resp.content)
        with open(img_path, "wb") as f:
            f.write(resp.content)
        print(f"✅ Saved: {out_path}")
        print(f"✅ Saved: {img_path}")
        return 0

    print("ERROR: Failed to download.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
