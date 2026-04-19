#!/usr/bin/env python3
"""
Swap Julie's real face onto a cartoon avatar.

Takes a cartoon image and replaces the face with Julie's face from Julie.png.
Tries multiple face-swap endpoints for best results.

Endpoints: half-moon-ai (primary), easel-ai (fallback)
Requires: FAL_KEY
Output: Desktop/lora-generated/
"""
import os
import sys

try:
    import fal_client
except ImportError:
    fal_client = None

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JULIE_FACE = os.path.join(_project_root, "img", "Julie.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")


def download_image(url, filepath):
    try:
        import requests
    except ImportError:
        print("ERROR: pip install requests", file=sys.stderr)
        return None
    resp = requests.get(url)
    if resp.status_code == 200:
        with open(filepath, "wb") as f:
            f.write(resp.content)
        print(f"✅ Saved: {filepath}")
        return filepath
    return None


def _try_fal_face_swap(face_url, target_url):
    """fal-ai/face-swap - works with Julie.png on cartoon/3D targets."""
    return fal_client.subscribe(
        "fal-ai/face-swap",
        arguments={
            "swap_image_url": face_url,
            "base_image_url": target_url,
        },
    )


def _try_easel(face_url, target_url, preserve_target_style=True):
    """Easel AI face swap. target_hair preserves cartoon/illustration style."""
    return fal_client.subscribe(
        "easel-ai/advanced-face-swap",
        arguments={
            "face_image_0": face_url,
            "target_image": target_url,
            "gender_0": "female",
            "workflow_type": "target_hair" if preserve_target_style else "user_hair",
            "upscale": True,
        },
    )


def face_swap_julie(target_image_path, output_name="julie_face_swapped.png", face_source=None):
    """Swap face from face_source onto target. Default face_source: Julie.png"""
    face_path = face_source or JULIE_FACE
    if not os.path.isfile(face_path):
        print(f"ERROR: Face source not found: {face_path}", file=sys.stderr)
        return None
    if not os.path.isfile(target_image_path):
        print(f"ERROR: Target image not found: {target_image_path}", file=sys.stderr)
        return None

    if fal_client is None:
        print("ERROR: pip install fal-client", file=sys.stderr)
        return None

    print("Uploading images...")
    face_url = fal_client.upload_file(face_path)
    target_url = fal_client.upload_file(target_image_path)

    # Try fal-ai/face-swap first, then Easel with target_hair for cartoon
    for name, fn in [
        ("fal-ai/face-swap", lambda: _try_fal_face_swap(face_url, target_url)),
        ("easel-ai (target_hair)", lambda: _try_easel(face_url, target_url, preserve_target_style=True)),
    ]:
        try:
            print(f"Trying {name} face swap...")
            result = fn()
            img = result.get("image")
            url = img.get("url") if isinstance(img, dict) else None
            if url:
                os.makedirs(output_folder, exist_ok=True)
                out_path = os.path.join(output_folder, output_name)
                return download_image(url, out_path)
        except Exception as e:
            print(f"  {name} failed: {e}")
            continue

    print("ERROR: All face swap endpoints failed.", file=sys.stderr)
    return None


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Swap Julie's face onto a cartoon image")
    parser.add_argument("target", nargs="?", default=os.path.join(_project_root, "img", "julie_cartoon_base.png"),
                       help="Path to target body image")
    parser.add_argument("--face", default=None, help="Face source image (default: Julie.png)")
    parser.add_argument("-o", "--output", default="julie_face_swapped.png", help="Output filename")
    args = parser.parse_args()

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY not set.", file=sys.stderr)
        sys.exit(1)

    face_swap_julie(args.target, args.output, face_source=args.face)
