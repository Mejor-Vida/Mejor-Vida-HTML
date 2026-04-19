#!/usr/bin/env python3
"""
Put a face/upper-body image onto a full body. No LoRA—uses the image you provide.

Input: Your image (face reference)
Output: Full body with your face on it

Body: 5'1", 145 lbs, medium build, average weight, not obese.
Requires: FAL_KEY
Output: img/julie_on_body.png, Desktop/lora-generated/
"""
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_FACE = os.path.join(_project_root, "img", "julie_face_reference.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
OUTPUT_NAME = "julie_on_body.png"

BODY_PROMPT = (
    "Pixar style 3D animation, full body visible, woman standing in sunny park, "
    "5'1, 145 lbs, medium build, soft body, not skinny, not thin, a little heavy, not obese, "
    "gray cardigan over navy t-shirt, dark jeans, holding tablet, "
    "trees and grass, city skyline in background, vibrant colors"
)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Put your image on a full body")
    parser.add_argument("input", nargs="?", default=DEFAULT_FACE, help="Face/upper-body image path")
    parser.add_argument("-o", "--output", default=OUTPUT_NAME, help="Output filename")
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"ERROR: Input not found: {args.input}", file=sys.stderr)
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
    body_path = os.path.join(output_folder, "body_base_temp.png")

    print("Step 1: Generating 3D full body...")
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

    print("Step 2: Putting your face on the body...")
    face_url = fal_client.upload_file(args.input)
    swap_result = fal_client.subscribe(
        "fal-ai/face-swap",
        arguments={"swap_image_url": face_url, "base_image_url": body_url},
    )
    img = swap_result.get("image")
    url = img.get("url") if isinstance(img, dict) else None
    if not url:
        print("ERROR: Face swap failed.", file=sys.stderr)
        return 1

    out_path = os.path.join(output_folder, args.output)
    img_path = os.path.join(_project_root, "img", args.output)
    resp3 = requests.get(url)
    if resp3.status_code == 200:
        with open(out_path, "wb") as f:
            f.write(resp3.content)
        with open(img_path, "wb") as f:
            f.write(resp3.content)
        print(f"✅ Saved: {img_path}")
        return 0

    print("ERROR: Failed to download result.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
