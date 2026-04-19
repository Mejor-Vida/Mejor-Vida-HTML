#!/usr/bin/env python3
"""
Generate Julie avatars with her REAL face using Face-to-Full-Portrait.

Uses Julie.png as input - the model extends her actual face into a full-body
portrait. Result: Julie's real face on a generated body (no cartoon face swap).

Endpoint: fal-ai/flux-2-lora-gallery/face-to-full-portrait
Requires: FAL_KEY
Output: Desktop/lora-generated/
"""
import os
import sys

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
        os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(resp.content)
        print(f"✅ Saved: {filepath}")
        return filepath
    return None


def julie_face_to_portrait(prompt=None, output_name="julie_portrait.png"):
    """Extend Julie's real face into a full-body portrait. Face = Julie's actual face."""
    if not os.path.isfile(JULIE_FACE):
        print(f"ERROR: Julie face not found: {JULIE_FACE}", file=sys.stderr)
        return None

    try:
        import fal_client
    except ImportError:
        print("ERROR: pip install fal-client", file=sys.stderr)
        return None

    default_prompt = (
        "Professional insurance agent, standing in urban park, holding tablet, "
        "wearing teal blazer over white shirt, dark jeans, warm smile, "
        "natural lighting, photorealistic, high quality"
    )
    prompt = prompt or default_prompt

    print("Uploading Julie's face...")
    face_url = fal_client.upload_file(JULIE_FACE)
    print(f"Generating full portrait from Julie's face: {prompt[:60]}...")

    result = fal_client.subscribe(
        "fal-ai/flux-2-lora-gallery/face-to-full-portrait",
        arguments={
            "image_urls": [face_url],
            "prompt": prompt,
            "image_size": "portrait_4_3",
            "guidance_scale": 2.5,
            "num_inference_steps": 40,
        },
    )

    images = result.get("images", [])
    if not images:
        print("ERROR: No images in result", result, file=sys.stderr)
        return None
    url = images[0].get("url") if isinstance(images[0], dict) else images[0]

    os.makedirs(output_folder, exist_ok=True)
    out_path = os.path.join(output_folder, output_name)
    return download_image(url, out_path)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate Julie portrait from her real face")
    parser.add_argument("-p", "--prompt", default=None, help="Scene description for full body")
    parser.add_argument("-o", "--output", default="julie_portrait.png", help="Output filename")
    args = parser.parse_args()

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY not set.", file=sys.stderr)
        sys.exit(1)

    julie_face_to_portrait(prompt=args.prompt, output_name=args.output)
