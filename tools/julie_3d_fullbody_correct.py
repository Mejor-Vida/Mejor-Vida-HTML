#!/usr/bin/env python3
"""
Julie LoRA 3D → full body with correct body type.

IMPORTANT: Uses img/julie_lora_3d.png as the face reference—that image defines Julie's face.
Body: 5'1\", 145 lbs, fuller figure, a little heavy, not skinny, not pregnant.
Pipeline:
  1. Generate 3D full body base (Pixar style) with that body type
  2. Face swap julie_lora_3d.png onto it (preserves her face)

Requires: FAL_KEY
Output: img/julie_lora_3d_fullbody.png, Desktop/lora-generated/
"""
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JULIE_3D = os.path.join(_project_root, "img", "julie_lora_3d.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
OUTPUT_NAME = "julie_lora_3d_fullbody.png"

BODY_PROMPT = (
    "Pixar style 3D animation, full body visible, woman standing in sunny park, "
    "petite 5'1, 145 lbs, medium build, average weight, normal proportions, not obese, not fat, "
    "teal blazer over white shirt, dark jeans, holding tablet, "
    "trees and grass, city skyline in background, vibrant colors"
)


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
    if not os.path.isfile(JULIE_3D):
        print(f"ERROR: julie_lora_3d.png not found: {JULIE_3D}", file=sys.stderr)
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
    body_path = os.path.join(output_folder, "julie_3d_body_base.png")

    print("Step 1: Generating 3D full body (5'1\", 145 lbs, petite, a little heavy)...")
    result = fal_client.subscribe(
        "fal-ai/flux-lora",
        arguments={
            "prompt": BODY_PROMPT,
            "image_size": "portrait_4_3",
            "num_inference_steps": 28,
            "guidance_scale": 3.5,
        },
    )
    images = result.get("images", [])
    if not images:
        print("ERROR: Generation failed.", file=sys.stderr)
        return 1
    body_url = images[0].get("url") if isinstance(images[0], dict) else images[0]
    resp = requests.get(body_url)
    if resp.status_code != 200:
        print("ERROR: Failed to download body.", file=sys.stderr)
        return 1
    with open(body_path, "wb") as f:
        f.write(resp.content)
    print(f"  Saved body base: {body_path}")

    # Apply cartoon_3d to ensure Pixar style
    print("  Applying Pixar style to body...")
    body_url = fal_client.upload_file(body_path)
    style_result = fal_client.subscribe(
        "fal-ai/image-apps-v2/style-transfer",
        arguments={"image_url": body_url, "target_style": "cartoon_3d"},
    )
    style_images = style_result.get("images", [])
    if style_images:
        style_url = style_images[0].get("url") if isinstance(style_images[0], dict) else style_images[0]
        resp2 = requests.get(style_url)
        if resp2.status_code == 200:
            with open(body_path, "wb") as f:
                f.write(resp2.content)
            body_url = fal_client.upload_file(body_path)

    print("Step 2: Face swap Julie's face from julie_lora_3d onto body...")
    face_url = fal_client.upload_file(JULIE_3D)
    swap_result = fal_client.subscribe(
        "fal-ai/face-swap",
        arguments={
            "swap_image_url": face_url,
            "base_image_url": body_url,
        },
    )
    img = swap_result.get("image")
    url = img.get("url") if isinstance(img, dict) else None
    if not url:
        print("ERROR: Face swap failed.", file=sys.stderr)
        return 1

    out_path = os.path.join(output_folder, OUTPUT_NAME)
    img_path = os.path.join(_project_root, "img", OUTPUT_NAME)
    download_image(url, out_path)
    download_image(url, img_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
