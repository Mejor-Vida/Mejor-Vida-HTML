#!/usr/bin/env python3
"""
Prepare Julie's photos for SDXL LoRA training.

1. Converts HEIC → JPEG (uses Mac sips if available, else skips)
2. Reads captions from captions.json (in same folder as photos)
3. Creates .txt caption file per image (Kohya format: image.jpg + image.txt)
4. Outputs a zip ready for training

Put captions.json in: ~/Desktop/lora-generated/julie-photos-lora/
Or use --captions to point to the template, edit it, then run again.

Usage:
  1. Copy tools/julie-photos-captions-template.json to ~/Desktop/lora-generated/julie-photos-lora/captions.json
  2. Edit captions.json - replace "DESCRIBE THIS IMAGE" with real descriptions
  3. python prepare_julie_sdxl_dataset.py
  4. Output: ~/Desktop/lora-generated/julie_sdxl_dataset.zip
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

PHOTOS_FOLDER = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated", "julie-photos-lora")
OUTPUT_ZIP = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated", "julie_sdxl_dataset.zip")
TRIGGER_WORD = "julie_mv"


def convert_heic_to_jpeg(folder: Path) -> list[Path]:
    """Convert HEIC to JPEG. Returns list of JPEG paths."""
    jpegs = []
    for p in folder.iterdir():
        if p.suffix.upper() in (".HEIC", ".HEIF"):
            jpg = p.with_suffix(".jpg")
            try:
                subprocess.run(["sips", "-s", "format", "jpeg", str(p), "--out", str(jpg)], check=True, capture_output=True)
                jpegs.append(jpg)
            except (subprocess.CalledProcessError, FileNotFoundError):
                print(f"  Skipping {p.name} (sips not available or failed)", file=sys.stderr)
    return jpegs


def load_captions(captions_path: Path) -> dict:
    """Load captions.json, strip _instructions."""
    with open(captions_path) as f:
        data = json.load(f)
    return {k: v for k, v in data.items() if not k.startswith("_")}


def main():
    parser = argparse.ArgumentParser(description="Prepare Julie SDXL LoRA dataset")
    parser.add_argument("--photos", default=PHOTOS_FOLDER, help="Folder with Julie photos")
    parser.add_argument("--captions", default=None, help="Path to captions.json (default: photos_folder/captions.json)")
    parser.add_argument("--output", default=OUTPUT_ZIP, help="Output zip path")
    parser.add_argument("--trigger", default=TRIGGER_WORD, help="Trigger word for LoRA")
    parser.add_argument("--skip-convert", action="store_true", help="Skip HEIC conversion (images already JPEG)")
    args = parser.parse_args()

    folder = Path(args.photos)
    if not folder.exists():
        print(f"ERROR: Photos folder not found: {folder}", file=sys.stderr)
        return 1

    captions_path = Path(args.captions) if args.captions else folder / "captions.json"
    if not captions_path.exists():
        # Copy template if it exists in tools/
        template = Path(__file__).parent / "julie-photos-captions-template.json"
        if template.exists():
            shutil.copy(template, folder / "captions.json")
            print(f"Created captions.json from template. Edit it with descriptions, then run again.")
            print(f"  Path: {folder / 'captions.json'}")
            return 1
        print(f"ERROR: captions.json not found. Create it in {folder}", file=sys.stderr)
        return 1

    captions = load_captions(captions_path)
    if not args.skip_convert:
        print("Converting HEIC to JPEG...")
        convert_heic_to_jpeg(folder)

    # Collect images and captions
    temp_dir = Path(args.output).parent / "_julie_dataset_temp"
    temp_dir.mkdir(parents=True, exist_ok=True)
    try:
        for ext in (".jpg", ".jpeg", ".png"):
            for img in folder.glob(f"*{ext}"):
                if img.name.startswith("."):
                    continue
                stem = img.stem
                caption = captions.get(stem, captions.get(img.name, ""))
                if "DESCRIBE" in caption or not caption.strip():
                    print(f"WARNING: No caption for {img.name} - using generic", file=sys.stderr)
                    caption = "woman, portrait"
                full_caption = f"{args.trigger}, {caption}".strip()

                dest_img = temp_dir / f"{stem}.jpg"
                if img.suffix.lower() != ".jpg":
                    shutil.copy(img, dest_img)
                else:
                    shutil.copy(img, dest_img)

                (temp_dir / f"{stem}.txt").write_text(full_caption, encoding="utf-8")

        # Zip
        print(f"Creating zip: {args.output}")
        with zipfile.ZipFile(args.output, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in temp_dir.iterdir():
                zf.write(f, f.name)
        print(f"Done. Dataset: {args.output}")
        print(f"  Images with captions: {len(list(temp_dir.glob('*.jpg')))}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

    return 0


if __name__ == "__main__":
    sys.exit(main())
