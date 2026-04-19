#!/usr/bin/env python3
"""
Train SDXL LoRA on Julie's photos (fal.ai).

Uses the dataset zip from prepare_julie_sdxl_dataset.py.
Uses fal-ai/train-lora with SDXL - only requires FAL_KEY.

Requires: FAL_KEY
Usage:
  1. Run prepare_julie_sdxl_dataset.py first (after editing captions.json)
  2. python train_sdxl_lora_julie.py
"""
import argparse
import os
import sys
import urllib.request
from pathlib import Path

DATASET_ZIP = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated", "julie_sdxl_dataset.zip")
OUTPUT_LORA = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated", "julie_mv_sdxl.safetensors")


def main():
    parser = argparse.ArgumentParser(description="Train SDXL LoRA on Julie (fal.ai)")
    parser.add_argument("--dataset", default=DATASET_ZIP, help="Path to dataset zip")
    parser.add_argument("--output", default=OUTPUT_LORA, help="Output LoRA path")
    parser.add_argument("--trigger", default="julie_mv", help="Trigger word for LoRA")
    parser.add_argument("--steps", type=int, default=100, help="Training steps (default 100 for fal train-lora)")
    args = parser.parse_args()

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY not set.", file=sys.stderr)
        return 1

    zip_path = Path(args.dataset)
    if not zip_path.exists():
        print(f"ERROR: Dataset not found: {zip_path}", file=sys.stderr)
        print("Run prepare_julie_sdxl_dataset.py first", file=sys.stderr)
        return 1

    try:
        import fal_client
    except ImportError:
        print("ERROR: pip install fal-client", file=sys.stderr)
        return 1

    print("Uploading dataset to fal.ai...")
    train_url = fal_client.upload_file(str(zip_path))
    print(f"  Uploaded: {train_url[:60]}...")

    instance_prompt = f"a photo of {args.trigger}, woman"
    print("\nStarting SDXL LoRA training (fal-ai/train-lora)...")
    print("  instance_prompt:", instance_prompt)
    print("  steps:", args.steps)

    result = fal_client.subscribe(
        "fal-ai/train-lora",
        arguments={
            "train_images_url": train_url,
            "instance_prompt": instance_prompt,
            "model_name": "stabilityai/stable-diffusion-xl-base-1.0",
            "model_architecture": "sdxl",
            "max_training_steps": args.steps,
        },
    )

    weights = result.get("weights_file")
    if not weights:
        print("ERROR: No weights_file in result.", file=sys.stderr)
        print(result, file=sys.stderr)
        return 1

    url = weights.get("url") if isinstance(weights, dict) else getattr(weights, "url", None)
    if not url:
        print("ERROR: No URL in weights_file.", file=sys.stderr)
        return 1

    print(f"\nDownloading LoRA: {url[:60]}...")
    urllib.request.urlretrieve(url, args.output)
    print(f"Saved: {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
