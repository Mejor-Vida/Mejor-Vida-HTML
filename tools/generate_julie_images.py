#!/usr/bin/env python3
"""
Generate Julie images using fal.ai Flux + your trained LoRA.

Uses fal-ai/flux-krea-lora/image-to-image with Julie.png as face reference
for more realistic facial detail, plus your julie_mv LoRA for body/style.

Requires: FAL_KEY environment variable
Output: Desktop/lora-generated/
"""
import os
import sys

# 1. OUTPUT FOLDER - Desktop/lora-generated/
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")

if not os.path.exists(output_folder):
    os.makedirs(output_folder, exist_ok=True)
    print(f"📁 Created folder: {output_folder}")

# 2. FACE REFERENCE - Julie.png for realistic face detail (uploaded at runtime)
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JULIE_FACE_REFERENCE = os.path.join(_project_root, "img", "Julie.png")

# Legacy blueprint URL (optional fallback)
JULIE_BLUEPRINT_URL = "https://v3b.fal.media/files/b/0a91f2d1/naqfWKkqsIfmQrqOXyFqR_3f7b7ce173ed4cd0b40115f5669e88aa.jpg"
JULIE_SEED = 14899673160477886000

# 3. LORA - Both in ~/Desktop/lora-generated/
JULIE_CARTOON_LORA = os.path.join(output_folder, "julie_mv_cartoon.safetensors")  # trained on cartoon chars
JULIE_LORA_URL = "https://v3b.fal.media/files/b/0a91d18b/aGMqlhgegjqfypTEXMGpc_lora.safetensors"


def download_image(url, filename):
    """Downloads the image from fal.ai to your Desktop folder"""
    try:
        import requests
    except ImportError:
        print("ERROR: requests required. pip install requests", file=sys.stderr)
        return None

    response = requests.get(url)
    if response.status_code == 200:
        filepath = os.path.join(output_folder, filename)
        with open(filepath, "wb") as f:
            f.write(response.content)
        print(f"✅ Saved: {filepath}")
        return filepath
    return None


def generate_julie_frame(action_description, file_name, lora_url=None, face_reference=None, strength=0.4):
    """Generate a Julie image. Uses Julie.png as face reference for more realistic facial detail.
    strength: lower (0.3-0.4) preserves more face detail, higher (0.5-0.6) more stylized."""
    base_identity = (
        "julie_mv, professional insurance agent, flat 2D cartoon illustration, "
        "large breasts, some belly, straight waist, thin legs, no hips"
    )
    full_prompt = f"{base_identity}, {action_description}"

    print(f"🎬 Generating Julie: {action_description}...")

    try:
        import fal_client
    except ImportError:
        print("ERROR: fal-client required. pip install fal-client", file=sys.stderr)
        return None

    # Face reference: Julie.png for realistic face, or blueprint URL
    image_url = face_reference or JULIE_BLUEPRINT_URL
    if image_url and os.path.isfile(image_url):
        image_url = fal_client.upload_file(image_url)
        print(f"  Uploaded face reference: {image_url[:50]}...")

    lora_path = lora_url or (JULIE_CARTOON_LORA if os.path.isfile(JULIE_CARTOON_LORA) else JULIE_LORA_URL)
    if lora_path and os.path.isfile(lora_path):
        lora_path = fal_client.upload_file(lora_path)
        print(f"  Uploaded LoRA: {lora_path[:50]}...")

    result = fal_client.subscribe(
        "fal-ai/flux-krea-lora/image-to-image",
        arguments={
            "image_url": image_url,
            "prompt": full_prompt,
            "seed": JULIE_SEED,
            "loras": [{"path": lora_path, "scale": 1.0}],
            "strength": strength,
            "guidance_scale": 3.5,
            "num_inference_steps": 28,
        },
    )

    url = result["images"][0]["url"]
    return download_image(url, file_name)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate Julie images with fal.ai + LoRA")
    parser.add_argument("--action", default="smiling and waving", help="Action/pose description")
    parser.add_argument("--output", default="julie_wave.jpg", help="Output filename")
    parser.add_argument("--lora", default=None, help="LoRA URL or path to .safetensors (default: JULIE_LORA_URL)")
    parser.add_argument("--face", default=None, help="Face reference image path (default: img/Julie.png for realistic face)")
    parser.add_argument("--strength", type=float, default=0.4, help="Img2img strength: 0.3-0.4 preserves face, 0.5+ more stylized")
    args = parser.parse_args()

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    face_ref = args.face or (JULIE_FACE_REFERENCE if os.path.isfile(JULIE_FACE_REFERENCE) else None)
    generate_julie_frame(
        args.action,
        args.output,
        lora_url=args.lora,
        face_reference=face_ref,
        strength=args.strength,
    )
