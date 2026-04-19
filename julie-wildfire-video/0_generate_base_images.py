#!/usr/bin/env python3
"""
STEP 0 (Optional): Generate Julie firefighter base image for video clips.
Calls project's tools/generate_julie_images.py, then copies to assets/.

Run from project root: python julie-wildfire-video/0_generate_base_images.py
Output: assets/julie_firefighter_base.png
"""
import os
import sys
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ASSETS_DIR = os.path.join(SCRIPT_DIR, "assets")
TOOLS_DIR = os.path.join(PROJECT_DIR, "tools")

# Load .env.local
_env_path = os.path.join(PROJECT_DIR, ".env.local")
if os.path.isfile(_env_path):
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

os.makedirs(ASSETS_DIR, exist_ok=True)

# Default output folder for generate_julie_images
DESKTOP_OUTPUT = os.path.join(os.path.expanduser("~"), "Desktop", "lora-generated")


def main():
    sys.path.insert(0, TOOLS_DIR)
    try:
        from generate_julie_images import generate_julie_frame, JULIE_FACE_REFERENCE
    except ImportError:
        print("ERROR: Run from project root. tools/generate_julie_images.py not found.", file=sys.stderr)
        sys.exit(1)

    face_ref = JULIE_FACE_REFERENCE if os.path.isfile(JULIE_FACE_REFERENCE) else None
    if not face_ref or not os.path.isfile(face_ref):
        print("ERROR: Julie face reference not found:", JULIE_FACE_REFERENCE, file=sys.stderr)
        sys.exit(1)

    action = (
        "3D Pixar-style female firefighter standing in street, "
        "holding fire hose with nozzle and lever, calm expression, facing camera, "
        "wildfire softly burning in background, cinematic animated lighting"
    )

    print("🎨 Generating Julie firefighter base image...")
    result = generate_julie_frame(action, "julie_firefighter_base.png", face_reference=face_ref, strength=0.35)
    if not result:
        sys.exit(1)

    # Result is filepath from download_image (Desktop/lora-generated/); copy to assets
    src = result if isinstance(result, str) and os.path.isfile(result) else None
    if not src:
        src = os.path.join(DESKTOP_OUTPUT, "julie_firefighter_base.png")
    if src and os.path.isfile(src):
        dst = os.path.join(ASSETS_DIR, "julie_firefighter_base.png")
        shutil.copy(src, dst)
        print(f"✅ Copied to: {dst}")

    print("\n✅ Step 0 complete. Base image in assets/")
