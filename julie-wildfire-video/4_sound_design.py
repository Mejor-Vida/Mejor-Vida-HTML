#!/usr/bin/env python3
"""
STEP 4 (Optional): Add sound design - fire crackling, water spray.
Keeps voice as primary focus.

Requires: ffmpeg installed
Input: julie_wildfire_assembled.mp4
Output: julie_wildfire_final.mp4
"""
import os
import sys
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.join(SCRIPT_DIR, "julie_wildfire_assembled.mp4")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "julie_wildfire_final.mp4")

# Optional: paths to sound effects (user can add these)
FIRE_CRACKLE = os.path.join(SCRIPT_DIR, "assets", "fire_crackle.wav")
WATER_SPRAY = os.path.join(SCRIPT_DIR, "assets", "water_spray.wav")


def run(cmd, check=True):
    r = subprocess.run(cmd, shell=True)
    if check and r.returncode != 0:
        sys.exit(r.returncode)
    return r.returncode


def main():
    if not os.path.isfile(INPUT_PATH):
        print(f"ERROR: Run step 3 first. Expected: {INPUT_PATH}", file=sys.stderr)
        sys.exit(1)

    has_fire = os.path.isfile(FIRE_CRACKLE)
    has_water = os.path.isfile(WATER_SPRAY)

    if not has_fire and not has_water:
        print("⚠️  No sound effects found. Copy fire_crackle.wav and/or water_spray.wav to assets/")
        print("   Skipping sound design. Copying assembled video to final.")
        import shutil
        shutil.copy(INPUT_PATH, OUTPUT_PATH)
        print(f"✅ Output: {OUTPUT_PATH}")
        return

    # Mix: main audio + low-volume fire (throughout) + water (last ~10s)
    # Simplified: just add fire at low volume if available
    inputs = f"-i {INPUT_PATH!r}"
    filter_audio = "[0:a]"
    n = 1

    if has_fire:
        inputs += f" -i {FIRE_CRACKLE!r}"
        filter_audio = "[1:a]aloop=loop=-1:size=2e+09,volume=0.08[fire];[0:a][fire]amix=inputs=2:duration=shortest[a]"

    if has_water and not has_fire:
        inputs += f" -i {WATER_SPRAY!r}"
        filter_audio = "[0:a][1:a]amix=inputs=2:duration=shortest:weights=1 0.1[a]"

    cmd = (
        f"ffmpeg -y {inputs} "
        f"-filter_complex \"{filter_audio}\" -map 0:v -map \"[a]\" "
        f"-c:v copy -c:a aac -b:a 192k "
        f"{OUTPUT_PATH!r}"
    )

    print("🔊 Adding sound design...")
    run(cmd)
    print(f"\n✅ Step 4 complete. Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
