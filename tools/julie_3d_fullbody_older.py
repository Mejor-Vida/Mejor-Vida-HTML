#!/usr/bin/env python3
"""
Extend Julie's Pixar 3D image to full body and make her appear a little older.

Pipeline:
  1. Face-to-full-portrait: julie_lora_3d.png → full body, woman in 40s
  2. Style transfer: cartoon_3d to keep Pixar look (if step 1 goes photorealistic)

Requires: FAL_KEY
Output: img/julie_lora_3d_fullbody.png, Desktop/lora-generated/
"""
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_IMG = os.path.join(_project_root, "img", "julie_lora_3d.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
OUTPUT_NAME = "julie_lora_3d_fullbody.png"


def download_image(url, filepath):
    try:
        import requests
    except ImportError:
        return None
    resp = requests.get(url)
    if resp.status_code == 200:
        os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(resp.content)
        print(f"✅ Saved: {filepath}")
        return filepath
    return None


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

    prompt = (
        "Pixar style 3D animation, full body visible, standing in sunny urban park, "
        "woman in her early 40s, mature features, warm smile, "
        "teal blazer over white shirt, dark jeans, holding tablet, "
        "trees and grass in background, vibrant colors, high quality 3D render"
    )

    print("Step 1: Extending to full body (older, 40s)...")
    img_url = fal_client.upload_file(INPUT_IMG)
    result = fal_client.subscribe(
        "fal-ai/flux-2-lora-gallery/face-to-full-portrait",
        arguments={
            "image_urls": [img_url],
            "prompt": prompt,
            "image_size": "portrait_4_3",
            "guidance_scale": 2.5,
            "num_inference_steps": 40,
        },
    )

    images = result.get("images", [])
    if not images:
        print("ERROR: Face-to-portrait failed.", file=sys.stderr)
        return 1

    url = images[0].get("url") if isinstance(images[0], dict) else images[0]
    os.makedirs(output_folder, exist_ok=True)
    out_path = os.path.join(output_folder, OUTPUT_NAME)
    img_path = os.path.join(_project_root, "img", OUTPUT_NAME)

    resp = requests.get(url)
    if resp.status_code != 200:
        print("ERROR: Failed to download.", file=sys.stderr)
        return 1

    with open(out_path, "wb") as f:
        f.write(resp.content)
    with open(img_path, "wb") as f:
        f.write(resp.content)
    print(f"✅ Saved: {out_path}")
    print(f"✅ Saved: {img_path}")

    # Step 2: If result looks photorealistic, apply cartoon_3d to keep Pixar style
    print("Step 2: Applying Pixar style (cartoon_3d)...")
    portrait_url = fal_client.upload_file(img_path)
    style_result = fal_client.subscribe(
        "fal-ai/image-apps-v2/style-transfer",
        arguments={
            "image_url": portrait_url,
            "target_style": "cartoon_3d",
        },
    )
    style_images = style_result.get("images", [])
    if style_images:
        style_url = style_images[0].get("url") if isinstance(style_images[0], dict) else style_images[0]
        resp2 = requests.get(style_url)
        if resp2.status_code == 200:
            with open(out_path, "wb") as f:
                f.write(resp2.content)
            with open(img_path, "wb") as f:
                f.write(resp2.content)
            print(f"✅ Updated with Pixar style: {img_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
