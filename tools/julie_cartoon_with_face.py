#!/usr/bin/env python3
"""
Julie Cartoon with Face — best pipeline for cartoon Julie.

Body: heavier set, teal blazer, park (julie_cartoon_body_reference.png).
Face: Julie.png (default) for best likeness.

Pipeline:
  1. Face: Julie.png (or LoRA with --use-lora)
  2. Face swap: Easel (user_hair=Julie's hair for better likeness, detailer)
  3. Style transfer: cartoon_3d (or --style cartoon_animation, hand_drawn_animation)

Requires: FAL_KEY
Output: Desktop/lora-generated/ and img/
"""
import os
import sys

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JULIE_PNG = os.path.join(_project_root, "img", "Julie.png")
# Body reference: heavier set, teal blazer, park—matches Julie's actual body type
CARTOON_BODY = os.path.join(_project_root, "img", "julie_cartoon_body_reference.png")
output_folder = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")
LORA_PATH = os.path.join(output_folder, "julie_mv_real.safetensors")  # trained on 22 real photos


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


def face_swap(face_url, target_url, workflow_type="user_hair"):
    """Swap Julie's face onto cartoon. user_hair=preserve Julie's hair (better likeness)."""
    import fal_client
    for name, fn in [
        ("fal-ai/face-swap", lambda: fal_client.subscribe(
            "fal-ai/face-swap",
            arguments={"swap_image_url": face_url, "base_image_url": target_url},
        )),
        ("easel-ai", lambda: fal_client.subscribe(
            "easel-ai/advanced-face-swap",
            arguments={
                "face_image_0": face_url,
                "target_image": target_url,
                "gender_0": "female",
                "workflow_type": workflow_type,  # user_hair=Julie's hair (better likeness)
                "upscale": True,
                "detailer": True,
            },
        )),
    ]:
        try:
            print(f"Trying {name} face swap...")
            result = fn()
            img = result.get("image")
            url = img.get("url") if isinstance(img, dict) else None
            if url:
                return url
        except Exception as e:
            print(f"  {name} failed: {e}")
            continue
    return None


def style_transfer_cartoon(image_url, target_style="cartoon_3d"):
    """Blend face into cartoon style. Style transfer preserves identity (cartoonify can change subject)."""
    import fal_client
    result = fal_client.subscribe(
        "fal-ai/image-apps-v2/style-transfer",
        arguments={"image_url": image_url, "target_style": target_style},
    )
    images = result.get("images", [])
    if images:
        url = images[0].get("url") if isinstance(images[0], dict) else images[0]
        return url
    return None


def generate_julie_lora():
    """Generate Julie's face using LoRA (trained on 22 photos). Returns image URL."""
    import fal_client
    lora_url = fal_client.upload_file(LORA_PATH)
    result = fal_client.subscribe(
        "fal-ai/flux-lora",
        arguments={
            "prompt": "julie_mv, portrait, face, looking at camera, friendly smile",
            "loras": [{"path": lora_url, "scale": 1.2}],
            "image_size": "square_hd",
            "num_inference_steps": 28,
            "guidance_scale": 3.5,
        },
    )
    images = result.get("images", [])
    if not images:
        return None
    url = images[0].get("url") if isinstance(images[0], dict) else images[0]
    return url


def main(cartoonify_result=True, output_name="julie_cartoon_with_face.png", use_lora=False, workflow_type="user_hair", style="cartoon_3d"):
    if use_lora and not os.path.isfile(LORA_PATH):
        print(f"ERROR: LoRA not found: {LORA_PATH}", file=sys.stderr)
        return None
    if not use_lora and not os.path.isfile(JULIE_PNG):
        print(f"ERROR: Julie.png not found: {JULIE_PNG}", file=sys.stderr)
        return None
    if not os.path.isfile(CARTOON_BODY):
        print(f"ERROR: Cartoon body reference not found: {CARTOON_BODY}", file=sys.stderr)
        print("  Use the image with Julie's body type (heavier set, teal blazer, park).", file=sys.stderr)
        return None

    try:
        import fal_client
    except ImportError:
        print("ERROR: pip install fal-client", file=sys.stderr)
        return None

    if use_lora:
        print("Step 1: Generating Julie's face with LoRA (from 22 training photos)...")
        face_url = generate_julie_lora()
        if not face_url:
            print("ERROR: LoRA generation failed.", file=sys.stderr)
            return None
    else:
        print("Step 1: Using Julie.png as face source...")
        face_url = fal_client.upload_file(JULIE_PNG)

    print("Step 2: Face swap onto cartoon body...")
    target_url = fal_client.upload_file(CARTOON_BODY)

    swapped_url = face_swap(face_url, target_url, workflow_type=workflow_type)
    if not swapped_url:
        print("ERROR: Face swap failed.", file=sys.stderr)
        return None

    # Save to Desktop/lora-generated/
    os.makedirs(output_folder, exist_ok=True)
    swapped_path = os.path.join(output_folder, "julie_face_swapped.png")
    download_image(swapped_url, swapped_path)

    current_url = swapped_url
    if cartoonify_result:
        print("Step 3: Style transfer to blend face into cartoon...")
        cartoon_url = style_transfer_cartoon(swapped_url, target_style=style)
        if cartoon_url:
            current_url = cartoon_url
        else:
            print("  Style transfer failed, using face-swapped result.")

    out_path = os.path.join(output_folder, output_name)
    result_path = download_image(current_url, out_path)
    if result_path:
        # Copy to img/ for site use
        img_path = os.path.join(_project_root, "img", output_name)
        download_image(current_url, img_path)
    return result_path


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Julie's LoRA face on cartoon body (heavier set, teal blazer)")
    parser.add_argument("--no-blend", action="store_true", help="Skip style transfer (keep face-swap only)")
    parser.add_argument("--use-lora", action="store_true", help="Use LoRA for face (default: Julie.png for better likeness)")
    parser.add_argument("--workflow", default="user_hair", choices=["user_hair", "target_hair"],
        help="user_hair=Julie's hair (better likeness). target_hair=cartoon hair.")
    parser.add_argument("--style", default="cartoon_3d", choices=["cartoon_3d", "cartoon_animation", "hand_drawn_animation"],
        help="Style transfer: cartoon_3d, cartoon_animation, hand_drawn_animation")
    parser.add_argument("-o", "--output", default="julie_cartoon_with_face.png", help="Output filename")
    args = parser.parse_args()

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY not set.", file=sys.stderr)
        sys.exit(1)

    main(
        cartoonify_result=not args.no_blend,
        output_name=args.output,
        use_lora=args.use_lora,
        workflow_type=args.workflow,
        style=args.style,
    )
