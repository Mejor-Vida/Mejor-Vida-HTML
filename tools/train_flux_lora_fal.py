#!/usr/bin/env python3
"""
Train a FLUX LoRA on fal.ai serverless GPUs.

Uses fal-ai/flux-lora-fast-training (~10x faster, ~$2/run) instead of the
more expensive flux-lora-general-training.

Uploads the dataset zip, starts training, and downloads the resulting .safetensors file.

Requires: FAL_KEY environment variable
Usage:
  python train_flux_lora_fal.py
  python train_flux_lora_fal.py --dataset LoRA-Training-Individual-clean.zip
"""
from __future__ import annotations

import argparse
import os
import sys
import urllib.request
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Train FLUX LoRA on fal.ai")
    parser.add_argument(
        "--dataset",
        default=os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated", "julie_sdxl_dataset.zip"),
        help="Path to dataset zip file",
    )
    parser.add_argument(
        "--output",
        default=os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated", "julie_mv_real.safetensors"),
        help="Output filename for downloaded LoRA weights",
    )
    parser.add_argument(
        "--trigger-word",
        default="julie_mv",
        help="Trigger word for the LoRA",
    )
    parser.add_argument(
        "--steps",
        type=int,
        default=1000,
        help="Training steps (default: 1000)",
    )
    args = parser.parse_args()

    if not os.environ.get("FAL_KEY"):
        print("ERROR: FAL_KEY environment variable is not set.", file=sys.stderr)
        return 1

    dataset_path = Path(args.dataset)
    if not dataset_path.exists():
        print(f"ERROR: Dataset not found: {dataset_path}", file=sys.stderr)
        return 1

    try:
        import fal_client
    except ImportError:
        print("ERROR: fal-client is required. Install with: pip install fal-client", file=sys.stderr)
        return 1

    print("Uploading dataset...")
    images_url = fal_client.upload_file(str(dataset_path))
    print(f"  Uploaded to: {images_url[:80]}...")

    print("\nStarting FLUX LoRA fast training on fal.ai (flux-lora-fast-training)...")
    print("  trigger_word:", args.trigger_word)
    print("  steps:", args.steps)

    def on_queue_update(update):
        if hasattr(update, "logs") and update.logs:
            for log in update.logs:
                msg = log.get("message", str(log)) if isinstance(log, dict) else str(log)
                print(f"  [train] {msg}")

    result = fal_client.subscribe(
        "fal-ai/flux-lora-fast-training",
        arguments={
            "images_data_url": images_url,
            "trigger_word": args.trigger_word,
            "steps": args.steps,
        },
        with_logs=True,
        on_queue_update=on_queue_update,
    )

    lora_file = result.get("diffusers_lora_file")
    if not lora_file:
        print("ERROR: No diffusers_lora_file in result.", file=sys.stderr)
        print(result, file=sys.stderr)
        return 1

    url = lora_file.get("url") if isinstance(lora_file, dict) else getattr(lora_file, "url", None)
    if not url:
        print("ERROR: No URL in diffusers_lora_file.", file=sys.stderr)
        print(lora_file, file=sys.stderr)
        return 1

    print(f"\nDownloading LoRA weights from {url[:60]}...")
    output_path = Path(args.output)
    urllib.request.urlretrieve(url, output_path)
    print(f"Saved to: {output_path.resolve()}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
