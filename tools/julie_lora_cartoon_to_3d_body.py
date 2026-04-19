#!/usr/bin/env python3
"""
Turn Julie LoRA cartoon into a 3D full body image.

Takes julie_lora_cartoon.png (Julie's cartoon face) and puts it on the 3D body
(julie_cartoon_body_target.png) via face swap. Result: 3D full body with Julie's LoRA face.

Requires: FAL_KEY
Output: img/julie_lora_3d_fullbody.png, Desktop/lora-generated/
"""
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LORA_CARTOON = os.path.join(_project_root, "img", "julie_lora_cartoon.png")
BODY_3D = os.path.join(_project_root, "img", "julie_cartoon_body_target.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
OUTPUT_NAME = "julie_lora_3d_fullbody.png"


def download_image(url, filepath):
    try:
        import requests
    except ImportError:
        print("ERROR: pip install requests", file=sys.stderr)
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
    if not os.path.isfile(LORA_CARTOON):
        print(f"ERROR: julie_lora_cartoon.png not found: {LORA_CARTOON}", file=sys.stderr)
        return 1
    if not os.path.isfile(BODY_3D):
        print(f"ERROR: 3D body not found: {BODY_3D}", file=sys.stderr)
        return 1
    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY not set.", file=sys.stderr)
        return 1

    try:
        import fal_client
    except ImportError:
        print("ERROR: pip install fal-client", file=sys.stderr)
        return 1

    print("Julie LoRA cartoon → 3D full body")
    print("  Face: julie_lora_cartoon.png")
    print("  Body: julie_cartoon_body_target.png (3D, teal blazer, park, tablet)")
    face_url = fal_client.upload_file(LORA_CARTOON)
    body_url = fal_client.upload_file(BODY_3D)

    result = fal_client.subscribe(
        "fal-ai/face-swap",
        arguments={
            "swap_image_url": face_url,
            "base_image_url": body_url,
        },
    )
    img = result.get("image")
    url = img.get("url") if isinstance(img, dict) else None
    if not url:
        print("ERROR: Face swap failed.", file=sys.stderr)
        return 1

    os.makedirs(output_folder, exist_ok=True)
    out_path = os.path.join(output_folder, OUTPUT_NAME)
    img_path = os.path.join(_project_root, "img", OUTPUT_NAME)
    download_image(url, out_path)
    download_image(url, img_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
