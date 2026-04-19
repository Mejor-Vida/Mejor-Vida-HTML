#!/usr/bin/env python3
"""
Put Julie's ACTUAL face on the 3D cartoon body.

Uses Julie.png (real photo) as face source for best likeness preservation.
Face swap APIs work best with real photos—LoRA/cartoon faces often lose identity.

Pipeline:
  1. Try Replicate face swap (cdingram/face-swap) - works well with illustrations
  2. Fallback: fal.ai half-moon-ai if available

Requires: REPLICATE_API_TOKEN (or FAL_KEY for fal fallback)
Output: img/julie_final_cartoon.png, Desktop/lora-generated/
"""
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JULIE_FACE = os.path.join(_project_root, "img", "Julie.png")
BODY_3D = os.path.join(_project_root, "img", "julie_cartoon_body_target.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")


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


def face_swap_replicate():
    """Replicate cdingram/face-swap - works with cartoon/illustration targets."""
    try:
        import replicate
    except ImportError:
        return None
    if not os.environ.get("REPLICATE_API_TOKEN"):
        return None

    # Replicate accepts file objects - they get uploaded automatically
    with open(JULIE_FACE, "rb") as swap_f, open(BODY_3D, "rb") as target_f:
        output = replicate.run(
            "cdingram/face-swap:d1d6ea8c8be89d664a07a457526f7128109dee7030fdac424788d762c71ed111",
            input={
                "swap_image": swap_f,
                "input_image": target_f,
            },
        )
    # Output can be a FileOutput with .url or a string URL
    if hasattr(output, "url"):
        return output.url()
    if isinstance(output, str) and output.startswith("http"):
        return output
    return None


def face_swap_fal():
    """fal.ai face swap (fal-ai/face-swap)."""
    try:
        import fal_client
    except ImportError:
        return None
    if not os.environ.get("FAL_KEY"):
        return None

    face_url = fal_client.upload_file(JULIE_FACE)
    body_url = fal_client.upload_file(BODY_3D)
    result = fal_client.subscribe(
        "fal-ai/face-swap",
        arguments={
            "swap_image_url": face_url,   # Julie's face (source)
            "base_image_url": body_url,   # 3D body (target)
        },
    )
    img = result.get("image")
    return img.get("url") if isinstance(img, dict) else None


def face_swap_julie_on_3d():
    """Swap Julie's real face onto the 3D body. Uses Julie.png for best likeness."""
    if not os.path.isfile(JULIE_FACE):
        print(f"ERROR: Julie face not found: {JULIE_FACE}", file=sys.stderr)
        return None
    if not os.path.isfile(BODY_3D):
        print(f"ERROR: 3D body not found: {BODY_3D}", file=sys.stderr)
        return None

    print("Using Julie.png (real photo) as face source for best likeness...")
    print("Target: 3D body (teal blazer, park, tablet)")

    url = None
    # Try fal.ai first (fal-ai/face-swap - works with Julie.png on 3D body)
    if os.environ.get("FAL_KEY"):
        try:
            print("Trying fal.ai face swap...")
            url = face_swap_fal()
        except Exception as e:
            print(f"  fal.ai failed: {e}")
    # Fallback to Replicate (needs billing credits)
    if not url and os.environ.get("REPLICATE_API_TOKEN"):
        try:
            print("Trying Replicate face swap...")
            url = face_swap_replicate()
        except Exception as e:
            print(f"  Replicate failed: {e}")

    if url:
        os.makedirs(output_folder, exist_ok=True)
        out_path = os.path.join(output_folder, "julie_final_cartoon.png")
        path = download_image(url, out_path)
        if path:
            img_path = os.path.join(_project_root, "img", "julie_final_cartoon.png")
            download_image(url, img_path)
            return path

    print("ERROR: Face swap failed. Set REPLICATE_API_TOKEN or FAL_KEY.", file=sys.stderr)
    return None


if __name__ == "__main__":
    if not os.environ.get("REPLICATE_API_TOKEN") and not os.environ.get("FAL_KEY"):
        print("ERROR: Set REPLICATE_API_TOKEN or FAL_KEY (e.g. in .env.local)", file=sys.stderr)
        sys.exit(1)

    result = face_swap_julie_on_3d()
    sys.exit(0 if result else 1)
