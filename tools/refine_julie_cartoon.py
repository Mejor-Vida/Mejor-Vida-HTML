#!/usr/bin/env python3
"""
Add subtle realism to Julie cartoon—more detail and features, but not fully photorealistic.

Input: julie-cartoon-with-face-v1-master.png (or --input path)
Output: julie_cartoon_refined.png

Methods:
  face_enhance: Enhances facial features (eyes, skin) - adds detail to face only
  upscale: Creative upscaler with detail=2, high shape preservation - sharpens/adds detail
  realism: Low lora_scale for subtle face texture (can go too real)

Requires: FAL_KEY
"""
import argparse
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER_IMAGE = os.path.join(_project_root, "img", "julie-master", "julie-cartoon-with-face-v1-master.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")


def main():
    parser = argparse.ArgumentParser(description="Add subtle realism to Julie cartoon")
    parser.add_argument("--input", default=MASTER_IMAGE, help="Input image path")
    parser.add_argument("-o", "--output", default="julie_cartoon_refined.png", help="Output filename")
    parser.add_argument("--method", default="face_enhance", choices=["face_enhance", "upscale", "realism"],
        help="face_enhance: face detail. upscale: sharpness/detail. realism: subtle texture")
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

    print(f"Input: {args.input}")
    print(f"Method: {args.method} — more detail, not fully real...")

    image_url = fal_client.upload_file(args.input)

    if args.method == "face_enhance":
        result = fal_client.subscribe(
            "fal-ai/image-editing/face-enhancement",
            arguments={"image_url": image_url},
        )
        images = result.get("images", [])
    elif args.method == "upscale":
        result = fal_client.subscribe(
            "fal-ai/creative-upscaler",
            arguments={
                "image_url": image_url,
                "detail": 2,
                "shape_preservation": 0.8,
                "creativity": 0.2,
                "scale": 1.5,
            },
        )
        img = result.get("image", {})
        images = [img] if img else []
    elif args.method == "realism":
        result = fal_client.subscribe(
            "fal-ai/image-editing/realism",
            arguments={"image_url": image_url, "lora_scale": 0.2},
        )
        images = result.get("images", [])

    if not images:
        print("ERROR: Refinement failed.", file=sys.stderr)
        return 1

    img0 = images[0]
    url = img0.get("url") if isinstance(img0, dict) else img0
    out_path = os.path.join(output_folder, args.output)
    resp = requests.get(url)
    if resp.status_code == 200:
        with open(out_path, "wb") as f:
            f.write(resp.content)
        # Also copy to img/
        img_path = os.path.join(_project_root, "img", args.output)
        with open(img_path, "wb") as f:
            f.write(resp.content)
        print(f"✅ Saved: {out_path}")
        print(f"✅ Saved: {img_path}")
        return 0

    print("ERROR: Failed to download.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
