#!/usr/bin/env python3
"""
Generate Julie in 3D cartoon style using InstantID.

Uses Julie.png (real photo) + prompt to generate a NEW image with Julie's
identity preserved in 3D cartoon style. No face swap—InstantID bakes her
face into the generation for better identity preservation.

Requires: FAL_KEY
Output: img/julie_instantid_3d.png, Desktop/lora-generated/
"""
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JULIE_FACE = os.path.join(_project_root, "img", "Julie.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")

PROMPT = (
    "Professional woman, 40 years old, medium build, 3D cartoon animation style, "
    "standing in sunny park with trees and grass, teal blazer over white shirt, "
    "dark jeans, holding tablet, warm smile, vibrant colors, Pixar-style rendering"
)


def main():
    if not os.path.isfile(JULIE_FACE):
        print(f"ERROR: Julie face not found: {JULIE_FACE}", file=sys.stderr)
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

    print("Uploading Julie's face...")
    face_url = fal_client.upload_file(JULIE_FACE)
    print(f"Generating 3D cartoon with InstantID: {PROMPT[:60]}...")

    result = fal_client.subscribe(
        "fal-ai/instantid",
        arguments={
            "face_image_url": face_url,
            "prompt": PROMPT,
            "style": "Headshot",  # Or try "(No style)" for more control
            "identity_controlnet_conditioning_scale": 0.85,  # Stronger identity
            "ip_adapter_scale": 0.8,
            "num_inference_steps": 30,
            "guidance_scale": 5,
            "enhance_face_region": True,
        },
    )

    img = result.get("image", {})
    url = img.get("url") if isinstance(img, dict) else None
    if not url:
        print("ERROR: No image in result.", file=sys.stderr)
        return 1

    os.makedirs(output_folder, exist_ok=True)
    out_path = os.path.join(output_folder, "julie_instantid_3d.png")
    resp = requests.get(url)
    if resp.status_code == 200:
        with open(out_path, "wb") as f:
            f.write(resp.content)
        img_path = os.path.join(_project_root, "img", "julie_instantid_3d.png")
        with open(img_path, "wb") as f:
            f.write(resp.content)
        print(f"✅ Saved: {out_path}")
        print(f"✅ Saved: {img_path}")
        return 0

    print("ERROR: Failed to download.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
