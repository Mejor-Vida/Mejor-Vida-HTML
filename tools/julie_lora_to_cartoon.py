#!/usr/bin/env python3
"""
Step 3: LoRA-generated Julie → image-to-image with cartoon reference.

Takes the realistic Julie (from face LoRA) and applies cartoon style/body
from the reference image using style transfer.

Usage:
  python julie_lora_to_cartoon.py [input.png]
  python julie_lora_to_cartoon.py   # uses julie_face_lora_test.png or generates fresh
"""
import argparse
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
CARTOON_REF = os.path.join(_project_root, "img", "julie_cartoon_body_reference.png")


def main():
    parser = argparse.ArgumentParser(description="LoRA Julie → cartoon via style reference")
    parser.add_argument("input", nargs="?", help="LoRA-generated image (default: julie_face_lora_test.png)")
    parser.add_argument("-o", "--output", default="julie_lora_cartoon.png", help="Output filename")
    args = parser.parse_args()

    input_path = args.input or os.path.join(output_folder, "julie_face_lora_test.png")
    if not os.path.isfile(input_path):
        print(f"ERROR: Input not found: {input_path}", file=sys.stderr)
        print("  Generate first: python generate_julie_base.py -o julie_face_lora_test.png", file=sys.stderr)
        return 1

    if not os.path.isfile(CARTOON_REF):
        print(f"ERROR: Cartoon reference not found: {CARTOON_REF}", file=sys.stderr)
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

    print(f"Input: {input_path}")
    print(f"Style reference: {CARTOON_REF}")
    print("Applying cartoon style from reference...")

    image_url = fal_client.upload_file(input_path)
    style_url = fal_client.upload_file(CARTOON_REF)

    result = fal_client.subscribe(
        "fal-ai/image-apps-v2/style-transfer",
        arguments={
            "image_url": image_url,
            "style_reference_image_url": style_url,  # cartoon body as style source
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
