#!/usr/bin/env python3
"""
Prepare Julie's close-up face photos for LoRA training.

1. Converts HEIC → JPEG (Mac sips)
2. Creates simple, consistent captions (face-focused, minimal variation)
3. Outputs zip for flux-lora-fast-training

Face-focused captions: same structure, slight variation for pose/angle.
Keeps training focused on face identity.

Usage:
  python prepare_julie_closeup_dataset.py
  python prepare_julie_closeup_dataset.py --photos /path/to/Julie-photos-close-up
"""
import argparse
import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

PHOTOS_FOLDER = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated", "Julie-photos-close-up")
OUTPUT_ZIP = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated", "julie_closeup_dataset.zip")
TRIGGER = "julie_mv"

# Simple face-focused captions. Minimal variation = stronger face learning.
FACE_CAPTIONS = [
    "portrait, close-up, face, woman, looking at camera",
    "portrait, face, woman, headshot",
    "close-up portrait, woman, face",
    "woman, face, portrait, headshot",
]


def convert_heic_to_jpeg(folder: Path) -> list[Path]:
    """Convert HEIC to JPEG. Returns list of JPEG paths."""
    jpegs = []
    for p in sorted(folder.iterdir()):
        if p.suffix.upper() in (".HEIC", ".HEIF"):
            jpg = p.with_suffix(".jpg")
            try:
                subprocess.run(
                    ["sips", "-s", "format", "jpeg", str(p), "--out", str(jpg)],
                    check=True, capture_output=True
                )
                jpegs.append(jpg)
                print(f"  {p.name} → {jpg.name}")
            except (subprocess.CalledProcessError, FileNotFoundError):
                print(f"  Skipping {p.name} (sips failed)", file=sys.stderr)
    return jpegs


def main():
    parser = argparse.ArgumentParser(description="Prepare Julie close-up face dataset for LoRA")
    parser.add_argument("--photos", default=PHOTOS_FOLDER, help="Photos folder")
    parser.add_argument("--output", default=OUTPUT_ZIP, help="Output zip path")
    parser.add_argument("--trigger", default=TRIGGER, help="Trigger word")
    args = parser.parse_args()

    folder = Path(args.photos)
    if not folder.exists():
        print(f"ERROR: Folder not found: {folder}", file=sys.stderr)
        return 1

    print("Converting HEIC to JPEG...")
    jpegs = convert_heic_to_jpeg(folder)

    # Collect all images (jpg, png)
    images = list(folder.glob("*.jpg")) + list(folder.glob("*.jpeg")) + list(folder.glob("*.png"))
    images = [p for p in images if not p.name.startswith(".")]
    images = sorted(images, key=lambda p: p.name)

    if not images:
        print("ERROR: No images found.", file=sys.stderr)
        return 1

    print(f"\nFound {len(images)} images. Creating dataset...")

    temp_dir = Path(args.output).parent / "_julie_closeup_temp"
    temp_dir.mkdir(parents=True, exist_ok=True)

    try:
        for i, img in enumerate(images):
            stem = img.stem
            caption = FACE_CAPTIONS[i % len(FACE_CAPTIONS)]
            full_caption = f"{args.trigger}, {caption}"

            dest_img = temp_dir / f"{stem}.jpg"
            if img.suffix.lower() in (".jpg", ".jpeg"):
                shutil.copy(img, dest_img)
            else:
                # Convert png to jpg if needed
                try:
                    subprocess.run(["sips", "-s", "format", "jpeg", str(img), "--out", str(dest_img)], check=True, capture_output=True)
                except Exception:
                    shutil.copy(img, dest_img)

            (temp_dir / f"{stem}.txt").write_text(full_caption, encoding="utf-8")

        print(f"Creating zip: {args.output}")
        with zipfile.ZipFile(args.output, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in temp_dir.iterdir():
                zf.write(f, f.name)

        print(f"✅ Done. {len(images)} images, {args.output}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

    return 0


if __name__ == "__main__":
    sys.exit(main())
