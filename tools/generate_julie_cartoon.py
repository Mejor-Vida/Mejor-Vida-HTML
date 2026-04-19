#!/usr/bin/env python3
"""
Generate cartoon Julie: Flux LoRA (Julie likeness) → fal.ai style transfer (cartoon style).

Flux is photorealistic by design—prompts can't make it cartoon. Cartoonify often
changes the subject (e.g. Julie → old man). Style transfer preserves identity.

Pipeline:
  1. Generate Julie with your trained LoRA (gets her face/likeness)
  2. Run result through fal-ai/image-apps-v2/style-transfer (cartoon_3d or cartoon_animation)

Output: Desktop/lora-generated/julie_mv_cartoon.png

Requires: FAL_KEY
"""
import os
import sys

output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
LORA_PATH = os.path.join(output_folder, "julie_mv_real.safetensors")  # trained on 22 real photos


def main():
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

    os.makedirs(output_folder, exist_ok=True)

    # Step 1: Generate Julie with Flux LoRA (photorealistic)
    # Explicit body/age: 40, heavier set, belly (LoRA tends to idealize otherwise)
    prompt = "julie_mv, 40 year old woman, heavier set, full figured, belly, middle aged, full body standing, looking at camera, friendly smile"
    print("Step 1: Generating Julie with LoRA (Flux)...")
    lora_url = fal_client.upload_file(LORA_PATH)
    result = fal_client.subscribe(
        "fal-ai/flux-lora",
        arguments={
            "prompt": prompt,
            "loras": [{"path": lora_url, "scale": 1.2}],
            "image_size": "portrait_4_3",
            "num_inference_steps": 28,
            "guidance_scale": 3.5,
        },
    )

    images = result.get("images", [])
    if not images:
        print("ERROR: No images from Flux.", file=sys.stderr)
        return 1

    flux_url = images[0].get("url") if isinstance(images[0], dict) else images[0]
    print("  ✓ Julie generated")

    # Step 2: Style transfer (preserves Julie; cartoonify often changes the subject)
    print("Step 2: Applying cartoon style transfer (preserves identity)...")
    cartoon_result = fal_client.subscribe(
        "fal-ai/image-apps-v2/style-transfer",
        arguments={
            "image_url": flux_url,
            "target_style": "cartoon_3d",  # or cartoon_animation, hand_drawn_animation
        },
    )

    cartoon_images = cartoon_result.get("images", [])
    if not cartoon_images:
        print("ERROR: Cartoonify failed.", file=sys.stderr)
        return 1

    cartoon_url = cartoon_images[0].get("url") if isinstance(cartoon_images[0], dict) else cartoon_images[0]

    # Save
    out_path = os.path.join(output_folder, "julie_mv_cartoon.png")
    resp = requests.get(cartoon_url)
    if resp.status_code == 200:
        with open(out_path, "wb") as f:
            f.write(resp.content)
        print(f"✅ Saved: {out_path}")
        return 0

    print("ERROR: Failed to download cartoon image.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
