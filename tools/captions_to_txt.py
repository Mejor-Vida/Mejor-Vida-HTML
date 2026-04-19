#!/usr/bin/env python3
"""
Read captions.json and create one .txt file per entry.

Each .txt file is named exactly like the corresponding image (e.g., IMG_4014.txt)
and contains the description with the trigger word prepended if not already there.

Usage:
  python captions_to_txt.py
  python captions_to_txt.py --captions path/to/captions.json --trigger julie_mv --output-dir path/to/folder
"""
import argparse
import json
import os
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Create .txt caption files from captions.json")
    parser.add_argument(
        "--captions",
        default=None,
        help="Path to captions.json (default: same dir as script or --output-dir)",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Directory to write .txt files (default: same dir as captions.json)",
    )
    parser.add_argument(
        "--trigger",
        default="julie_mv",
        help="Trigger word to prepend to each description",
    )
    args = parser.parse_args()

    # Resolve captions path
    if args.captions:
        captions_path = Path(args.captions)
    else:
        # Default: julie-photos-lora folder
        captions_path = Path(
            os.path.expanduser("~"),
            "Desktop",
            "lora-generated",
            "julie-photos-lora",
            "captions.json",
        )

    if not captions_path.exists():
        print(f"ERROR: captions.json not found: {captions_path}", file=sys.stderr)
        return 1

    output_dir = Path(args.output_dir) if args.output_dir else captions_path.parent
    output_dir.mkdir(parents=True, exist_ok=True)

    with open(captions_path) as f:
        data = json.load(f)

    trigger = args.trigger.strip()
    trigger_prefix = f"{trigger}, "
    count = 0

    for key, description in data.items():
        if key.startswith("_"):
            continue
        if not isinstance(description, str) or not description.strip():
            print(f"  Skipping empty: {key}", file=sys.stderr)
            continue

        desc = description.strip()
        t = trigger.lower()
        if not (desc.lower().startswith(t + ",") or desc.lower().startswith(t + " ")):
            desc = trigger_prefix + desc

        txt_path = output_dir / f"{key}.txt"
        txt_path.write_text(desc, encoding="utf-8")
        count += 1
        print(f"  {txt_path.name}")

    print(f"\nCreated {count} .txt files in {output_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
