#!/usr/bin/env python3
"""
Generate an accurate image of Julie using the LoRA (trained on 22 photos).

LoRA only—no Julie.png. Text-to-image.
Output: Desktop/lora-generated/

Requires: FAL_KEY
"""
import argparse
import os
import sys

output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
LORA_PATH = os.path.join(output_folder, "julie_mv_face.safetensors")  # face-focused LoRA

# Accurate Julie: wide shot, park, professional business attire. julie_mv first for stronger face lock.
JULIE_PROMPT = (
    "julie_mv, wide shot environmental portrait, full body visible from a distance. "
    "Joyful 40-year-old woman, medium build, straight waist. "
    "Standing in a sun-drenched park, trees and green grass in background. "
    "Professional business attire, tailored blazer, crisp blouse, polished look. "
    "High-contrast saturated colors, warm golden hour lighting. "
    "Masterpiece, sharp focus, professional 8k photography, realistic skin texture"
)


def main():
    parser = argparse.ArgumentParser(description="Generate Julie with LoRA")
    parser.add_argument("-o", "--output", default="julie_mv_base.png", help="Output filename")
    parser.add_argument("--prompt", default=None, help="Override prompt (must include julie_mv)")
    parser.add_argument("--lora-scale", type=float, default=1.35, help="LoRA strength (higher=stronger face, default 1.35)")
    args = parser.parse_args()

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY not set.", file=sys.stderr)
        return 1

    if not os.path.isfile(LORA_PATH):
        print(f"ERROR: LoRA not found: {LORA_PATH}", file=sys.stderr)
        return 1

    try:
        import fal_client
        import requests
    except ImportError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    prompt = args.prompt or JULIE_PROMPT
    if "julie_mv" not in prompt:
        print("WARNING: Prompt should include julie_mv for LoRA trigger.", file=sys.stderr)

    print("Uploading LoRA...")
    lora_url = fal_client.upload_file(LORA_PATH)

    print("Generating (LoRA only, no Julie.png)...")
    result = fal_client.subscribe(
        "fal-ai/flux-lora",
        arguments={
            "prompt": prompt,
            "loras": [{"path": lora_url, "scale": args.lora_scale}],
            "image_size": "portrait_4_3",
            "num_inference_steps": 28,
            "guidance_scale": 3.5,
        },
    )

    images = result.get("images", [])
    if not images:
        print("ERROR: No images in result.", file=sys.stderr)
        return 1

    url = images[0].get("url") if isinstance(images[0], dict) else images[0]
    out_path = os.path.join(output_folder, args.output)

    resp = requests.get(url)
    if resp.status_code == 200:
        with open(out_path, "wb") as f:
            f.write(resp.content)
        print(f"✅ Saved: {out_path}")
        return 0

    print("ERROR: Failed to download image.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
